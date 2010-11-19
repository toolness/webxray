(function(jQuery) {
  var $ = jQuery;
  
  jQuery.focusedOverlay = function focusedOverlay() {
    var ancestorIndex = 0;
    var ancestorOverlay = null;
    var overlay = null;
    var element = null;

    function labelOverlay(overlay, target) {
      ["top", "bottom"].forEach(function(className) {
        var part = $('<div class="webexplode-overlay-label"></div>');
        part.addClass("webexplode-overlay-label-" + className);
        part.text("<" + (className == "bottom" ? "/" : "") +
                  target.nodeName.toLowerCase() + ">");
        overlay.append(part);
      });
    }

    function setAncestorOverlay(ancestor) {
      if (ancestorOverlay) {
        ancestorOverlay.remove();
        ancestorOverlay = null;
      }
      if (ancestor) {
        ancestorOverlay = ancestor.overlay();
        ancestorOverlay.addClass("webexplode-ancestor");
        labelOverlay(ancestorOverlay, ancestor[0]);
        instance.ancestor = ancestor[0];
      } else
        instance.ancestor = null;
    }

    var instance = jQuery.eventEmitter({
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
        this.emit('change', this);
      },
      downfocus: function downfocus() {
        if (!element)
          return;
        setAncestorOverlay(null);
        if (ancestorIndex > 0 && --ancestorIndex > 0) {
          var ancestor = $(element).ancestor(ancestorIndex);
          setAncestorOverlay(ancestor);
        }
        this.emit('change', this);
      },
      unfocus: function unfocus() {
        if (!element)
          return;
        overlay.remove();
        overlay = null;
        element = this.element = null;
        setAncestorOverlay(null);
        this.emit('change', this);
      },
      set: function set(newElement) {
        this.unfocus();
        element = this.element = newElement;
        overlay = $(element).overlay().addClass("webexplode-focus");
        labelOverlay(overlay, element);
        this.emit('change', this);
      },
      destroy: function destroy() {
        this.unfocus();
        this.removeAllListeners('change');
      }
    });
    
    return instance;
  }
})(jQuery);
