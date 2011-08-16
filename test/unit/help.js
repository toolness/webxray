module('help');

test('jQuery.createKeyboardHelpReference()', function() {
  var overlay = jQuery.createKeyboardHelpReference();
  equal(overlay.length, 1, 'returns an element');
});
