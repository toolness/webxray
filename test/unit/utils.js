module("utils");

test("$.emit() tests", function() {
  var stuff = jQuery("<div></div>");
  stuff.emit("hello ", jQuery("<em>there</em>"), " dude");
  equal(stuff.html(), "hello <em>there</em> dude",
        "jQuery.emit() works");
});

test("$.overlay() tests", function() {
  var overlay = jQuery("#qunit-header").overlay();
  ok(overlay.hasClass("webxray-overlay"),
     "overlay has the 'webxray-overlay' class");
  ok(true, "overlay() does not throw, and returns a jQuery");
  overlay.remove();
});

test("$.ancestor() tests", function() {
  ok(jQuery("#qunit-header").ancestor(1).get(0) === window.document.body,
     "jQuery.ancestor() works w/ non-null result");
  ok(jQuery("#qunit-header").ancestor(30) === null,
     "jQuery.ancestor() works w/ null result");
});
