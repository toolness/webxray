(function(jQuery) {
  var $ = jQuery;

  $(window).ready(function() {
    var hud = jQuery.hudOverlay();
    var focused = jQuery.focusedOverlay();

    $(document.body).append(hud.overlay);
    focused.on('change', hud.onFocusChange);

    var listeners = {
      keydown: function(event) {
        const KEY_UP = 38;
        const KEY_DOWN = 40;
        const KEY_ESC = 27;

        function handleKey(event) {
          if (event.shiftKey && event.keyCode == KEY_UP) {
            focused.upfocus();
            return true;
          } else if (event.shiftKey && event.keyCode == KEY_DOWN) {
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
        }
      },
      mouseout: function(event) {
        event.stopPropagation();
        focused.unfocus();
      },
      mouseover: function(event) {
        event.stopPropagation();
        focused.set(event.target);
      }
    };

    for (var eventName in listeners)
      document.addEventListener(eventName, listeners[eventName], true);

    $(window).unload(function() {
      focused.destroy();
      focused = null;
      for (var eventName in listeners)
        document.removeEventListener(eventName, listeners[eventName], true);
      hud.destroy();
      hud = null;
    });
  });
})(jQuery);
