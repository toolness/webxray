(function(jQuery) {
  "use strict";
  
  function isValidFocusTarget(target) {
    return (!$(target).hasClass('webxray-base'));
  }
  
  function makeButton(glyph, text, cb) {
    var button = $(
      '<div class="webxray-toolbar-button">' +
      '<div class="webxray-toolbar-button-glyph"></div>' +
      '<div class="webxray-toolbar-button-text"></div>' +
      '</div>'
      );
    var glyphDiv = $('.webxray-toolbar-button-glyph', button);
    glyphDiv.text(glyph);
    if (glyph.length != 1)
      glyphDiv.addClass('webxray-toolbar-button-glyph-tiny');
    $('.webxray-toolbar-button-text', button).text(text);
    button.find('*').andSelf().addClass('webxray-base');
    button.bind('click', cb);
    return button;
  }
  
  function makeFakeEvent(props) {
    var fakeEvent = {
      altKey: false,
      ctrlKey: false,
      altGraphKey: false,
      metaKey: false,
      preventDefault: function() {},
      stopPropagation: function() {}      
    };
    jQuery.extend(fakeEvent, props);
    return fakeEvent;
  }
  
  jQuery.extend({
    touchInput: function(input) {
      function makeKeydown(key) {
        return function() {
          input.handleEvent(makeFakeEvent({
            type: "keydown",
            keyCode: jQuery.keys[key],            
          }));
        }
      }

      function makeKeyToggle(key) {
        var isPressed = false;
        
        return function() {
          isPressed = !isPressed;
          $(this).toggleClass('webxray-toolbar-button-toggled');
          input.handleEvent(makeFakeEvent({
            type: isPressed ? "keydown" : "keyup",
            keyCode: jQuery.keys[key],            
          }));
        }
      }

      var toolbar = $('<div class="webxray-base webxray-toolbar"></div>');
      makeButton('r', 'remix', makeKeydown('R')).appendTo(toolbar);
      makeButton('del', 'remove', makeKeydown('DELETE')).appendTo(toolbar);
      makeButton('c', 'CSS', makeKeyToggle('C')).appendTo(toolbar);
      makeButton('↑', 'ascend', makeKeydown('UP')).appendTo(toolbar);
      makeButton('↓', 'descend', makeKeydown('DOWN')).appendTo(toolbar);
      makeButton('←', 'undo', makeKeydown('LEFT')).appendTo(toolbar);      
      makeButton('→', 'redo', makeKeydown('RIGHT')).appendTo(toolbar);      
      makeButton('t', 'publish', makeKeydown('T')).appendTo(toolbar);      
      makeButton('esc', 'quit', makeKeydown('ESC')).appendTo(toolbar);
      toolbar.appendTo(document.body);
      
      var lastTouch = null;
      
      function onMove(event) {
        var touches = event.changedTouches;
        var touch = touches[0];
        var element = document.elementFromPoint(touch.clientX,
                                                touch.clientY);
        
        if (element == lastTouch)
          return;
        lastTouch = element;

        if (!isValidFocusTarget(element))
          return;

        var fakeEvent = {
          type: "mouseover",
          target: element,
          preventDefault: function() { event.preventDefault(); },
          stopPropagation: function() { event.stopPropagation(); }
        };
        input.handleEvent(fakeEvent);
      }
      
      input.on('activate', function() {
        ["touchstart", "touchmove"].forEach(function(name) {
           document.addEventListener(name, onMove, true);
        });
      });
      
      input.on('deactivate', function() {
        ["touchstart", "touchmove"].forEach(function(name) {
           document.removeEventListener(name, onMove, true);
        });
      });

      return input;
    }
  });
})(jQuery);
