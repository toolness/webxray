(function(jQuery) {
  "use strict";

  var $ = jQuery;

  function maybeLoadRecording(mixMaster) {
    if (mixMaster.isRecordingInGlobal(window)) {
      var msg,
          success = mixMaster.playRecordingFromGlobal(window);
      if (success)
        msg = 'Hack rebusted!';
      else
        msg = 'Hack rebusting failed. Perhaps the page changed since ' +
              'the hack was first busted?';
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
      var mixMaster = jQuery.mixMaster({
        hud: hud,
        focusedOverlay: focused
      });
      var input = jQuery.xRayInput({
        focusedOverlay: focused,
        mixMaster: mixMaster,
        eventSource: options.eventSource,
        onQuit: function() {
          self.emit('quit');
        }
      });
      var indicator = jQuery.blurIndicator(input, window);

      maybeLoadRecording(mixMaster);
      mixMaster.loadHistoryFromDOM();
      $(document.body).append(hud.overlay);
      focused.on('change', hud.onFocusChange);
      input.activate();
      $(window).focus();

      var self = jQuery.eventEmitter({
        mixMaster: mixMaster,
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