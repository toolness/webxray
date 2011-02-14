module("utils");

test("utils tests", function() {
  ok(jQuery("#qunit-header").ancestor(1).get(0) === window.document.body,
     "jQuery.ancestor() works w/ non-null result");
  ok(jQuery("#qunit-header").ancestor(30) === null,
     "jQuery.ancestor() works w/ null result");
  jQuery("#qunit-header").overlay().remove();
  ok(true, "jQuery.overlay() does not throw, and returns a jQuery");

  var stuff = jQuery("<div></div>");
  stuff.emit("hello ", jQuery("<em>there</em>"), " dude");
  equal(stuff.html(), "hello <em>there</em> dude",
        "jQuery.emit() works");
});
