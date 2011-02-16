module("tag-colors");

test("jQuery.colorClassForTag()", function() {
  var $ = jQuery;

  equals($.colorClassForTag("img"), "webxray-color-1",
         "existing hard-coded tag names work");
  equals($.colorClassForTag("apoengeg"), "webxray-color-2",
         "random unknown tag names work");
});

test("overlayWithTagColor()", function() {
  var $ = jQuery;
  
  var overlay = $(document.body).overlayWithTagColor(0.5);
  ok(overlay.css("background-color"), "background-color is non-null");
  overlay.remove();
});
