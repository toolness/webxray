module("mix-master", htmlFixture('mix-master'));

function testAsyncDialog(options) {
  var name = "replaceFocusedElementWithDialog() " + options.name;
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
    mixMaster.replaceFocusedElementWithDialog(input,
                                                     url,
                                                     container);
    equals(container.find(".webxray-dialog-overlay").length, 1,
           'dialog is added');
           
    stop(1000);
  });
}

/*

TODO: Re-enable these eventually, either by making functional 
      Selenium/Windmill/Webdriver/etc tests, or by refactoring these,
      or somesuch.

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
*/

test("jQuery.mixMaster()", function() {
  var $ = jQuery;

  function testWithElement(element, fn) {
    var hud = $.hudOverlay({defaultContent: "hai2u"});
    var focused = jQuery.focusedOverlay();

    var domNode = element.children().get(0);
    focused.set(domNode);

    var mixMaster = $.mixMaster({
      hud: hud, 
      focusedOverlay: focused
    });

    fn(mixMaster, element, hud, focused);

    focused.destroy();
    hud.destroy();
  }

  function makeTestElement() {
    var element = $('<div><div id="mixmastertest"></div></div>');
    $(document.body).append(element);
    
    return element;
  }
  
  function mixTest(fn) {
    var element = makeTestElement();
    testWithElement(element, fn);

    element.remove();
  }

  (function testSerialization() {
    var element = makeTestElement();
    var history;
    
    testWithElement(element, function(mixMaster, element, hud, focused) {
      mixMaster.replaceElement(focused.getPrimaryElement(), '<em>hi</em>');
      focused.set(element.children().get(0));
      mixMaster.replaceElement(focused.getPrimaryElement(), '<span>u</span>');
      history = mixMaster.serializeHistory();
      equals(element.html(), '<span>u</span>',
             'serializeHistory() doesn\'t change DOM');
    });
    
    equals(typeof(history), 'string', "history is a string");

    testWithElement(element, function(mixMaster) {
      mixMaster.deserializeHistory(history);
      equals(element.html(), '<span>u</span>',
             'deserializeHistory() doesn\'t change DOM');
      mixMaster.undo();
      equal(element.html(), '<em>hi</em>');
      mixMaster.undo();
      equal(element.html(), '<div id="mixmastertest"></div>');
    });

    element.remove();
  })();

  mixTest(function(mixMaster, element, hud, focused) {
    // This is really just a smoke test.
    equal($('#webxray-serialized-history-v1').length, 0);
    mixMaster.replaceElement(focused.getPrimaryElement(), '<p>hi</p>');
    mixMaster.saveHistoryToDOM();
    equal($('#webxray-serialized-history-v1').length, 1);
    ok($('#webxray-serialized-history-v1').text().length);
    mixMaster.loadHistoryFromDOM();
    equal($('#webxray-serialized-history-v1').length, 1);
    mixMaster.saveHistoryToDOM();
    equal($('#webxray-serialized-history-v1').length, 1);
  });
  
  mixTest(function(mixMaster, element, hud, focused) {
    var domNode = element.find("#mixmastertest").get(0);

    mixMaster.replaceElement(focused.getPrimaryElement(), '<em>hello</em>');
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
