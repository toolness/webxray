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
    },
    morphElementIntoDialog: function(options) {
      var input = options.input;
      var element = options.element;
      var body = options.body || document.body;
      var url = options.url;
      var overlay = $(element).overlayWithTagColor(1.0);
      var backdrop = $('<div class="webxray-dialog-overlay"></div>');

      // Closing the dialog we make later will re-activate this for us.
      input.deactivate();

      $(body).append(backdrop);
      overlay.addClass('webxray-topmost');
      overlay.animate(jQuery.getModalDialogDimensions(), function() {
        var dialog = jQuery.modalDialog({
          input: input,
          body: body,
          url: url
        });
        
        backdrop.remove();

        dialog.iframe.one("load", function onLoad() {
          overlay.fadeOut(function() {
            overlay.remove();
            options.onLoad(dialog);
          });
        });        
      });
    },
    morphDialogIntoElement: function(options) {
      var element = options.element;
      var dialog = options.dialog;
      var overlay = dialog.iframe.overlay();
      
      overlay.applyTagColor(element, 1.0);
      overlay.hide();
      overlay.fadeIn(function() {
        dialog.close(function() {
          overlay.resizeTo(element, function() {
            $(this).fadeOut(function() { $(this).remove(); });
            options.onDone();
          });
        });
      });
    }
  });
})(jQuery);
