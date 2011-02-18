module("mix-master");

test("jQuery.mixMaster()", function() {
  var $ = jQuery;
  
  var element = $('<div><div id="mixmastertest"></div></div>');
  $(document.body).append(element);
  
  var hud = $.hudOverlay({defaultContent: "hai2u"});
  var overlay = jQuery.focusedOverlay();
  
  var clicked = false;
  element.find("#mixmastertest").click(function() { clicked = true; });
  overlay.set(element.find("#mixmastertest").get(0));
  
  var mm = $.mixMaster({
    hud: hud, 
    focusedOverlay: overlay,
    prompt: function() {
      return '<em>hello</em>';
    }
  });

  var prevented = false;
  var stopped = false;

  var event = {
    keyCode: 0,
    preventDefault: function() { prevented = true; },
    stopPropagation: function() { stopped = true; }
  };

  mm.handleEvent(event);
  ok(!prevented, "Typing invalid key doesn't prevent default event handling");
  ok(!stopped, "Typing valid key doesn't stop event propagation");

  event.keyCode = 82;
  mm.handleEvent(event);
  ok(prevented, "Typing valid key prevents default event handling");
  ok(stopped, "Typing valid key stops event propagation");
  equal(element.html(), '<em>hello</em>', "Simulating replacement works");

  event.shiftKey = true;
  event.keyCode = 37;
  mm.handleEvent(event);
  equal(element.find("#mixmastertest").length, 1,
        "Simulating undo works");
  
  element.find("#mixmastertest").click();
  equal(clicked, false, "Undo restores original DOM node, not just HTML.");

  $(element).remove();
});
