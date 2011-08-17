(function(jQuery) {
  "use strict";

  var $ = jQuery;

  var keys = {
    DELETE: 8,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESC: 27,
    SPACE: 32
  };

  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (var i = 0; i < alphabet.length; i++)
    keys[alphabet[i]] = alphabet.charCodeAt(i);

  function isValidFocusTarget(target) {
    return (!$(target).hasClass('webxray-base'));
  }
  
  function styleOverlayInputHandlers(styleInfo) {
    var isQuasimodeActive = false;

    return {
      keyup: function(event) {
        if (event.keyCode == keys.C) {
          isQuasimodeActive = false;
          styleInfo.hide();
          return true;
        }
        return false;
      },
      keydown: function(event) {
        if (event.altKey || event.ctrlKey ||
            event.altGraphKey || event.metaKey) {
          return false;
        }
        
        switch (event.keyCode) {
          case keys.SPACE:
          if (isQuasimodeActive) {
            isQuasimodeActive = false;
            styleInfo.lock(this);
          }
          return true;

          case keys.C:
          if (!isQuasimodeActive) {
            isQuasimodeActive = true;
            styleInfo.show();
          }
          return true;
        }
        return false;
      }
    };
  }

  jQuery.extend({
    keys: keys,
    mouseMonitor: function mouseMonitor() {
      function onMouseMove(event) {
        self.lastPosition.pageX = event.pageX;
        self.lastPosition.pageY = event.pageY;
        self.emit('move', self);
      }
      $(document).mousemove(onMouseMove);
      
      var self = jQuery.eventEmitter({
        lastPosition: {
          pageX: 0,
          pageY: 0
        },
        unload: function() {
          $(document).unbind('mousemove', onMouseMove);
          self.removeAllListeners();
        }
      });
      
      return self;
    },
    inputHandlerChain: function inputHandlerChain(eventTypes, eventSource) {
      var handlerChains = {};
      var listeners = {};
      
      function eventListener(event) {
        for (var i = 0; i < handlerChains[event.type].length; i++) {
          if (handlerChains[event.type][i].call(this, event)) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }
      
      eventTypes.forEach(function(eventName) {
        handlerChains[eventName] = [];
        listeners[eventName] = eventListener;
      });

      var self = jQuery.inputManager(listeners, eventSource).extend({
        add: function(handlers) {
          for (var name in handlers)
            handlerChains[name].push(handlers[name]);
        }
      });
      
      return self;
    },
    inputManager: function inputManager(listeners, eventSource) {
      var isActive = false;

      var self = jQuery.eventEmitter({
        extend: jQuery.extend,
        handleEvent: function handleEvent(event) {
          if (event.type in listeners)
            listeners[event.type].call(self, event);
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
              eventSource.addEventListener(name, self.handleEvent, true);
            self.emit('activate');
          }
        },
        deactivate: function() {
          if (isActive) {
            isActive = false;
            for (var name in listeners)
              eventSource.removeEventListener(name, self.handleEvent, true);
            self.emit('deactivate');
          }
        }
      });
      
      return self;
    },
    simpleKeyBindings: function simpleKeyBindings() {
      var bindings = {};
      return {
        set: function(keycodes) {
          for (var keycode in keycodes) {
            if (!(keycode in keys))
              throw new Error('unknown key: ' + keycode);
            bindings[keys[keycode]] = keycodes[keycode];
          }
        },
        handlers: {
          keydown: function(event) {
            if (event.altKey || event.ctrlKey ||
                event.altGraphKey || event.metaKey)
              return false;

            if (typeof(bindings[event.keyCode]) == 'function') {
              bindings[event.keyCode].call(this, event);
              return true;
            }
            return false;
          }
        }
      };
    },
    xRayInput: function xRayInput(options) {
      var focused = options.focusedOverlay;
      var mixMaster = options.mixMaster;
      var commandManager = options.commandManager;
      var eventSource = options.eventSource;
      var onQuit = options.onQuit;
      var persistence = options.persistence;
      var styleInfo = options.styleInfoOverlay;
      var self = jQuery.inputHandlerChain([
        'keydown',
        'keyup',
        'click',
        'mouseout',
        'mouseover'
      ], eventSource);

      self.add({
        click: function(event) {
          if ($(event.target).closest('a').length) {
            var msg = jQuery.locale.get("input:link-click-blocked");
            jQuery.transparentMessage($('<div></div>').text(msg));
            return true;
          }
        },
        mouseout: function(event) {
          if (isValidFocusTarget(event.target)) {
            focused.unfocus();
            return true;
          }
        },
        mouseover: function(event) {
          if (isValidFocusTarget(event.target)) {
            focused.set(event.target);
            return true;
          }
        }
      });

      self.extend({ simpleKeyBindings: jQuery.simpleKeyBindings() });
      
      self.simpleKeyBindings.set({
        LEFT: function() { mixMaster.undo(); },
        RIGHT: function() { mixMaster.redo(); },
        UP: function() { focused.upfocus(); },
        DOWN: function() { focused.downfocus(); },
        ESC: function() { if (onQuit) onQuit(); },
        DELETE: function() { mixMaster.deleteFocusedElement(); },
        I: function() { mixMaster.infoForFocusedElement(); },
        R: function() {
          mixMaster.replaceFocusedElementWithDialog({
            input: self,
            dialogURL: jQuery.webxraySettings.url("easyRemixDialogURL"),
            sendFullDocument: true
          });
        },
        T: function() {
          persistence.saveHistoryToDOM();
          jQuery.openUprootDialog(self);
        },
        H: function() {
          jQuery.transparentMessage(jQuery.createKeyboardHelpReference());
        }
      });

      self.add(self.simpleKeyBindings.handlers);
      self.add(styleOverlayInputHandlers(styleInfo));
      
      return self;
    }
  });
})(jQuery);
