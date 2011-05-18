module("mix-master", htmlFixture('mix-master'));

function testAsyncDialog(options) {
  var name = "replaceFocusedElementWithAwesomeDialog() " + options.name;
  test(name, function() {
    var $ = jQuery;

    var eventLog = [];
    var hud = $.hudOverlay();
    var focusedParent = $(options.focusedParent).clone();

    var container = $('<div></div>');
    $(document.body).append(container);
    container.append(focusedParent);
    container.hide();

    var focused = {
      element: focusedParent.children().get(0),
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
          options.test($, focusedParent, eventLog);
          focusedParent.remove();
          equals(container.children().length, 0, 'dialog is removed');
          container.remove();
          start();
        }, 0);
      },
      deactivate: function() {
        eventLog.push("input deactivated");
      }
    };

    var baseURL = 'unit/mix-master/mix-master-dialog.html?test=';
    var url = baseURL + options.resultType;
    mixMaster.replaceFocusedElementWithAwesomeDialog(input,
                                                     url,
                                                     container);
    equals(container.find(".webxray-dialog-overlay").length, 1,
           'dialog is added');
           
    stop(1000);
  });
}

testAsyncDialog({
  name: 'response "Ok" works',
  resultType: 'ok',
  focusedParent: "#mix-master .to-replace",
  test: function($, focusedParent, eventLog) {
    equals(focusedParent.html(), $("#mix-master .expect").html(),
           "focused element is changed");
    deepEqual(eventLog, ['input deactivated', 'input activated',
                         'focused overlay unfocused']);
  }
});

testAsyncDialog({
  name: 'response "Nevermind" works',
  resultType: 'nevermind',
  focusedParent: "#mix-master .to-replace",
  test: function($, focusedParent, eventLog) {
    equals(focusedParent.html(), $("#mix-master .to-replace").html(),
           "focused element is unaltered");
    deepEqual(eventLog, ['input deactivated', 'input activated']);
  }
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
      focusedOverlay: focused
    });

    fn(mixMaster, element, hud);

    $(element).remove();
    focused.destroy();
    hud.destroy();
  }

  mixTest(function(mixMaster, element, hud) {
    var domNode = element.find("#mixmastertest").get(0);

    mixMaster.replaceFocusedElement('<em>hello</em>');
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
