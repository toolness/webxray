(function(jQuery) {
  var $ = jQuery;
  var HEX_REGEXP = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i;
  var RGB_REGEXP = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;

  jQuery.extend({
    // Return a string that is shortened to be the given maximum
    // length, with a trailing ellipsis at the end. If the string
    // isn't longer than the maximum length, the string is returned
    // unaltered.
    shortenText: function shortenText(text, maxLength) {
      if (text.length > maxLength)
        return text.substring(0, maxLength) + '\u2026';
      return text;
    },
    // Return an rgba()-style CSS color string given a color and an
    // alpha value.
    makeRGBA: function makeRGBA(color, alpha) {
      // WebKit and Gecko use this.
      var match = color.match(RGB_REGEXP);
      if (!match) {
        // This is what Opera uses.
        var hexMatch = color.match(HEX_REGEXP);
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
  });
  
  jQuery.fn.extend({
    // Return the nth ancestor of the first matched element.
    ancestor: function ancestor(generation) {
      var ancestor = this[0];
      
      for (var i = 0; i < generation; i++)
        if (ancestor.parentNode)
          ancestor = ancestor.parentNode;
        else
          return null;

      return $(ancestor);
    },
    // Create and return a div that floats above the first
    // matched element. The returned element must have the
    // webxray-overlay-visible class added to it in order
    // to become visible.
    overlay: function overlay() {
      var pos = this.offset();
      var overlay = $('<div class="webxray-overlay">&nbsp;</div>');
      overlay.css({
        top: pos.top,
        left: pos.left,
        height: this.outerHeight(),
        width: this.outerWidth()
      });
      $(document.body).append(overlay);

      // This seems like a no-op, but it somehow makes CSS transitions
      // work. Perhaps it forces jQuery to actually apply CSS styles that 
      // may have been cached within jQuery, or something?
      overlay.css("color");

      return overlay;
    },
    // Like jQuery.append(), but accepts an arbitrary number of arguments,
    // and automatically converts string arguments into text nodes.
    emit: function emit() {
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof(arg) == "string")
          arg = document.createTextNode(arg);
        this.append(arg);
      }
    }
  });
})(jQuery);
