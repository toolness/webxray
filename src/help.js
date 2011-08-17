(function(jQuery) {
  "use strict";

  var $ = jQuery;

  function createLocalizedHelp(keys, locale, platform) {
    locale = locale || jQuery.locale;
    platform = platform || navigator.platform;
    
    var descriptions = locale.scope('command-descriptions');
    var localizedKeys = [];
    keys.forEach(function(info) {
      var localizedInfo = {key: null, desc: null};
      var normalKey = "key-names:" + info.key;
      var osKey = normalKey + "-" + platform;
      
      localizedInfo.key = locale[osKey] ||
                          locale[normalKey] ||
                          info.key;
      localizedInfo.desc = descriptions(info.cmd);
      localizedKeys.push(localizedInfo);
    });
    return localizedKeys;
  }
  
  jQuery.extend({
    createKeyboardHelpReference: function(keyboardHelp, locale, platform) {
      var keys = createLocalizedHelp(keyboardHelp, locale, platform);
      var table = $('<div class="webxray-help-box"></div>');
      keys.forEach(function(info) {
        var row = $('<div class="webxray-help-row"></div>');
        var keyCell = $('<div class="webxray-help-key"></div>');
        var keyValue = $('<div class="webxray-help-desc"></div>');
        
        keyCell.append($('<div class="webxray-kbd"></div>').text(info.key));
        keyValue.text(info.desc);
        row.append(keyCell).append(keyValue);
        table.append(row);
      });
      return table;
    }
  });
})(jQuery);
