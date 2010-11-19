(function(jQuery) {
  var $ = jQuery;
  
  jQuery.focusedOverlay = function focusedOverlay() {
    var ancestorIndex = 0;
    var ancestorOverlay = null;
    var overlay = null;
    var element = null;

    function setAncestorOverlay(ancestor) {
      if (ancestorOverlay) {
        ancestorOverlay.remove();
        ancestorOverlay = null;
      }
      if (ancestor) {
        ancestorOverlay = ancestor.overlay();
        ancestorOverlay.addClass("webexplode-ancestor");
        instance.ancestor = ancestor[0];
      } else
        instance.ancestor = null;
    }

    var instance = {
      element: null,
      ancestor: null,
      upfocus: function upfocus() {
        if (!element)
          return;
        var ancestor = $(element).ancestor(ancestorIndex + 1);

        if (ancestor.length && ancestor[0] != document) {
          ancestorIndex++;
          setAncestorOverlay(ancestor);
        }
      },
      downfocus: function downfocus() {
        if (!element)
          return;
        setAncestorOverlay(null);
        if (ancestorIndex > 0 && --ancestorIndex > 0) {
          var ancestor = $(element).ancestor(ancestorIndex);
          setAncestorOverlay(ancestor);
        }
      },
      unfocus: function unfocus() {
        if (!element)
          return;
        overlay.remove();
        overlay = null;
        element = this.element = null;
        setAncestorOverlay(null);
      },
      set: function set(newElement) {
        this.unfocus();
        element = this.element = newElement;
        overlay = $(element).overlay().addClass("webexplode-focus");
      }
    };
    
    return instance;
  }
})(jQuery);
