(function(jQuery) {
  "use strict";

  var $ = jQuery;

  var keys = {
    DELETE: 8,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESC: 27
  };

  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (var i = 0; i < alphabet.length; i++)
    keys[alphabet[i]] = alphabet.charCodeAt(i);
  
  jQuery.extend({
    xRayInput: function xRayInput(options) {
      var focused = options.focusedOverlay;
      var mixMaster = options.mixMaster;
      var eventSource = options.eventSource;
      var onQuit = options.onQuit;

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
          if (onQuit)
            onQuit();
          return true;
          
          case keys.R:
          mixMaster.replaceFocusedElementWithDialog(
            self,
            jQuery.webxraySettings.mixMasterDialogURL
            );
          return true;

          case keys.T:
          mixMaster.saveHistoryToDOM();
          jQuery.openUprootDialog(self);
          return true;
          
          case keys.DELETE:
          mixMaster.deleteFocusedElement();
          return true;
          
          case keys.I:
          mixMaster.infoForFocusedElement();
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

      var isActive = false;

      function showBlurIndicator() {
        var blurIndicator = $('<div class="webxray-dialog-overlay"></div>');
        $(document.body).append(blurIndicator);
        $(window).one('focus', function() {
          // If we wait a moment before removing the indicator, it'll receive
          // any click events instead of elements underneath it. We can
          // safely assume that any click events made immediately after
          // focus are really just intended to focus the page rather
          // than click on a specific element, so we want to swallow
          // such events rather than e.g. take the user to a new page.
          setTimeout(function() {
            blurIndicator.remove();
            blurIndicator = null;
          }, 10);
          if (!isActive)
            self.activate();
        });
        self.deactivate();
      }

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
          if (!isActive) {
            isActive = true;
            for (var name in listeners)
              eventSource.addEventListener(name, self, true);
            $(window).bind('blur', showBlurIndicator);
          }
        },
        deactivate: function() {
          if (isActive) {
            isActive = false;
            for (var name in listeners)
              eventSource.removeEventListener(name, self, true);
            $(window).unbind('blur', showBlurIndicator);
          }
        }
      };
      
      return self;
    }
  });
})(jQuery);
