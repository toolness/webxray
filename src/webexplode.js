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
        ancestorOverlay = ancestor.overlay();
        ancestorOverlay.addClass("webexplode-ancestor");
        instance.ancestor = ancestor[0];
      } else
        instance.ancestor = null;
    }

    var instance = {
      element: element,
      ancestor: null,
      upfocus: function upfocus() {
        var ancestor = $(element).ancestor(ancestorIndex + 1);

        if (ancestor.length && ancestor[0] != document) {
          ancestorIndex++;
          setAncestorOverlay(ancestor);
        }
      },
      downfocus: function downfocus() {
        setAncestorOverlay(null);
        if (ancestorIndex > 0 && --ancestorIndex > 0) {
          var ancestor = $(element).ancestor(ancestorIndex);
          setAncestorOverlay(ancestor);
        }
      },
      unfocus: function unfocus() {
        overlay.remove();
        setAncestorOverlay(null);
      }
    };
    
    return instance;
  }

  $(window).ready(function() {
    var focused = null;

    var listeners = {
      keydown: function(event) {
        const KEY_UP = 38;
        const KEY_DOWN = 40;
        const KEY_ESC = 27;

        function handleKey(event) {
          if (event.shiftKey && event.keyCode == KEY_UP && focused) {
            focused.upfocus();
            return true;
          } else if (event.shiftKey && event.keyCode == KEY_DOWN && focused) {
            focused.downfocus();
            return true;
          } else if (event.keyCode == KEY_ESC) {
            $(window).trigger('unload');
            return true;
          }
          return false;
        }

        if (handleKey(event)) {
          event.preventDefault();
          event.stopPropagation();
          updateHUDText();
        }
      },
      mouseout: function(event) {
        event.stopPropagation();
        if (focused)
          focused.unfocus();
        focused = null;
        updateHUDText();
      },
      mouseover: function(event) {
        event.stopPropagation();
        if (focused)
          focused.unfocus();
        focused = makeFocused(event.target);
        updateHUDText();
      }
    };

    for (var eventName in listeners)
      document.addEventListener(eventName, listeners[eventName], true);

    var hud = $('<div class="webexplode-hud"></div>');
    $(document.body).append(hud);

    function updateHUDText() {
      function code(string) {
        return $("<code></code>").text(string);
      }

      function elementDesc(element) {
        var span = $("<span></span>");
        var tagName = "<" + element.nodeName.toLowerCase() + ">";
        
        span.emit(code(tagName), " element");
        if (element.id)
          span.emit(" with id ", code(element.id));
        if (element.className)
          span.emit(element.id ? " and" : " with", " class ",
                    code(element.className));
        return span;
      }

      if (focused) {
        var span = $("<span></span>");
        span.emit("You are on a ", elementDesc(focused.element), ".");
        if (focused.ancestor)
          span.emit(" It is inside a ", elementDesc(focused.ancestor),
                    ".");
        hud.empty().append(span);
      } else
        hud.html("<span>Welcome to WebExplode Inspector.</span>");
    }

    updateHUDText();

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
