(function(jQuery) {
  "use strict";

  var currentLocale = {};

  jQuery.localization = {
    extend: function extend(language, scope, obj) {
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
