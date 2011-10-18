(function(jQuery) {
  "use strict";
  
  var $ = jQuery;

  jQuery.fn.extend({
    makeTextEditable: function makeTextEditable() {
      this.each(function() {
        var target = $(this);
        var isBlock = (target.css('display') == 'block');
        var linkedNode = target.data("linked-node");
        var widget;
        if (isBlock) {
          widget = $('<textarea></textarea>');
          widget.css({
            width: target.width(),
            height: target.height()
          });
        } else
          widget = $('<input type="text"></input>');

        var originalValue = target.text();
        var pxPerChar;

        widget.val(originalValue);

        function resizeInline() {
          var newValueLen = widget.val().length;
          if (newValueLen == 0)
            newValueLen = 1;
          console.log("width of", widget.val(), "is", pxPerChar * newValueLen);
          widget.width(pxPerChar * newValueLen);
        }

        if (!isBlock) {
          target.text('m');
          // TODO: Where does this 13 come from? What's going on?
          pxPerChar = target.width() - 13;
          console.log("pxPerChar is", pxPerChar);
          resizeInline();
        }
        
        widget.keyup(function() {
          if (isBlock) {
            var placeholdingText = $('<div></div>');
            widget.parent().append(placeholdingText);
            placeholdingText.text(widget.val());
            widget.css({
              width: placeholdingText.width(),
              height: placeholdingText.height()
            });
            placeholdingText.remove();
          } else {
            resizeInline();
          }
          if (linkedNode)
            linkedNode.nodeValue = widget.val();
        });

        target.empty().append(widget);
      });

      return this;
    }
  });
})(jQuery);
