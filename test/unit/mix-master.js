module("mix-master");

asyncTest("replaceFocusedElementWithAwesomeDialog()", function() {
  var $ = jQuery;

  var eventLog = [];
  var hud = $.hudOverlay();
  var toReplace = $("#mix-master .to-replace");
  var focused = {
    element: toReplace.children().get(0),
    unfocus: function() {
      eventLog.push("focused overlay unfocused");
    }
  };
  
  var mixMaster = $.mixMaster({
    hud: hud,
    focusedOverlay: focused
  });
  
  var input = {
    activate: function() {
      eventLog.push("input activated");
      setTimeout(function() {
        container.remove();
        equals(toReplace.html(), $("#mix-master .expect").html());
        deepEqual(eventLog, ['input deactivated', 'input activated',
                             'focused overlay unfocused']);
        start();
      }, 0);
    },
    deactivate: function() {
      eventLog.push("input deactivated");
    }
  };

  var container = $('<div></div>');
  $(document.body).append(container);
  container.hide();
  
  mixMaster.replaceFocusedElementWithAwesomeDialog(input,
                                                   'mix-master-dialog.html',
                                                   container);
});

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
    equal(element.html(), '<span class="webxray-deleted"></span>',
          "Simulating deletion works");
    equal($(hud.overlay).text(), 'Busted deletion.');
  });
});
