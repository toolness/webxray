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
  
  jQuery.extend({
    touchInput: function(input) {
      function makeKeydown(key) {
        return function() {
          var fakeEvent = {
            type: "keydown",
            keyCode: jQuery.keys[key],
            altKey: false,
            ctrlKey: false,
            altGraphKey: false,
            metaKey: false,
            preventDefault: function() {},
            stopPropagation: function() {}
          };
          input.handleEvent(fakeEvent);
        }
      }

      var toolbar = $('<div class="webxray-base webxray-toolbar"></div>');
      makeButton('esc', 'quit', makeKeydown('ESC')).appendTo(toolbar);
      makeButton('r', 'remix', makeKeydown('R')).appendTo(toolbar);
      makeButton('t', 'publish', makeKeydown('T')).appendTo(toolbar);      
      toolbar.appendTo(document.body);
      
      var lastTouch = null;
      
      function onMove(event) {
        var touches = event.changedTouches;
        var touch = touches[0];
        var element = document.elementFromPoint(touch.clientX,
                                                touch.clientY);
        if (!isValidFocusTarget(element)) {
          if ($(element).closest(".webxray-toolbar-button")) {
            $(element).click();
          }
          return;
        }
        
        if (element == lastTouch)
          return;
        lastTouch = element;
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
