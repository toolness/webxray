var Webxray = (function() {
  "use strict";

  var GLOBAL_GOGGLES_LOAD_CB = 'webxrayWhenGogglesLoad';

  return {
    getBookmarkletURL: function getBookmarkletURL(baseURI) {
      baseURI = baseURI || document.baseURI;

      var baseCode = "(function(){var script=document.createElement('script');script.src='http://localhost:8000/webxray.js';script.className='webxray';document.head.appendChild(script);})();";
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
