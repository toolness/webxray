(function() {
  function getAncestor(element, generation) {
    var ancestor = element;

    for (var i = 0; i < generation; i++)
      if (ancestor.parentNode)
        ancestor = ancestor.parentNode;
      else
        return null;

    return ancestor;
  }
  
  function addClass(element, className) {
    var parts = element.className.split(" ");
    if (parts.indexOf(className) == -1) {
      parts.push(className);
      element.className = parts.join(" ");
    }
  }

  function removeClass(element, className) {
    var parts = element.className.split(" ");
    var index = parts.indexOf(className);
    if (index != -1) {
      parts.splice(index, 1);
      element.className = parts.join(" ");      
    }
  }

  function makeFocused(element) {
    var ancestor = element;
    var ancestorIndex = 0;
    
    addClass(element, "webexplode-focus");
    
    return {
      upfocus: function upfocus() {
        var ancestorParent = getAncestor(element, ancestorIndex + 1);

        if (ancestorParent && ancestorParent != document) {
          removeClass(ancestor, "webexplode-ancestor");
          ancestorIndex++;
          ancestor = ancestorParent;
          addClass(ancestor, "webexplode-ancestor");
        }
      },
      downfocus: function downfocus() {
        if (ancestorIndex > 0) {
          ancestorIndex--;
          removeClass(ancestor, "webexplode-ancestor");
          ancestor = getAncestor(element, ancestorIndex);
          if (ancestorIndex > 0)
            addClass(ancestor, "webexplode-ancestor");
        }
      },
      unfocus: function unfocus() {
        removeClass(element, "webexplode-focus");
        removeClass(ancestor, "webexplode-ancestor");
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
})();
