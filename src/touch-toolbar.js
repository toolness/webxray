(function(jQuery) {
  "use strict";
  
  var $ = jQuery;
  
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
    button.bind('touchstart touchmove', function(event) {
      event.preventDefault();
      cb.call(this);
    });
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
    touchToolbar: function(input) {
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

      // TODO: This is a DRY violation.
      makeButton('r', 'remix', makeKeydown('R')).appendTo(toolbar);
      makeButton('del', 'remove', makeKeydown('DELETE')).appendTo(toolbar);
      makeButton('c', 'CSS', makeKeyToggle('C')).appendTo(toolbar);
      makeButton('↑', 'ascend', makeKeydown('UP')).appendTo(toolbar);
      makeButton('↓', 'descend', makeKeydown('DOWN')).appendTo(toolbar);
      makeButton('←', 'undo', makeKeydown('LEFT')).appendTo(toolbar);      
      makeButton('→', 'redo', makeKeydown('RIGHT')).appendTo(toolbar);      
      makeButton('p', 'publish', makeKeydown('P')).appendTo(toolbar);      
      makeButton('esc', 'quit', makeKeydown('ESC')).appendTo(toolbar);
      toolbar.appendTo(document.body);
      
      return {
        unload: function() {
          toolbar.remove();
          toolbar = null;
        }
      };
    }
  });
})(jQuery);
