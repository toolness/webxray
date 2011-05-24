(function(jQuery) {
  "use strict";

  var $ = jQuery;

  jQuery.extend({
    getModalDialogDimensions: function() {
      var div = $('<div class="webxray-dialog-overlay">' +
                  '<div class="webxray-dialog-outer">' +
                  '<div class="webxray-dialog-middle">' +
                  '<div class="webxray-dialog-inner">' +
                  '<div class="webxray-dialog-content">' +
                  '</div></div></div></div></div>');
      $(document.body).append(div);

      var content = div.find('.webxray-dialog-content');
      var pos = content.offset();
      var dimensions = {
        top: pos.top,
        left: pos.left,
        width: content.outerWidth(),
        height: content.outerHeight()
      };
      
      div.remove();
      return dimensions;
    },
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
            div.remove();
            div = null;
            
            // Firefox seems to trigger a mouseout/mouseover event
            // when we remove the dialog div, so we'll wait a moment
            // before re-activating input so that we don't distract
            // the user by focusing on whatever their mouse happens
            // to be over when the dialog closes.
            setTimeout(function() {
              input.activate();
              input = null;
              $(window).focus();
              if (cb)
                cb();
            }, 50);
          });
        }
      };

      input.deactivate();
      $(body).append(div);

      return self;
    }
  });
})(jQuery);
