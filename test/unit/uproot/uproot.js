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

// Only run this test if we're not being served from a simple
// clone of the repository (i.e. simplesauce).
if (!location.search.match(/externalreporter=1/))
  asyncTest("uprootIgnoringWebxray() works", function() {
    var iframe = jQuery("<iframe></iframe>");
    iframe.attr("src", "unit/uproot/source-pages/basic-page/");
    iframe.load(function() {
      var window = iframe[0].contentWindow;
      Webxray.whenLoaded(function(ui) {
        ok(ui.jQuery.webxrayBuildMetadata.date,
           "build date is " + ui.jQuery.webxrayBuildMetadata.date);
        ok(ui.jQuery.webxrayBuildMetadata.commit &&
           ui.jQuery.webxrayBuildMetadata.commit != "unknown",
           "build commit is " + ui.jQuery.webxrayBuildMetadata.commit);
        ok(ui.jQuery(".webxray-base").length,
           ".webxray-base in goggles-injected document");
        ui.jQuery(window.document).uprootIgnoringWebxray(function(html) {
          ok(html.indexOf('webxray-base') == -1,
             ".webxray-base not in goggles-injected uproot");
          start();
        });
      }, window);
      window.location = Webxray.getBookmarkletURL("../../../../../");
    });
    jQuery("#iframes").append(iframe).show();
  });

[
  'basic-page'
, 'basic-dynamic-page'
, 'complex-doctype'
, 'no-doctype'
].forEach(function(name) {
  var $ = jQuery;
  asyncTest(name, function() {
    var prefix = 'unit/uproot/';
    var iframe = jQuery("<iframe></iframe>");
    iframe.attr("src", prefix + "source-pages/" + name + "/");
    iframe.load(function() {
      jQuery.get(prefix + 'expected-pages/' + name + '.html',
      function(expected) {
        var docElem = iframe.get(0).contentDocument.documentElement;
        var startHTML = docElem.innerHTML;
        var baseURI = $('<a></a>').attr('href', iframe.attr('src'))[0].href;
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
