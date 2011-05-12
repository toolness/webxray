(function(jQuery) {
  "use strict";

  var $ = jQuery;
  
  function makeDoctypeTag(doctype) {
    if (!doctype)
      return '';
    var tag = '<!DOCTYPE ' + doctype.name;
    if (doctype.publicId.length)
      tag += ' PUBLIC "' + doctype.publicId + '"';
    if (doctype.systemId.length)
      tag += ' "' + doctype.systemId + '"';
    return tag += '>';
  }
  
  jQuery.extend({
    openUprootDialog: function(input) {
      $(document).uproot({
        success: function(html) {
          var dialog = jQuery.modalDialog({
            input: input,
            url: jQuery.webxraySettings.baseURI + "uproot-dialog.html"
          });
          dialog.iframe.one("load", function() {
            this.contentWindow.postMessage(html, "*");
            $(this).show().bind("message", function(event, data) {
              dialog.close();
            });
          });
        },
        ignore: $(".webxray-hud, .webxray-overlay, " +
                  ".webxray-dialog-overlay, link.webxray")
      });
    }
  });
  
  jQuery.fn.extend({
    uproot: function(cb) {
      var options = {
        ignore: $()
      };
      if (typeof(cb) == 'object') {
        options = cb;
        cb = options.success;
      }
      var elem = this[0];
      var document = elem.contentDocument || elem;
      if (document.nodeName != "#document")
        throw new Error("first item of query must be a document or iframe");
      var base = document.createElement('base');
      if ($('base', document).length == 0) {
        $(base).attr('href', document.location.href);
        $(document.head).prepend(base);
      }
      if (cb)
        setTimeout(function() {
          var ignore = options.ignore.add('script', document);
          var removal = ignore.temporarilyRemove();
          var doctype = makeDoctypeTag(document.doctype);
          var html = doctype + '\n<html>' +
                     document.documentElement.innerHTML + '</html>';
          removal.undo();
          $(base).remove();
          cb.call(elem, html);
        }, 0);
    }
  });
})(jQuery);
