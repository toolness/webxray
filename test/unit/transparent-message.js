module('transparent-message');

asyncTest('jQuery.transparentMessage() w/o duration', function() {
  var $ = jQuery;
  var parent = $('<div></div>');
  var content = $('<div>hi</div>');
  var wasEventTriggered = false;
  var msg = jQuery.transparentMessage(content, undefined, function() {
    ok(wasEventTriggered, "callback only called after keydown triggered");
    start();
  }, parent);
  setTimeout(function() {
    wasEventTriggered = true;
    $(window).trigger('keydown');
  }, jQuery.USER_ACTIVITY_DELAY + 50);
});

asyncTest('jQuery.transparentMessage() w/ duration', function() {
  var $ = jQuery;
  var parent = $('<div></div>');
  var content = $('<div>hi</div>');
  var msg = jQuery.transparentMessage(content, 1, function() {
    start();
  }, parent);
  ok(msg.html().match(/hi/), "content is in the message");
});
