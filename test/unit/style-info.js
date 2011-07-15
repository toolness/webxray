module("style-info");

test("jQuery.fn.getStyleInfo()", function() {
  var $ = jQuery;
  var info = $(document.documentElement).getStyleInfo();
  equal(info.find(".webxray-value-different-from-parent").length, 0,
        "HTML element has no 'value different from parent' class");

  var element = $('<p style="background-color: firebrick"></p>');
  $(document.body).append(element);
  info = element.getStyleInfo();
  var diff = info.find(".webxray-value-different-from-parent")
                 .prev(":contains('background\u2011color')");
  equal(diff.length, 1,
        "values different from parent have expected class");
  element.remove();
});

test("jQuery.styleInfoOverlay()", function() {
  var focused = jQuery.eventEmitter({
    getPrimaryElement: function() {
      return document.documentElement;
    }
  });
  var input = {
    deactivateCalled: 0,
    activateCalled: 0,
    activate: function() {
      this.activateCalled++;
    },
    deactivate: function() {
      this.deactivateCalled++;
    }
  };
  var overlay = jQuery.styleInfoOverlay({
    focused: focused,
    commandManager: {}
  });
  overlay.show();
  focused.emit('change');
  overlay.lock(input);
  equal(input.deactivateCalled, 1,
        "locking overlay deactivates normal input");
  jQuery(".webxray-close-button").click();
  equal(input.activateCalled, 1,
        "clicking on close button reactivates normal input");
  overlay.hide();
});
