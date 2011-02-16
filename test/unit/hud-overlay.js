module("hud-overlay");

test("jQuery.hudOverlay() defaultContent works", function() {
  var $ = jQuery;
  var hud = $.hudOverlay({defaultContent: "hai2u"});
  equals($(hud.overlay).html(), "hai2u");
  hud.destroy();
});
