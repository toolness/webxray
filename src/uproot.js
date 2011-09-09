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
      $(document).uprootIgnoringWebxray(function(html) {
        jQuery.simpleModalDialog({
          input: input,
          url: jQuery.webxraySettings.url("uprootDialogURL"),
          payload: JSON.stringify({
            html: html,
            hackpubURL: jQuery.webxraySettings.url("hackpubURL"),
            originalURL: window.location.href
          })
        });
      });
    }
  });
  
  jQuery.fn.extend({
    uprootIgnoringWebxray: function(cb) {
      $(document).uproot({
        success: cb,
        ignore: $(".webxray-hud, .webxray-overlay, " +
                  ".webxray-dialog-overlay, link.webxray, " +
                  "#webxray-is-active")
      });
    },
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
          var head = document.head.innerHTML;
          var body = document.body.innerHTML;
          removal.undo();
          $(base).remove();
          cb.call(elem, html, head, body);
        }, 0);
    }
  });
})(jQuery);
