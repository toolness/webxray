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
    keyCode: 0,
    preventDefault: function() { prevented = true; },
    stopPropagation: function() { stopped = true; }
  };

  var wasFocusedElementReplaced = false;
  var wasUndone = false;

  var input = $.xRayInput({
    mixMaster: {
      commandManager: {
        undo: function() {
          wasUndone = true;
        }
      },
      replaceFocusedElement: function() {
        wasFocusedElementReplaced = true;
      }
    }
  });

  input._listeners.keydown(event);
  ok(!prevented, "Typing invalid key doesn't prevent default event handling");
  ok(!stopped, "Typing valid key doesn't stop event propagation");

  event.keyCode = 82;
  input._listeners.keydown(event);
  ok(prevented, "Typing valid key prevents default event handling");
  ok(stopped, "Typing valid key stops event propagation");
  ok(wasFocusedElementReplaced, "Simulating replace focused element works");

  event.shiftKey = true;
  event.keyCode = 37;
  input._listeners.keydown(event);
  ok(wasUndone, "Simulating undo works");
});
