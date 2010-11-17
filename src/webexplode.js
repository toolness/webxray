(function(jQuery) {
  var $ = jQuery;

  jQuery.fn.extend({
    ancestor: function ancestor(generation) {
      var ancestor = this[0];
      
      for (var i = 0; i < generation; i++)
        if (ancestor.parentNode)
          ancestor = ancestor.parentNode;
        else
          return null;

      return ancestor;      
    }
  });

  function makeOverlay(element, subclass) {
    var pos = $(element).position();
    var overlay = $('<div class="webexplode-overlay">&nbsp;</div>');
    overlay.addClass(subclass);
    overlay.css({
      top: pos.top,
      left: pos.left,
      height: $(element).outerHeight(),
      width: $(element).outerWidth()
    });
    $(document.body).append(overlay);
    return overlay;
  }

  function makeFocused(element) {
    var ancestorIndex = 0;
    var ancestorOverlay = null;
    var overlay = makeOverlay(element, "webexplode-focus");

    return {
      element: element,
      upfocus: function upfocus() {
        var ancestor = $(element).ancestor(ancestorIndex + 1);

        if (ancestor && ancestor != document) {
          ancestorIndex++;
          if (ancestorOverlay)
            ancestorOverlay.remove();
          ancestorOverlay = makeOverlay(ancestor, "webexplode-ancestor");
        }
      },
      downfocus: function downfocus() {
        if (ancestorOverlay)
          ancestorOverlay.remove();
        if (ancestorIndex > 0) {
          ancestorIndex--;
          var ancestor = $(element).ancestor(ancestorIndex);
          if (ancestorIndex > 0)
            ancestorOverlay = makeOverlay(ancestor, "webexplode-ancestor");
        }
      },
      unfocus: function unfocus() {
        overlay.remove();
        if (ancestorOverlay)
          ancestorOverlay.remove();
      }
    };
  }

  function begin() {
    var focused = null;

    document.addEventListener("keydown", function(event) {
      if (event.keyCode == 65 && focused) {
        focused.upfocus();
        event.stopPropagation();
      } else if (event.keyCode == 90 && focused) {
        focused.downfocus();
        event.stopPropagation();
      }
    }, true);
    
    document.addEventListener("mouseout", function(event) {
      event.stopPropagation();
      if (focused)
        focused.unfocus();
      focused = null;
    }, true);
    
    document.addEventListener("mouseover", function(event) {
      event.stopPropagation();
      if (focused)
        focused.unfocus();
      focused = makeFocused(event.target);
    }, true);    
    console.log("inspector loaded.");
  }
  
  if (document.readyState == "complete")
    begin();
  else
    console.error("odd, document readyState is " + document.readyState);
})(jQuery);
