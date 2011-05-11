(function(jQuery) {
  "use strict";

  var $ = jQuery;
  
  jQuery.fn.extend({
    uproot: function(cb) {
      var elem = this[0];
      var document = elem.contentDocument || elem;
      if (document.nodeName != "#document")
        throw new Error("first item of query must be a document or iframe");
      var base = $('base', document);
      if (base.length == 0) {
        base = document.createElement('base');
        $(base).attr('href', document.location.href);
        $(document.head).prepend(base);
      }
      $('script', document).remove();
      if (cb)
        setTimeout(function() {
          cb.call(elem, document.documentElement.innerHTML);
        }, 0);
    }
  });
})(jQuery);
