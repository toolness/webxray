(function(jQuery) {
  "use strict";

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
    },
    // Like console.warn(), but only does anything if console exists.
    warn: function warn() {
      if (window.console && window.console.warn)
        window.console.warn.apply(window.console, arguments);
    }
  });
  
  jQuery.fn.extend({
    // Turns all URLs in src and href attributes into absolute URLs
    // if they're not already.
    absolutifyURLs: function() {
      var URL_PROPS = ['href', 'src'];
      this.find('*').andSelf().each(function() {
        var self = this;
        URL_PROPS.forEach(function(name) {
          if (name in self && self[name]) {
            $(self).attr(name, self[name]);
          }
        });
      });
      return this;
    },
    // returns whether at least one of the matched elements is a
    // void element (i.e., has no closing tag).
    isVoidElement: function() {
      // Taken from:
      // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
      return this.is("area, base, br, col, command, embed, hr, img, " +
                     "input, keygen, link, meta, param, source, " +
                     "track, wbr");
    },
    // works much like jQuery's html() with no arguments, but
    // includes HTML code for the matched elements themselves.
    // unlike jQuery, this will include all matched elements.
    outerHtml: function outerHtml() {
      var clonedElement = this.clone();
      var trivialParent = $('<div></div>').append(clonedElement);
      return trivialParent.html();
    },
    // Given a descendant on the first matched element, returns a CSS
    // selector that uniquely selects only the descendant from the
    // first matched element.
    pathTo: function pathTo(descendant) {
      var root = this[0];
      var target = $(descendant).get(0);
      var parts = [];

      for (var node = target; node && node != root; node = node.parentNode) {
        var n = $(node).prevAll(node.nodeName.toLowerCase()).length + 1;
        parts.push(node.nodeName.toLowerCase() +
                   ':nth-of-type(' + n + ')');
      }
      
      parts.reverse();
      return ' > ' + parts.join(' > ');
    },

    // Temporarily remove the set of matched elements,
    // returning a removal object with one method,
    // undo(), that can be used to undo the removal.
    temporarilyRemove: function temporarilyRemove() {
      var undoers = [];
      jQuery.each(this, function(i, element) {
        var document = element.ownerDocument;
        var replacer = document.createTextNode('');
        element.parentNode.replaceChild(replacer, element);
        undoers.push(function() {
          replacer.parentNode.replaceChild(element, replacer);
        });
      });
      return {
        undo: function undo() {
          jQuery.each(undoers, function(i, undoer) {
            undoer();
          });
          undoers = null;
        }
      };
    },
    
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
    // matched element.
    overlay: function overlay() {
      var pos = this.offset();
      var body = this.get(0).ownerDocument.body;
      var overlay = $('<div class="webxray-base webxray-overlay">' +
                      '&nbsp;</div>');
      overlay.css({
        top: pos.top,
        left: pos.left,
        height: this.outerHeight(),
        width: this.outerWidth()
      });
      $(body).append(overlay);

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
    },
    // Resizes and repositions the currently matched element to
    // match the size and position of the given target by animating
    // it and then executing the given callback.
    resizeTo: function resizeTo(target, cb) {
      var overlay = this;

      var hasNoStyle = $(target).attr('style') === undefined;
      var pos = $(target).offset();
      overlay.animate({
        top: pos.top,
        left: pos.left,
        height: $(target).outerHeight(),
        width: $(target).outerWidth()
      }, cb);
      if (hasNoStyle && $(target).attr('style') == '')
        $(target).removeAttr('style');
    },
    // Resizes and repositions the currently matched element to
    // match the size and position of the given target by animating
    // it, then fades out the currently matched element and
    // removes it from the DOM.
    resizeToAndFadeOut: function resizeToAndFadeOut(target) {
      this.resizeTo(target, function() {
        $(this).fadeOut(function() { $(this).remove(); });
      });
    },
    // Removes the class and, if the class attribute is now empty, 
    // removes the attribute as well (jQuery remove class does not)..
    reallyRemoveClass: function reallyRemoveClass(classname) {
      this.removeClass(classname).filter('[class=""]').removeAttr('class');
      return this;
    }
  });
})(jQuery);
