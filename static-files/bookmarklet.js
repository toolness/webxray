function getGogglesBookmarkletURL(baseURI) {
  "use strict";

  var baseCode = '(function(){"use strict";var script=document.createElement("script");script.src="http://localhost:8000/webxray.js";script.className="webxray";document.head.appendChild(script);})();';

  baseURI = baseURI || document.baseURI;
  return 'javascript:' + baseCode.replace('http://localhost:8000/', baseURI);
}
