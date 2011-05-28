module("mix-master");

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

  (function testRecording() {
    var element = makeTestElement();
    var recording;
    
    testWithElement(element, function(mixMaster, element, hud, focused) {
      mixMaster.replaceElement(focused.getPrimaryElement(), '<em>hi</em>');
      focused.set(element.children().get(0));
      mixMaster.replaceElement(focused.getPrimaryElement(), '<span>u</span>');
      recording = mixMaster.getRecording();
      equals(element.html(), '<span>u</span>',
             'getRecording() doesn\'t change DOM');
    });
    
    equals(typeof(recording), 'string', "recording is a string");
    element.remove();
    element = makeTestElement();

    testWithElement(element, function(mixMaster) {
      mixMaster.playRecording(recording);
      equals(element.html(), '<span>u</span>',
             'playRecording() transforms DOM as expected');
      mixMaster.undo();
      equal(element.html(), '<em>hi</em>');
      mixMaster.undo();
      equal(element.html(), '<div id="mixmastertest"></div>');
    });

    element.remove();    
  })();
  
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
    $('#webxray-serialized-history-v1').remove();
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
