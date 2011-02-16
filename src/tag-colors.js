(function(jQuery) {
  var $ = jQuery;
  
  var NUM_TAG_COLORS = 9;
  var TAG_COLOR_MAP = {
    img: 1,
    p: 2,
    div: 3,
    a: 4,
    span: 5,
    body: 6,
    h1: 7,
    html: 8,
    footer: 9
  };

  function tagNameToNumber(tagName) {
    var total = 0;
    for (var i = 0; i < tagName.length; i++)
      total += tagName.charCodeAt(i);
    return total;
  }

  jQuery.extend({
    // Returns the class name for the "official" Web X-Ray color
    // for the given tag name, excluding angled brackets.
    colorClassForTag: function colorClassForTag(tagName) {
      var colorNumber;

      tagName = tagName.toLowerCase();
      if (tagName in TAG_COLOR_MAP)
        colorNumber = TAG_COLOR_MAP[tagName];
      else
        colorNumber = (tagNameToNumber(tagName) % NUM_TAG_COLORS) + 1;

      return "webxray-color-" + colorNumber;
    }
  });

  jQuery.fn.extend({
    // Like $.overlay(), but applies the "official" Web X-Ray color
    // for the element type being overlaid, with the given opacity.
    overlayWithTagColor: function overlayWithTagColor(opacity) {
      var bgColor;
      var overlay = $(this).overlay();
      var className = $.colorClassForTag($(this).get(0).nodeName);

      // Temporarily apply the color class to the overlay so we
      // can retrieve the actual color and apply alpha transparency
      // to it. Ideally we should be able to do this via the CSS DOM API,
      // but it varies from browser to browser and this hack seems to
      // work on most.
      overlay.addClass(className);
      bgColor = $.makeRGBA(overlay.css("color"), opacity);
      overlay.removeClass(className);

      overlay.css({backgroundColor: bgColor});
      return overlay;
    }
  });
})(jQuery);
