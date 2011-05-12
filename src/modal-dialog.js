(function(jQuery) {
  "use strict";

  var $ = jQuery;

  jQuery.extend({
    modalDialog: function(options) {
      var input = options.input;
      var body = options.body || document.body;
      var url = options.url;
      var div = $('<div class="webxray-dialog-overlay">' +
                  '<div class="webxray-dialog-outer">' +
                  '<div class="webxray-dialog-middle">' +
                  '<div class="webxray-dialog-inner">' +
                  '<iframe src="' + url + '"></iframe>' +
                  '</div></div></div></div>');
      var iframe = div.find("iframe");
      
      function onMessage(event) {
        if (event.source == self.iframe.get(0).contentWindow) {
          iframe.trigger("message", [event.data]);
        }
      }

      window.addEventListener("message", onMessage, false);
      iframe.hide();

      var self = {
        iframe: iframe,
        close: function close(cb) {
          div.fadeOut(function() {
            window.removeEventListener("message", onMessage, false);
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
