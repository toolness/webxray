(function(jQuery) {
  "use strict";
  
  var $ = jQuery;

  jQuery.fn.extend({
    makeTextEditable: function makeTextEditable() {
      this.click(function(event) {
        var target = $(event.target);
        
        if (target.isContentEditable)
          return;
        
        var originalValue = target.text();
        var linkedNode = target.data("linked-node");
        
        $(event.target).attr("contentEditable", "true");

        target.bind('DOMNodeInserted.editableText', function(event) {
          var self = this;
          var node = event.target;
          var parent = event.originalEvent.relatedNode;

          // "flatten" the DOM content to be plain text.
          if (node.nodeType == node.ELEMENT_NODE) {
            var text = node.textContent;
            var replacement = document.createTextNode(text);
            try {
              // TODO: Why does this sometimes fail?
              parent.replaceChild(replacement, node);
            } catch (e) {}

            // Safari and Chrome sometimes end up with no selection, so
            // let's make sure the cursor lands somewhere.
            var sel = window.getSelection();
            if (sel.rangeCount == 0) {
              if (!self.firstChild) {
                var newNode = document.createTextNode('');
                self.appendChild(newNode);
              }
              var range = document.createRange();
              range.setStart(self.firstChild, 0);
              range.setEnd(self.firstChild, 0);
              sel.addRange(range);
            }
          }
        });
        target.bind('keyup.editableText', function(event) {
          if (linkedNode)
            linkedNode.nodeValue = target.text();
        });
        target.bind('keydown.editableText', function(event) {
          switch (event.keyCode) {
            case 27:
            target.text(originalValue);
            target.blur();
            return false;

            case 13:
            target.blur();
            return false;
          }
          return true;
        });
        target.bind('blur.editableText', function() {
          target.unbind('.editableText');
          target.attr("contentEditable", "inherit");
        });
        target.focus();
      });
      return this;
    }
  });
})(jQuery);
