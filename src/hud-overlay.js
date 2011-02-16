(function(jQuery) {
  var $ = jQuery;

  jQuery.hudOverlay = function hudOverlay(options) {
    var hud = $('<div class="webxray-hud"></div>');

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
