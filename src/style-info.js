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

  function anyRuleMatches(rules, name, value) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      
      if (rule.style.getPropertyValue(name) == value)
        return true;
    }
    return false;
  }

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
    getMatchingCssRules: function getRelevantCssRules() {
      var allMatches = [];
      this.each(function() {
        var element = this;
        var doc = this.ownerDocument;
        jQuery.each(document.styleSheets, function() {
          var sheet = this;
          if (!sheet.cssRules)
            return;
          jQuery.each(sheet.cssRules, function() {
            var rule = this;
            if (rule.type == rule.STYLE_RULE) {
              var matches = $(rule.selectorText, doc);

              var matches = doc.querySelectorAll(rule.selectorText);
              
              for (var i = 0; i < matches.length; i++)
                if (matches[i] === element) {
                  allMatches.push(rule);
                  return;
                }
            }
          });
        });
      });
      return allMatches;
    },
    getStyleInfo: function getStyleInfo() {
      var element = this.get(0);
      var window = element.ownerDocument.defaultView;
      var style = window.getComputedStyle(element);

      var info = $('<div class="webxray-rows"></div>');
      var names = [];
      var matchingCssRules = this.getMatchingCssRules();

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

        //var value = style.getPropertyValue(name);
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
          var value = style.getPropertyValue(name);
          var nameCell = $('<div class="webxray-name"></div>');
          var valueCell = $('<div class="webxray-value"></div>');
          nameCell.text(name);
          valueCell.text(value);
          if (anyRuleMatches(matchingCssRules, name, value))
            valueCell.addClass("webxray-value-matches-css-rule");
          if (element.style.getPropertyValue(name) == value)
            valueCell.addClass("webxray-value-matches-inline-style");
          row.append(nameCell);
          row.append(valueCell);
        }
        info.append(row);
      }

      return info;
    }
  });
})(jQuery);
