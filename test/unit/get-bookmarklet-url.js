"use strict";

module("get-bookmarklet-url");

test("jQuery.getGogglesBookmarkletURL()", function() {
  ok(jQuery.getGogglesBookmarkletURL().indexOf(document.baseURI) != -1,
     "works with no arg");
  ok(jQuery.getGogglesBookmarkletURL("blargy").indexOf("blargy") != -1,
     "works with URL arg");
});

test("jQuery.whenGogglesLoad()", function() {
  var global = {};
  var cbCalled = [];
  
  jQuery.triggerWhenGogglesLoad({}, global);
  ok(true, "triggering callback when none registered does nothing");
  jQuery.whenGogglesLoad(function(ui) {
    cbCalled.push(ui);
  }, global);
  equal(cbCalled.length, 0, "callback not called on registration");
  ok('webxrayWhenGogglesLoad' in global,
     "callback embedded in global object");
  jQuery.triggerWhenGogglesLoad({blah: 1}, global);
  equal(cbCalled[0].blah, 1, "callback is called with ui object");
  jQuery.whenGogglesLoad(null, global);
  jQuery.triggerWhenGogglesLoad({}, global);
  equal(cbCalled.length, 1, "callback isn't called after unregistration");
});
