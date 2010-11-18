(function(jQuery) {
  var $ = jQuery;

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
    // matched element.
    overlay: function overlay() {
      var pos = this.offset();
      var overlay = $('<div class="webexplode-overlay">&nbsp;</div>');
      overlay.css({
        top: pos.top,
        left: pos.left,
        height: this.outerHeight(),
        width: this.outerWidth()
      });
      $(document.body).append(overlay);
      return overlay;
    }
  });

  function makeFocused(element) {
    var ancestorIndex = 0;
    var ancestorOverlay = null;
    var overlay = $(element).overlay().addClass("webexplode-focus");

    function setAncestorOverlay(ancestor) {
      if (ancestorOverlay) {
        ancestorOverlay.remove();
        ancestorOverlay = null;
      }
      if (ancestor) {
        ancestorOverlay = $(ancestor).overlay();
        ancestorOverlay.addClass("webexplode-ancestor");
      }
    }

    return {
      element: element,
      upfocus: function upfocus() {
        var ancestor = $(element).ancestor(ancestorIndex + 1);

        if (ancestor.length && ancestor[0] != document) {
          ancestorIndex++;
          setAncestorOverlay(ancestor);
        }
      },
      downfocus: function downfocus() {
        setAncestorOverlay(null);
        if (ancestorIndex > 0) {
          ancestorIndex--;
          var ancestor = $(element).ancestor(ancestorIndex);
          if (ancestorIndex > 0)
            setAncestorOverlay(ancestor);
        }
      },
      unfocus: function unfocus() {
        overlay.remove();
        setAncestorOverlay(null);
      }
    };
  }

  $(window).ready(function() {
    var focused = null;

    var listeners = {
      keydown: function(event) {
        const KEY_UP = 38;
        const KEY_DOWN = 40;
        const KEY_ESC = 27;

        if (event.shiftKey && event.keyCode == KEY_UP && focused) {
          focused.upfocus();
          event.preventDefault();
          event.stopPropagation();
        } else if (event.shiftKey && event.keyCode == KEY_DOWN && focused) {
          focused.downfocus();
          event.preventDefault();
          event.stopPropagation();
        } else if (event.keyCode == KEY_ESC) {
          $(window).trigger('unload');
          event.preventDefault();
          event.stopPropagation();
        }
      },
      mouseout: function(event) {
        event.stopPropagation();
        if (focused)
          focused.unfocus();
        focused = null;
      },
      mouseover: function(event) {
        event.stopPropagation();
        if (focused)
          focused.unfocus();
        focused = makeFocused(event.target);

        hud.html("You are on a <code></code> element.");
        hud.find("code").text("<" + event.target.nodeName.toLowerCase() +
                              ">");
      }
    };

    for (var eventName in listeners)
      document.addEventListener(eventName, listeners[eventName], true);

    var hud = $('<div class="webexplode-hud"></div>');
    $(document.body).append(hud);

    hud.text("Welcome to WebExplode Inspector.");

    $(window).unload(function() {
      if (focused)
        focused.unfocus();
      focused = null;
      for (var eventName in listeners)
        document.removeEventListener(eventName, listeners[eventName], true);
      hud.remove();
    });
  });
})(jQuery);
