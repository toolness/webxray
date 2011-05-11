(function(jQuery) {
  "use strict";

  var $ = jQuery;

  jQuery.extend({
    modalDialog: function(options) {
      var input = options.input;
      var body = options.body || document.body;
      var div = $('<div class="webxray-dialog-overlay">' +
                  '<div class="webxray-dialog-outer">' +
                  '<div class="webxray-dialog-middle">' +
                  '<div class="webxray-dialog-inner">' +
                  '</div></div></div></div>');
      
      var self = {
        content: div.find('.webxray-dialog-inner'),
        close: function close(cb) {
          div.fadeOut(function() {
            input.activate();
            div.remove();
            input = null;
            div = null;
            $(window).focus();
            if (cb)
              cb();
          });
        }
      };

      input.deactivate();
      $(body).append(div);

      return self;
    }
  });
})(jQuery);
