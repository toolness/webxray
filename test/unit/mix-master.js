module("mix-master");

test("jQuery.mixMaster()", function() {
  var $ = jQuery;
  
  var element = $('<div><div id="mixmastertest"></div></div>');
  $(document.body).append(element);
  
  var hud = $.hudOverlay({defaultContent: "hai2u"});
  var focused = jQuery.focusedOverlay();
  
  var domNode = element.find("#mixmastertest").get(0);
  focused.set(domNode);

  var mm = $.mixMaster({
    hud: hud, 
    focusedOverlay: focused,
    prompt: function() {
      return '<em>hello</em>';
    }
  });

  mm.replaceFocusedElement();
  equal(element.html(), '<em>hello</em>', "Simulating replacement works");

  mm.undo();
  equal(element.find("#mixmastertest").length, 1,
        "Simulating undo works");

  ok(element.find("#mixmastertest").get(0) === domNode,
     "Undo restores original DOM node, not just HTML.");

  mm.redo();

  equal(element.find("#mixmastertest").length, 0,
        "Simulating redo works");

  mm.undo();
  focused.set(domNode);

  var infoURL;
  focused.set(domNode);
  mm.infoForFocusedElement(function open(url) { infoURL = url; });
  equal(infoURL, 'https://developer.mozilla.org/en/HTML/Element/div',
        'info URL is correct');

  mm.deleteFocusedElement();
  equal(element.html(), '<span style="display: none;"></span>',
        "Simulating deletion works");

  $(element).remove();
});
