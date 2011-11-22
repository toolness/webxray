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
    touchToolbar: function(input, locale, platform) {
      locale = locale || jQuery.locale;
      platform = platform || navigator.platform;

      function makeKeydown(key) {
        return function() {
          input.handleEvent(makeFakeEvent({
            type: "keydown",
            keyCode: jQuery.keys[key]
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
            keyCode: jQuery.keys[key]
          }));
        }
      }

      var toolbar = $('<div class="webxray-base webxray-toolbar"></div>');
      var keyNames = locale.scope('key-names');
      var shortDescriptions = locale.scope('short-command-descriptions');

      input.keyboardHelp.forEach(function(binding) {
        if (binding.cmd == 'help')
          return;
        makeButton(jQuery.nameForKey(binding.key, locale, platform),
                   shortDescriptions(binding.cmd),
                   makeKeydown(binding.key)).appendTo(toolbar);
      });
      
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
