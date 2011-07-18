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
      "top",
      "left",
      "bottom",
      "right",
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

  function normalizeProperty(style, name) {
    var value = style.getPropertyValue(name);

    if (value) {
      var urlMatch = value.match(/url\("?([^"]*)"?\)/);
    
      if (urlMatch)
        value = urlMatch[1];
    }
    return value;
  }

  function makeCssValueEditable() {
    if ($(this).find('form').length)
      return;

    var row = $(this);
    var nameCell = $(this).find('.webxray-name');
    var valueCell = $(this).find('.webxray-value');
    var originalValue = valueCell.text();
    var form = $('<form><input type="text"></input></form>');
    var textField = form.find("input");

    valueCell.empty().append(form);
    textField.val(originalValue).select().focus();

    // The -1 is needed on Firefox, or else the whole field will
    // wrap to the next line.
    textField.width(row.width() - nameCell.outerWidth() - 1);

    function revertToOriginal() {
      form.remove();
      valueCell.text(originalValue);
    }
    
    textField.blur(revertToOriginal);
    textField.keydown(function(event) {
      // TODO: Use named constant
      if (event.keyCode == 27)
        revertToOriginal();
    });

    form.submit(function() {
      var newValue = textField.val();
      revertToOriginal();
      row.data("propertyWidget").changeValue(newValue);
      return false;
    });
  }

  function buildPropertyWidget(element, row, style, parentStyle, name) {
    var nameCell = $('<div class="webxray-name"></div>');
    var valueCell = $('<div class="webxray-value"></div>');

    // Replace hyphens with non-breaking ones to keep
    // the presentation looking nice.
    nameCell.text(name.replace(/-/g, '\u2011'));
    row.append(nameCell);
    row.append(valueCell);

    function refreshValue() {
      var value = normalizeProperty(style, name);
      valueCell.text(value);
      valueCell.attr("class", "webxray-value");
      if (parentStyle && normalizeProperty(parentStyle, name) != value)
        valueCell.addClass("webxray-value-different-from-parent");
      if (normalizeProperty(element.style, name) == value)
        valueCell.addClass("webxray-value-matches-inline-style");
      if (name.match(/color$/)) {
        var colorBlock = $('<div class="webxray-color-block"></div>');
        colorBlock.css('background-color', value);
        valueCell.append(colorBlock);
      }
    }

    var self = {
      name: name,
      changeValue: function(newValue) {
        var originalValue = valueCell.text();
        if (newValue != originalValue) {
          $(element).css(name, newValue);
          style = window.getComputedStyle(element);
          refreshValue();
          row.trigger('css-property-change');
        }
      }
    };
    
    row.data("propertyWidget", self);
    refreshValue();
  }

  function PrimaryTranslucentOverlay(overlay, primary) {
    var tOverlay = $(primary).overlayWithTagColor(0.2);

    function onCssPropertyChange() {
      tOverlay.show();
      tOverlay.resizeTo(primary, function() {
        tOverlay.fadeOut();
      });
    }

    overlay.bind('css-property-change', onCssPropertyChange);
    tOverlay.hide();

    return {
      destroy: function() {
        overlay.unbind('css-property-change', onCssPropertyChange);
        tOverlay.remove();
      }
    };
  }

  function ModalOverlay(overlay, primary, keys) {
    var startStyle = $(primary).attr("style");
    var translucentOverlay = PrimaryTranslucentOverlay(overlay, primary);
    
    function handleKeyDown(event) {
      if (overlay.find('form').length)
        return;
      if (event.keyCode == keys.I) {
        var hover = overlay.find('.webxray-row:hover');
        if (hover.length) {
          var property = hover.data('propertyWidget').name;
          var url = 'https://developer.mozilla.org/en/CSS/' + property;
          open(url, 'info');
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
    
    function confirmChanges() {
      var endStyle = $(primary).attr("style");
      if (startStyle != endStyle) {
        if (typeof(startStyle) == 'undefined')
          $(primary).removeAttr("style")
        else
          $(primary).attr("style", startStyle);
        self.emit('change-style', endStyle);
      }
      self.close();
    }

    overlay.addClass("webxray-style-info-locked");
    overlay.find('.webxray-row').bind('click', makeCssValueEditable);
    overlay.find('.webxray-close-button').bind('click', confirmChanges);
    window.addEventListener("keydown", handleKeyDown, true);  

    var self = jQuery.eventEmitter({
      close: function() {
        overlay.removeClass("webxray-style-info-locked");
        overlay.find('.webxray-row').unbind('click', makeCssValueEditable);
        overlay.find('.webxray-close-button').unbind('click', confirmChanges);
        window.removeEventListener("keydown", handleKeyDown, true);
        translucentOverlay.destroy();
        self.emit('close');
      }
    });

    return self;
  }

  jQuery.extend({
    styleInfoOverlay: function styleInfoOverlay(options) {
      var focused = options.focused;
      var commandManager = options.commandManager;
      var locale = options.locale || jQuery.locale;
      var body = options.body || document.body;
      var isVisible = false;
      var l10n = locale.scope("style-info");
      var modalOverlay = null;
      
      var overlay = $('<div class="webxray-base webxray-style-info"></div>');
      $(body).append(overlay);
      overlay.hide();
      
      focused.on('change', refresh);
      
      function refresh() {
        if (!isVisible || modalOverlay)
          return;

        var primary = focused.getPrimaryElement();
        overlay.empty();
        
        if (primary) {
          var info = $(primary).getStyleInfo();
          var instructions = $('<div class="webxray-instructions"></div>');
          var close = $('<div class="webxray-close-button"></div>');
          instructions.text(l10n("tap-space"));
          close.text(locale.get("dialog-common:ok"));
          overlay.append(info).append(instructions).append(close);
          overlay.show();
        } else {
          overlay.hide();
        }
      }

      var self = {
        lock: function(input) {
          var primary = focused.getPrimaryElement();
          
          if (primary) {
            input.deactivate();
            modalOverlay = ModalOverlay(overlay, primary, input.keys);
            modalOverlay.on('change-style', function(style) {
              commandManager.run("ChangeAttributeCmd", {
                name: l10n("style-change"),
                attribute: "style",
                value: style,
                element: primary
              });
            });
            modalOverlay.on('close', function() {
              modalOverlay = null;
              self.hide();
              input.activate();
            });
            focused.unfocus();
          }
        },
        show: function() {
          isVisible = true;
          overlay.show();
          refresh();
        },
        hide: function() {
          isVisible = false;
          overlay.hide();
        },
        destroy: function() {
          if (modalOverlay)
            modalOverlay.close();
          focused.removeListener('change', refresh);
          overlay.remove();
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
      var parentStyle = null;
      
      if (element.nodeName != "HTML")
        parentStyle = window.getComputedStyle(element.parentNode);

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

        names.push(name);
      });

      names.sort();

      var NUM_COLS = 1;

      for (var i = 0; i < names.length + (NUM_COLS-1); i += NUM_COLS) {
        var row = $('<div class="webxray-row"></div>');
        for (var j = 0; j < NUM_COLS; j++)
          buildPropertyWidget(element, row, style, parentStyle, names[i+j]);
        info.append(row);
      }

      return info;
    }
  });
})(jQuery);
