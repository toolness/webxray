"use strict";

module("uproot", {
  setup: function() {
    var iframes = jQuery('<div id="iframes"></div>');
    iframes.hide();
    jQuery(document.body).append(iframes);
  },
  teardown: function() {
    jQuery("#iframes").remove();
  }
});

[
  'basic-page'
, 'basic-dynamic-page'
, 'complex-doctype'
, 'no-doctype'
].forEach(function(name) {
  asyncTest(name, function() {
    var prefix = 'unit/uproot/';
    var iframe = jQuery("<iframe></iframe>");
    iframe.attr("src", prefix + "source-pages/" + name + "/");
    iframe.load(function() {
      jQuery.get(prefix + 'expected-pages/' + name + '.html',
      function(expected) {
        var docElem = iframe.get(0).contentDocument.documentElement;
        var startHTML = docElem.innerHTML;
        var baseURI = document.location.href + iframe.attr('src');
        expected = expected.replace("{{ BASE_HREF }}", baseURI);
        iframe.uproot(function(actual) {
          equal(jQuery.trim(actual), jQuery.trim(expected),
                "innerHTML matches.");
          equal(docElem.innerHTML, startHTML, "document is unmodified");
          start();
        });
      }, 'text');
    });
    jQuery("#iframes").append(iframe);
  });
});
