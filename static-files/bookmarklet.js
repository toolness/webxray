(function(jQuery) {
  "use strict";

  jQuery.extend({
    getGogglesBookmarkletURL: function getGogglesBookmarkletURL(baseURI) {
      baseURI = baseURI || document.baseURI;

      var baseCode = '(function(){"use strict";var script=document.createElement("script");script.src="http://localhost:8000/webxray.js";script.className="webxray";document.head.appendChild(script);})();';
      var code = baseCode.replace('http://localhost:8000/', baseURI);
      
      return 'javascript:' + code;
    }
  });
})(jQuery);
