module("tag-colors");

test("jQuery.colorForTag()", function() {
  var $ = jQuery;

  equals($.colorForTag("img"), "#C60C46",
         "existing hard-coded tag names work");
  equals($.colorForTag("apoengeg"), "#00AEEF",
         "random unknown tag names work");
});

test("overlayWithTagColor()", function() {
  var $ = jQuery;
  
  var overlay = $(document.body).overlayWithTagColor(0.5);
  ok(overlay.css("background-color"), "background-color is non-null");
  overlay.remove();
});
