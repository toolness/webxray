(function(jQuery) {
  var $ = jQuery;

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
        focused = jQuery.focusedOverlay(event.target);
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
