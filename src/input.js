(function(jQuery) {
  var $ = jQuery;

  const KEY_R = 82;
  const KEY_DELETE = 8;
  const KEY_LEFT = 37;
  const KEY_RIGHT = 39;
  const KEY_UP = 38;
  const KEY_DOWN = 40;
  const KEY_ESC = 27;

  jQuery.extend({
    xRayInput: function xRayInput(options) {
      var hud = options.hud;
      var focused = options.focusedOverlay;
      var mixMaster = options.mixMaster;

      function handleKey(event) {
        if (event.altKey || event.ctrlKey ||
            event.altGraphKey || event.metaKey) {
          return false;
        }

        if (event.shiftKey) {
          switch (event.keyCode) {
            case KEY_LEFT:
            mixMaster.undo();
            return true;

            case KEY_RIGHT:
            mixMaster.redo();
            return true;        

            case KEY_UP:
            focused.upfocus();
            return true;

            case KEY_DOWN:
            focused.downfocus();
            return true;            
          }
          return false;
        }

        switch (event.keyCode) {
          case KEY_ESC:
          $(document).trigger('unload');
          return true;
          
          case KEY_R:
          mixMaster.replaceFocusedElement();
          return true;
          
          case KEY_DELETE:
          mixMaster.deleteFocusedElement();
          return true;
        }
        return false;
      }

      var listeners = {
        keydown: function(event) {
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

      var self = {
        // We're exposing listeners for unit tests only.
        _listeners: listeners,
        activate: function() {
          // We're listening during the capture phase to intercept
          // any events at the earliest point before they're
          // handled by the page itself. Because JQuery's bind() doesn't
          // appear to allow for listening during the capture phase,
          // we're using document.addEventListener() directly.
          for (var name in listeners)
            document.addEventListener(name, listeners[name], true);
        },
        deactivate: function() {
          for (var name in listeners)
            document.removeEventListener(name, listeners[name], true);
        }
      };
      
      return self;
    }
  });
})(jQuery);
