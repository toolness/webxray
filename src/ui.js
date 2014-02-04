(function(jQuery) {
  "use strict";

  var $ = jQuery;

  function addHelpButton(hud, input) {
    var help = $('<div class="webxray-base webxray-help">?</div>');
    help.click(input.showKeyboardHelp);    
    $(hud.overlayContainer).append(help);
  }

  // If the user has made changes to the page, we don't want them
  // to be able to navigate away from it without facing a modal
  // dialog.
  function ModalUnloadBlocker(commandManager, cb) {
    function beforeUnload(event) {
      if (commandManager.canUndo()) {
        cb();
        
        // Since we are saving the user's work before they leave and
        // auto-restoring it if they come back, don't bother them
        // with a modal dialog.
        
        //event.preventDefault();
        //return jQuery.locale.get("input:unload-blocked");
      }
    }

    window.addEventListener("beforeunload", beforeUnload, true);

    return {
      unload: function() {
        window.removeEventListener("beforeunload", beforeUnload, true);
      }
    };
  }
  
  function canBeTouched() {
    return true;
    return ('ontouchstart' in window);
  }
  
  jQuery.extend({
    xRayUI: function xRayUI(options) {
      var isUnloaded = false;
      var hud = jQuery.hudOverlay();
      var focused = jQuery.focusedOverlay({
        useAnimation: true
      });
      var commandManager = jQuery.commandManager();
      var mixMaster = jQuery.mixMaster({
        hud: hud,
        focusedOverlay: focused,
        commandManager: commandManager
      });
      var persistence = jQuery.commandManagerPersistence(commandManager);
      var mouseMonitor = jQuery.mouseMonitor();
      var styleInfo = jQuery.styleInfoOverlay({
        focused: focused,
        commandManager: commandManager,
        mouseMonitor: mouseMonitor
      });
      var input = jQuery.xRayInput({
        focusedOverlay: focused,
        styleInfoOverlay: styleInfo,
        mixMaster: mixMaster,
        commandManager: commandManager,
        persistence: persistence,
        eventSource: options.eventSource,
        onQuit: function() {
          self.emit('quit');
        }
      });
      var touchToolbar = canBeTouched() ? jQuery.touchToolbar(input) : null;
      var indicator = jQuery.blurIndicator(input, window);
      var modalUnloadBlocker = ModalUnloadBlocker(commandManager,
                                                  saveRecording);
      var RECORDING_KEY = "recording-" + window.location.href;

      function saveRecording() {
        // Store emergency rescue data for 5 minutes.
        var RECORDING_PERSIST_TIME = 5 * 60;

        if (commandManager.canUndo()) {
          var recording = commandManager.getRecording();
          lscache.set(RECORDING_KEY, JSON.parse(recording),
                      RECORDING_PERSIST_TIME);
        } else
          lscache.remove(RECORDING_KEY);
      }

      var self = jQuery.eventEmitter({
        persistence: persistence,
        start: function() {
          persistence.loadHistoryFromDOM();
          addHelpButton(hud, input);
          $(document.body).append(hud.overlayContainer);
          focused.on('change', hud.onFocusChange);
          input.activate();
          $(window).focus();
          if (!commandManager.canUndo()) {
            // See if we can emergency-restore the user's previous session.
            var recording = lscache.get(RECORDING_KEY);
            if (recording)
              try {
                commandManager.playRecording(JSON.stringify(recording));
              } catch (e) {
                // Corrupt recording, or page has changed in a way
                // that we can't replay the recording, so get rid of it.
                lscache.remove(RECORDING_KEY);
                if (window.console && window.console.error)
                  console.error(e);
              }
          }
        },
        unload: function() {
          if (!isUnloaded) {
            isUnloaded = true;
            saveRecording();
            focused.destroy();
            focused = null;
            input.deactivate();
            input = null;
            if (touchToolbar) {
              touchToolbar.unload();
              touchToolbar = null;
            }
            hud.destroy();
            hud = null;
            styleInfo.destroy();
            styleInfo = null;
            indicator = null;
            mouseMonitor.unload();
            mouseMonitor = null;
            modalUnloadBlocker.unload();
            modalUnloadBlocker = null;
          }
        },

        // These exports are primarily for use by third-party code.
        jQuery: jQuery,
        focusedOverlay: focused,
        hudOverlay: hud,
        mixMaster: mixMaster,
        styleInfoOverlay: styleInfo,
        commandManager: commandManager,
        input: input,
        modalUnloadBlocker: modalUnloadBlocker
      });

      return self;
    }
  });
})(jQuery);