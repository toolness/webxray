(function(jQuery) {
  var $ = jQuery;

  $(window).ready(function() {
    var hud = jQuery.hudOverlay();
    var focused = jQuery.focusedOverlay();
    var mixMaster = jQuery.mixMaster({
      hud: hud,
      focusedOverlay: focused
    });
    var input = jQuery.xRayInput({
      focusedOverlay: focused,
      mixMaster: mixMaster
    });

    $(document.body).append(hud.overlay);
    focused.on('change', hud.onFocusChange);
    input.activate();

    $(window.document).unload(function() {
      focused.destroy();
      focused = null;
      input.deactivate();
      hud.destroy();
      hud = null;
    });
  });
})(jQuery);
