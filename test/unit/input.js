module("input");

test("jQuery.xRayInput() activate/deactivate", function() {
  var $ = jQuery;
  var input = $.xRayInput({});
  
  input.activate();
  ok(true, "activate() does not throw");

  input.deactivate();
  ok(true, "deactivate() does not throw");
});

test("jQuery.xRayInput()", function() {
  var $ = jQuery;
  var prevented = false;
  var stopped = false;

  var event = {
    type: 'keydown',
    keyCode: 0,
    preventDefault: function() { prevented = true; },
    stopPropagation: function() { stopped = true; }
  };

  var wasFocusedElementReplaced = false;
  var wasUndone = false;

  var input = $.xRayInput({
    mixMaster: {
      undo: function() {
        wasUndone = true;
      },
      replaceFocusedElement: function() {
        wasFocusedElementReplaced = true;
      }
    }
  });

  input.handleEvent(event);
  ok(!prevented, "Typing invalid key doesn't prevent default event handling");
  ok(!stopped, "Typing valid key doesn't stop event propagation");

  event.keyCode = 82;
  input.handleEvent(event);
  ok(prevented, "Typing valid key prevents default event handling");
  ok(stopped, "Typing valid key stops event propagation");
  ok(wasFocusedElementReplaced, "Simulating replace focused element works");

  event.shiftKey = true;
  event.keyCode = 37;
  input.handleEvent(event);
  ok(wasUndone, "Simulating undo works");
  
  event.type = "boop";
  raises(function() {
    input.handleEvent(event);
  }, "unexpected event type throws error");
});
