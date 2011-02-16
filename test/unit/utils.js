module("utils");

test("emit()", function() {
  var stuff = jQuery("<div></div>");
  stuff.emit("hello ", jQuery("<em>there</em>"), " dude");
  equal(stuff.html(), "hello <em>there</em> dude",
        "emit() appends text nodes and HTML");
});

test("overlay()", function() {
  var overlay = jQuery("#qunit-header").overlay();
  ok(overlay.hasClass("webxray-overlay"),
     "overlay has the 'webxray-overlay' class");
  ok(true, "overlay() does not throw");
  overlay.remove();
});

test("ancestor()", function() {
  ok(jQuery("#qunit-header").ancestor(1).get(0) === window.document.body,
     "ancestor() works w/ non-null result");
  ok(jQuery("#qunit-header").ancestor(30) === null,
     "ancestor() works w/ null result");
});

test("jQuery.makeRGBA()", function() {
  equals(jQuery.makeRGBA("rgb(120, 255, 255)", 0.5),
         "rgba(120, 255, 255, 0.5)",
         "works w/ rgb() triples");
  equals(jQuery.makeRGBA("rgb(120,255,255)", 0.5),
         "rgba(120, 255, 255, 0.5)",
         "works w/ rgb() triples w/o whitespace");
  equals(jQuery.makeRGBA("#ffaaff", 1.0), "rgba(255, 170, 255, 1)",
         "works with lowercase hex colors");
  equals(jQuery.makeRGBA("#FFAAFF", 1.0), "rgba(255, 170, 255, 1)",
         "works with uppercase hex colors");
         
  var div = jQuery('<div style="color: #C60C46;"></div>');
  jQuery(document.body).append(div);
  equals(jQuery.makeRGBA(div.css("color"), "0.5"),
         "rgba(198, 12, 70, 0.5)",
         "works with css('color') on this browser");
  div.remove();
});
