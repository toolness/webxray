module("mix-master");

test("jQuery.mixMaster()", function() {
  var $ = jQuery;

  function mixTest(fn) {
    var element = $('<div><div id="mixmastertest"></div></div>');
    $(document.body).append(element);

    var hud = $.hudOverlay({defaultContent: "hai2u"});
    var focused = jQuery.focusedOverlay();

    var domNode = element.find("#mixmastertest").get(0);
    focused.set(domNode);

    var mixMaster = $.mixMaster({
      hud: hud, 
      focusedOverlay: focused,
      prompt: function() {
        return '<em>hello</em>';
      }
    });

    fn(mixMaster, element, hud);

    $(element).remove();
    focused.destroy();
    hud.destroy();
  }

  mixTest(function(mixMaster, element, hud) {
    var domNode = element.find("#mixmastertest").get(0);

    mixMaster.replaceFocusedElement();
    equal(element.html(), '<em>hello</em>', "Simulating replacement works");
    equal($(hud.overlay).text(), 'Busted replacement.');

    mixMaster.undo();
    equal(element.find("#mixmastertest").length, 1,
          "Simulating undo works");
    equal($(hud.overlay).text(), 'Unbusted replacement.');

    ok(element.find("#mixmastertest").get(0) === domNode,
       "Undo restores original DOM node, not just HTML.");

    mixMaster.redo();

    equal(element.find("#mixmastertest").length, 0,
          "Simulating redo works");
    equal($(hud.overlay).text(), 'Rebusted replacement.');
  });

  mixTest(function(mixMaster) {
    var infoURL;
    mixMaster.infoForFocusedElement(function open(url) { infoURL = url; });
    equal(infoURL, 'https://developer.mozilla.org/en/HTML/Element/div',
          'info URL is correct');
  });

  mixTest(function(mixMaster, element, hud) {
    mixMaster.deleteFocusedElement();
    equal(element.html(), '<span style="display: none;"></span>',
          "Simulating deletion works");
    equal($(hud.overlay).text(), 'Busted deletion.');
  });
});
