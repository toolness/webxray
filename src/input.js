(function(jQuery) {
  var $ = jQuery;

  var keys = {
    R: 82,
    DELETE: 8,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESC: 27
  };

  jQuery.extend({
    xRayInput: function xRayInput(options) {
      var focused = options.focusedOverlay;
      var mixMaster = options.mixMaster;

      function handleKey(event) {
        if (event.altKey || event.ctrlKey ||
            event.altGraphKey || event.metaKey) {
          return false;
        }

        if (event.shiftKey) {
          switch (event.keyCode) {
            case keys.LEFT:
            mixMaster.undo();
            return true;

            case keys.RIGHT:
            mixMaster.redo();
            return true;        

            case keys.UP:
            focused.upfocus();
            return true;

            case keys.DOWN:
            focused.downfocus();
            return true;            
          }
          return false;
        }

        switch (event.keyCode) {
          case keys.ESC:
          $(document).trigger('unload');
          return true;
          
          case keys.R:
          mixMaster.replaceFocusedElement();
          return true;
          
          case keys.DELETE:
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
        keys: keys,
        handleEvent: function handleEvent(event) {
          if (event.type in listeners)
            listeners[event.type](event);
          else
            throw new Error("Unexpected event type: " + event.type);
        },
        activate: function() {
          // We're listening during the capture phase to intercept
          // any events at the earliest point before they're
          // handled by the page itself. Because JQuery's bind() doesn't
          // appear to allow for listening during the capture phase,
          // we're using document.addEventListener() directly.
          for (var name in listeners)
            document.addEventListener(name, self, true);
        },
        deactivate: function() {
          for (var name in listeners)
            document.removeEventListener(name, self, true);
        }
      };
      
      return self;
    }
  });
})(jQuery);
