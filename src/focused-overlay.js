(function(jQuery) {
  var $ = jQuery;

  var OVERLAY_OPACITY = 0.7;
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

  function applyAlphaToColor(color, alpha) {
    // WebKit and Gecko use this.
    var match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) {
      // This is what Opera uses.
      var hexMatch = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);
      if (hexMatch) {
        match = [null];
        for (var i = 1; i <= 3; i++)
          match.push(parseInt(hexMatch[i], 16));
      } else
        throw new Error("Couldn't parse " + color);
    }
    return "rgba(" + 
           match[1] + ", " +
           match[2] + ", " +
           match[3] + ", " +
           alpha + ")";
  }
  
  jQuery.focusedOverlay = function focusedOverlay() {
    var ancestorIndex = 0;
    var ancestorOverlay = null;
    var overlay = null;
    var element = null;

    function labelOverlay(overlay, target) {
      ["bottom", "top"].forEach(function(className) {
        var part = $('<div class="webxray-overlay-label"></div>');
        var tag = target.nodeName.toLowerCase();
        part.addClass("webxray-overlay-label-" + className);
        part.text("<" + (className == "bottom" ? "/" : "") +
                  tag + ">");
        overlay.append(part);
      });
    }

    function setAncestorOverlay(ancestor) {
      if (ancestorOverlay) {
        ancestorOverlay.remove();
        ancestorOverlay = null;
      }
      if (ancestor) {
        ancestorOverlay = ancestor.overlay();
        ancestorOverlay.addClass("webxray-ancestor");
        labelOverlay(ancestorOverlay, ancestor[0]);
        instance.ancestor = ancestor[0];
      } else
        instance.ancestor = null;
    }

    var instance = jQuery.eventEmitter({
      element: null,
      ancestor: null,
      upfocus: function upfocus() {
        if (!element)
          return;
        var ancestor = $(element).ancestor(ancestorIndex + 1);

        if (ancestor.length && ancestor[0] != document) {
          ancestorIndex++;
          setAncestorOverlay(ancestor);
        }
        this.emit('change', this);
      },
      downfocus: function downfocus() {
        if (!element)
          return;
        setAncestorOverlay(null);
        if (ancestorIndex > 0 && --ancestorIndex > 0) {
          var ancestor = $(element).ancestor(ancestorIndex);
          setAncestorOverlay(ancestor);
        }
        this.emit('change', this);
      },
      unfocus: function unfocus() {
        if (!element)
          return;
        overlay.remove();
        overlay = null;
        element = this.element = null;
        setAncestorOverlay(null);
        this.emit('change', this);
      },
      set: function set(newElement) {
        var tagName = newElement.nodeName.toLowerCase();
        var colorNumber;
        var bgColor;
        
        this.unfocus();
        element = this.element = newElement;
        overlay = $(element).overlay();
        labelOverlay(overlay, element);

        if (tagName in TAG_COLOR_MAP)
          colorNumber = TAG_COLOR_MAP[tagName];
        else
          colorNumber = (tagNameToNumber(tagName) % NUM_TAG_COLORS) + 1;

        // Temporarily apply the color class to the overlay so we
        // can retrieve the actual color and apply alpha transparency
        // to it. Ideally we should be able to do this via the CSS DOM API,
        // but for now we'll use this hack.
        overlay.addClass("webxray-color-" + colorNumber);
        bgColor = applyAlphaToColor(overlay.css("color"), OVERLAY_OPACITY);
        overlay.removeClass("webxray-color-" + colorNumber);

        overlay.css({backgroundColor: bgColor});

        this.emit('change', this);
      },
      destroy: function destroy() {
        this.unfocus();
        this.removeAllListeners('change');
      }
    });
    
    return instance;
  }
})(jQuery);
