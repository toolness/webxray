(function(jQuery) {
  "use strict";

  var $ = jQuery;

  var cssProperties = {
    directional: [
      "margin-",
      "padding-",
      "border-",
    ],
    groups: [
      "background-",
      "font-",
      "text-",
      "list-style-"
    ],
    properties: [
      "color",
      "clear",
      "cursor",
      "direction",
      "display",
      "position",
      "float",
      "letter-spacing",
      "line-height",
      "opacity",
      "visibility",
      "white-space",
      "vertical-align",
      "word-spacing",
      "word-wrap",
      "z-index"
    ]
  };

  jQuery.extend({
    styleInfoOverlay: function styleInfoOverlay(options) {
      var focused = options.focused;
      var body = options.body || document.body;
      var isVisible = false;
      
      var overlay = $('<div class="webxray-base webxray-style-info"></div>');
      $(body).append(overlay);
      overlay.hide();
      
      focused.on('change', function() {
        if (isVisible) {
          refresh();
        }
      });
      
      function refresh() {
        overlay.empty();
        var primary = focused.getPrimaryElement();
        if (primary) {
          var info = $(primary).getStyleInfo();
          overlay.append(info);
        }
      }

      var self = {
        show: function() {
          isVisible = true;
          refresh();
          overlay.show();
        },
        hide: function() {
          isVisible = false;
          overlay.hide();
        }
      };

      return self;
    }
  });
  
  jQuery.fn.extend({
    getStyleInfo: function getStyleInfo() {
      var element = this.get(0);
      var window = element.ownerDocument.defaultView;
      var style = window.getComputedStyle(element);

      var info = $('<div class="webxray-rows"></div>');
      var names = [];

      jQuery.each(style, function() {
        var name = this;
        var isNameValid = false;
        
        cssProperties.groups.forEach(function(begin) {
          if (name.indexOf(begin) == 0)
            isNameValid = true;
        });
        cssProperties.properties.forEach(function(prop) {
          if (name == prop)
            isNameValid = true;
        });
        if (!isNameValid)
          return;
        var value = style.getPropertyValue(name);

        //if (value.match(/^(none|auto|normal)/))
        //  return;

        names.push(name);
      });

      names.sort();

      var NUM_COLS = 1;

      for (var i = 0; i < names.length + NUM_COLS; i += NUM_COLS) {
        var row = $('<div class="webxray-row"></div>');
        for (var j = 0; j < NUM_COLS; j++) {
          var name = names[i+j];
          var nameCell = $('<div class="webxray-name"></div>');
          var valueCell = $('<div class="webxray-value"></div>');
          nameCell.text(name);
          valueCell.text(style.getPropertyValue(name));
          row.append(nameCell);
          row.append(valueCell);
        }
        info.append(row);
      }

      return info;
    }
  });
})(jQuery);
