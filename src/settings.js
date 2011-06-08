(function(jQuery) {
  "use strict";
  
  jQuery.webxraySettings = {
    extend: jQuery.extend,
    url: function(name) {
      if (this[name].match(/^https?:/))
        return this[name];
      return this.baseURI + this[name];
    },
    baseURI: "",
    mixMasterDialogURL: "http://labs.toolness.com/dom-tutorial/"
  };
})(jQuery);
