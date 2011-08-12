var Webxray = (function() {
  "use strict";

  var GLOBAL_GOGGLES_LOAD_CB = 'webxrayWhenGogglesLoad';

  return {
    getBookmarkletURL: function getBookmarkletURL(baseURI) {
      baseURI = baseURI || document.baseURI;

      var baseCode = '(function(){var a=document.getElementsByTagName("iframe")[0],a=a?a.contentDocument:document,b=a.createElement("script");b.src="http://localhost:8000/webxray.js";b.className="webxray";a.head.appendChild(b)})();';
      var code = baseCode.replace('http://localhost:8000/', baseURI);
      
      return 'javascript:' + code;
    },
    whenLoaded: function whenLoaded(cb, global) {
      global = global || window;
      global[GLOBAL_GOGGLES_LOAD_CB] = cb;
    },
    triggerWhenLoaded: function triggerWhenLoaded(ui, global) {
      global = global || window;
      if (GLOBAL_GOGGLES_LOAD_CB in global &&
          typeof(global[GLOBAL_GOGGLES_LOAD_CB]) == 'function')
        global[GLOBAL_GOGGLES_LOAD_CB](ui);
    }
  };
})();
