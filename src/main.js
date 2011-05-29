(function(jQuery) {
  "use strict";

  var $ = jQuery;
  var removeOnUnload = $();
  
  function getMyScript() {
    return $('script.webxray, script[src$="webxray.js"]');
  }

  // If the goggles are already active on this page, just exit.
  if ($("#webxray-is-active").length) {
    getMyScript().remove();
    return;
  }

  function waitForCSSToLoad(cb) {
    // Sadly, link elements don't fire load events on most/all browsers,
    // so we'll define a special style in our stylesheet and keep
    // polling an element with that style until it has what we've
    // defined in the stylesheet.
    var div = $('<div id="webxray-wait-for-css-to-load"></div>');

    div.hide();
    $(document.body).append(div);

    function checkIfLoaded() {
      // This works on most browsers.
      var content = div.css('content');

      // This works on Safari.
      var bgColor = div.css('background-color');

      if ((content && content.match(/CSS\ is\ loaded/)) ||
          (bgColor && bgColor.match(/rgb\(0,\s*1,\s*2\)/))) {
        div.remove();
        clearInterval(intervalID);
        cb();
      }
    }

    var intervalID = setInterval(checkIfLoaded, 10);
    checkIfLoaded();
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
    waitForCSSToLoad(cb);
  }

  $(window).ready(function() {
    loadPrerequisites(function() {
      var ui = jQuery.xRayUI({eventSource: document});
      ui.on('quit', function() { $(document).trigger('unload'); });
      $(document).unload(function() {
        ui.unload();
        removeOnUnload.remove();
      });
    });
  });
})(jQuery);
