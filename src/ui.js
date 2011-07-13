(function(jQuery) {
  "use strict";

  var $ = jQuery;

  function maybeLoadRecording(persistence) {
    if (persistence.isRecordingInGlobal(window)) {
      var msg,
          success = persistence.playRecordingFromGlobal(window);
      if (success)
        msg = jQuery.locale.get('hack-recording-playback:success');
      else
        msg = jQuery.locale.get('hack-recording-playback:failure');
      jQuery.transparentMessage($('<div></div>').text(msg));
    }
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
      var styleInfo = jQuery.styleInfoOverlay({
        focused: focused,
        commandManager: commandManager
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

      maybeLoadRecording(persistence);
      persistence.loadHistoryFromDOM();
      $(document.body).append(hud.overlay);
      focused.on('change', hud.onFocusChange);
      input.activate();
      $(window).focus();

      var self = jQuery.eventEmitter({
        persistence: persistence,
        unload: function() {
          if (!isUnloaded) {
            isUnloaded = true;
            focused.destroy();
            focused = null;
            input.deactivate();
            input = null;
            hud.destroy();
            hud = null;
            indicator = null;
          }
        }
      });

      return self;
    }
  });
})(jQuery);