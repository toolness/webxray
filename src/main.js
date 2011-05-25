(function(jQuery) {
  "use strict";

  var $ = jQuery;
  var removeOnUnload = $();
  
  function getMyScript() {
    return $('script.webxray, script[src$="webxray.js"]');
  }

  if ($("#webxray-is-active").length) {
    getMyScript().remove();
    return;
  }

  function loadPrerequisites(cb) {
    var script = getMyScript();
    var baseURI = script.attr("src").match(/(.*)webxray\.js$/)[1];
    var cssURI = baseURI + 'webxray.css';
    var cssLink = $('link[href="' + cssURI + '"]');
    var active = $('<div id="webxray-is-active"></div>');

    script.remove();
    active.hide();
    $(document.body).append(active);

    // This is a test to see if we're using legacy bookmarklet code,
    // which inserts the link tag itself.
    if (cssLink.length == 0) {
      cssLink = $('<link rel="stylesheet" class="webxray"></link>');
      $(document.head).append(cssLink.attr("href", cssURI));
    }

    removeOnUnload = removeOnUnload.add([cssLink.get(0), active.get(0)]);
    jQuery.webxraySettings.baseURI = baseURI;
    cb();
  }

  $(window).ready(function() {
    loadPrerequisites(function() {
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

      mixMaster.loadHistoryFromDOM();
      $(document.body).append(hud.overlay);
      focused.on('change', hud.onFocusChange);
      input.activate();
      $(window).focus();

      $(window.document).unload(function() {
        focused.destroy();
        focused = null;
        input.deactivate();
        hud.destroy();
        hud = null;
        removeOnUnload.remove();
      });
    });
  });
})(jQuery);
