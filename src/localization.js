(function(jQuery) {
  "use strict";

  var currentLocale = {};

  function normalizeLanguage(language) {
    var match = language.match(/([A-Za-z]+)-([A-Za-z]+)/);
    if (match)
      return match[1].toLowerCase() + "-" + match[2].toUpperCase();
    return language;
  }
  
  jQuery.localization = {
    extend: function extend(language, scope, obj) {
      language = normalizeLanguage(language);
      if (!(language in this))
        this[language] = {};
      for (var name in obj)
        this[language][scope + ":" + name] = obj[name];
    },
    scope: function scope(scope, locale) {
      locale = locale || currentLocale;
      return function(name) {
        var scopedName = scope + ":" + name;
        return locale[scopedName] || "unable to find locale string " + 
               scopedName;
      }
    },
    createLocale: function makeLocale(languages) {
      var self = this;
      var locale = {};
      languages.forEach(function(language) {
        // We especially want to do this in the case where the client
        // is just passing in navigator.language, which is all lowercase
        // in Safari.
        language = normalizeLanguage(language);
        if (language in self)
          jQuery.extend.call(locale, self[language]);
      });
      return locale;
    },
    init: function init(languages) {
      currentLocale = this.createLocale(languages);
    }
  };
})(jQuery);
