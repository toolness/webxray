(function(jQuery) {
  "use strict";

  var $ = jQuery;
  var MAX_URL_LENGTH = 35;
  
  jQuery.hudOverlay = function hudOverlay(options) {
    if (options === undefined)
      options = {};

    var hudContainer = $('<div class="webxray-base webxray-hud-box"></div>');
    var hud = $('<div class="webxray-base webxray-hud"></div>');
    var l10n = (options.locale || jQuery.locale).scope("hud-overlay");

    hudContainer.append(hud);
    
    function showDefaultContent() {
      hud.html(options.defaultContent || l10n("default-html"));
    }

    showDefaultContent();

    return {
      overlayContainer: hudContainer[0],
      overlay: hud[0],
      destroy: function destroy() {
        this.overlay = null;
        hudContainer.remove();
        hudContainer = null;
        hud = null;
      },
      onFocusChange: function handleEvent(focused) {
        function code(string) {
          return $("<code></code>").text(string);
        }

        function elementDesc(element) {
          var span = $("<span></span>");
          var tagName = "<" + element.nodeName.toLowerCase() + ">";
      
          span.emit(code(tagName), " ", l10n("element"));
          if (element.id)
            span.emit(" ", l10n("with"), " ", l10n("id"), " ",
                      code(element.id));
          if (element.className)
            span.emit(" " + (element.id ? l10n("and") : l10n("with")),
                      " ", l10n("class"), " ",
                      code(element.className));
          var url = element.href || element.src || element.action ||
                    element.currentSrc;
          if (url && url.length) {
            url = $.shortenText(url, MAX_URL_LENGTH);
            span.emit((element.id || element.className) ? "," : "",
                      " ", l10n("pointing-at"), " ",
                      $('<span class="webxray-url"></span>').text(url));
          }
          return span;
        }

        if (focused.element) {
          var span = $("<span></span>");
          span.emit(l10n("focused-intro"), " ",
                    elementDesc(focused.element), ".");
          if (focused.ancestor)
            span.emit(" ", l10n("ancestor-intro"), " ",
                      elementDesc(focused.ancestor), ".");
          hud.empty().append(span);
        } else
          showDefaultContent();
      }
    };
  };
})(jQuery);
