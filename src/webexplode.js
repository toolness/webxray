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

  function makeFocused(element) {
    var ancestor = element;
    var ancestorIndex = 0;

    $(element).addClass("webexplode-focus");

    return {
      upfocus: function upfocus() {
        var ancestorParent = $(element).ancestor(ancestorIndex + 1);

        if (ancestorParent && ancestorParent != document) {
          $(ancestor).removeClass("webexplode-ancestor");
          ancestorIndex++;
          ancestor = ancestorParent;
          $(ancestor).addClass("webexplode-ancestor");
        }
      },
      downfocus: function downfocus() {
        if (ancestorIndex > 0) {
          ancestorIndex--;
          $(ancestor).removeClass("webexplode-ancestor");
          ancestor = $(element).ancestor(ancestorIndex);
          if (ancestorIndex > 0)
            $(ancestor).addClass("webexplode-ancestor");
        }
      },
      unfocus: function unfocus() {
        $(element).removeClass("webexplode-focus");
        $(ancestor).removeClass("webexplode-ancestor");
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
