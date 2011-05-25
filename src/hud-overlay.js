(function(jQuery) {
  "use strict";

  var $ = jQuery;
  var MAX_URL_LENGTH = 35;

  jQuery.hudOverlay = function hudOverlay(options) {
    var hud = $('<div class="webxray-base webxray-hud"></div>');

    if (options === undefined)
      options = {};

    function showDefaultContent() {
      hud.html(options.defaultContent ||
               "<span>Web X-Ray Goggles activated! " +
               "Press ESC to deactivate.</span>");
    }

    showDefaultContent();

    return {
      overlay: hud[0],
      destroy: function destroy() {
        this.overlay = null;
        hud.remove();
        hud = null;
      },
      onFocusChange: function handleEvent(focused) {
        function code(string) {
          return $("<code></code>").text(string);
        }

        function elementDesc(element) {
          var span = $("<span></span>");
          var tagName = "<" + element.nodeName.toLowerCase() + ">";
      
          span.emit(code(tagName), " element");
          if (element.id)
            span.emit(" with id ", code(element.id));
          if (element.className)
            span.emit(element.id ? " and" : " with", " class ",
                      code(element.className));
          var url = element.href || element.src || element.action ||
                    element.currentSrc;
          if (url && url.length) {
            url = $.shortenText(url, MAX_URL_LENGTH);
            span.emit((element.id || element.className) ? "," : "",
                      " pointing at ",
                      $('<span class="webxray-url"></span>').text(url));
          }
          return span;
        }

        if (focused.element) {
          var span = $("<span></span>");
          span.emit("You are on a ", elementDesc(focused.element), ".");
          if (focused.ancestor)
            span.emit(" It is inside a ", elementDesc(focused.ancestor),
                      ".");
          hud.empty().append(span);
        } else
          showDefaultContent();
      }
    };
  };
})(jQuery);
