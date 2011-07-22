(function(jQuery) {
  "use strict";

  var $ = jQuery;

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
      var indicator = jQuery.blurIndicator(input, window);

      var self = jQuery.eventEmitter({
        persistence: persistence,
        start: function() {
          persistence.loadHistoryFromDOM();
          $(document.body).append(hud.overlay);
          focused.on('change', hud.onFocusChange);
          input.activate();
          $(window).focus();
        },
        unload: function() {
          if (!isUnloaded) {
            isUnloaded = true;
            focused.destroy();
            focused = null;
            input.deactivate();
            input = null;
            hud.destroy();
            hud = null;
            styleInfo.destroy();
            styleInfo = null;
            indicator = null;
            mouseMonitor.unload();
            mouseMonitor = null;
          }
        },

        // These exports are primarily for use by third-party code.
        jQuery: jQuery,
        focusedOverlay: focused,
        hudOverlay: hud,
        mixMaster: mixMaster,
        styleInfoOverlay: styleInfo,
        commandManager: commandManager,
        input: input
      });

      return self;
    }
  });
})(jQuery);