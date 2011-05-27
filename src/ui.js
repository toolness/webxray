(function(jQuery) {
  "use strict";

  var $ = jQuery;

  jQuery.extend({
    xRayUI: function xRayUI(options) {
      var isUnloaded = false;
      var hud = jQuery.hudOverlay();
      var focused = jQuery.focusedOverlay();
      var mixMaster = jQuery.mixMaster({
        hud: hud,
        focusedOverlay: focused
      });
      var input = jQuery.xRayInput({
        focusedOverlay: focused,
        mixMaster: mixMaster,
        eventSource: options.eventSource,
        onQuit: function() {
          self.unload();
          self.emit('quit');
        }
      });
      var indicator = jQuery.blurIndicator(input, window);

      mixMaster.loadHistoryFromDOM();
      $(document.body).append(hud.overlay);
      focused.on('change', hud.onFocusChange);
      input.activate();
      $(window).focus();

      var self = jQuery.eventEmitter({
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