module("utils", htmlFixture("utils"));

test("outerHtml()", function() {
  var html = '<div class="blah">hi</div>';
  var element = jQuery(html);
  equal(element.outerHtml(), html, "works w/ one matched element");

  var moreHtml = '<div class="foo">bop</div>';
  equal(element.add(jQuery(moreHtml)).outerHtml(), html + moreHtml,
        "works w/ more than one matched element");
});

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

test("temporarilyRemove()", function() {
  var div = jQuery("<div><p>hello</p><span>hi</span></div>");
  var p = div.find("p").get(0);
  var removal = jQuery(p).temporarilyRemove();
  equals(div.html(), "<span>hi</span>");
  removal.undo();
  equals(div.html(), "<p>hello</p><span>hi</span>");
  ok(p === div.find("p").get(0));
});

test("pathTo()", function() {
  var $ = jQuery;
  $("#qunit-fixture #utils .test-case").each(function() {
    var root = this;
    
    var expect = $(root).attr("data-expect");
    var target = $(root).find('[data-target="true"]').get(0);
    var actual = $(root).pathTo(target);
    equals(actual, expect, "actual CSS path is same as expected");

    var matches = $(root).find(expect);
    if (matches.length != 1 || matches.get(0) !== target)
      throw new Error("expected path is not actually valid!");
  });
});

test("jQuery.shortenText()", function() {
  equals(jQuery.shortenText('hello', 3), 'hel\u2026');
  equals(jQuery.shortenText('hello', 5), 'hello');
  equals(jQuery.shortenText('hello', 200), 'hello');
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
