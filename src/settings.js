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
    cssURL: "webxray.css",
    mixMasterDialogURL: "http://labs.toolness.com/dom-tutorial/index.html",
    easyRemixDialogURL: "easy-remix-dialog/index.html",
    shareDialogURL: "share-dialog.html",
    sharePageURL: "share/",
    uprootDialogURL: "uproot-dialog.html"
  };
})(jQuery);
