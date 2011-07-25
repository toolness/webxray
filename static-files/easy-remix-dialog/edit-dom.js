(function(jQuery) {
  "use strict";
  
  var $ = jQuery;

  jQuery.fn.extend({
    makeTextEditable: function makeTextEditable() {
      this.click(function(event) {
        var target = $(event.target);
        
        if ($(event.target).attr("contentEditable") != "inherit")
          return;
        
        var originalValue = target.text();
        var linkedNode = target.data("linked-node");
        
        $(event.target).attr("contentEditable", "true");

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
