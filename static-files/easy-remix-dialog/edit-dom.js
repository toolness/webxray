(function(jQuery) {
  "use strict";
  
  var $ = jQuery;

  var EXTRA_WIDTH = 16;
  
  function setFieldSize(field, element, text) {
    var target = element.clone();
    var br = $('<br></br>');
    target.text(text);
    field.after(target);
    field.after(br);
    field.width(target.outerWidth() + EXTRA_WIDTH);
    field.height(target.outerHeight());
    br.remove();
    target.remove();
  }

  jQuery.fn.extend({
    makeTextEditable: function makeTextEditable() {
      this.click(function(event) {
        var target = $(event.target);

        if (target.is('textarea'))
          return;
        
        var form = $('<form></form>');
        var input = $('<textarea></textarea>');
        var linkedNode = target.data("linked-node");
        var originalValue = target.text();
        input.val(originalValue);
        form.append(input);
        target.empty();
        target.append(form);
        setFieldSize(input, target, originalValue);
        input.focus().select();
        function onDone(event) {
          if (linkedNode)
            linkedNode.nodeValue = input.val();
          target.empty();
          target.text(input.val());
          input.unbind();
          form.unbind();
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        input.blur(onDone);
        form.submit(onDone);
        input.keyup(function(event) {
          if (linkedNode)
            linkedNode.nodeValue = input.val();
        });
        input.keypress(function(event) {
          setFieldSize(input, target, input.val());
        });
        input.keydown(function(event) {
          switch (event.keyCode) {
            case 27:
            input.val(originalValue);
            input.blur();
            return false;

            case 13:
            input.blur();
            return false;
          }
          return true;
        });
      });
      return this;
    }
  });
})(jQuery);
