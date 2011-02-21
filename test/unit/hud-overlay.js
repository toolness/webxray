module("hud-overlay");

test("jQuery.hudOverlay() defaultContent works", function() {
  var $ = jQuery;
  var hud = $.hudOverlay({defaultContent: "hai2u"});
  equals($(hud.overlay).html(), "hai2u");
  hud.destroy();
});

test("onFocusChange()", function() {
  var $ = jQuery;
  var hud = $.hudOverlay();
  var focused = {
    element: document.createElement('span'),
    ancestor: null
  };

  hud.onFocusChange(focused);
  equals($(hud.overlay).html(), "<span>You are on a <span><code>&lt;" +
         "span&gt;</code> element</span>.</span>");

  focused.element.id = "barg";
  hud.onFocusChange(focused);
  equals($(hud.overlay).html(), "<span>You are on a <span><code>&lt;" +
         "span&gt;</code> element with id <code>barg</code>" +
         "</span>.</span>");

  focused.element.id = '';
  focused.ancestor = document.createElement('div');
  hud.onFocusChange(focused);
  equals($(hud.overlay).html(), "<span>You are on a <span><code>&lt;" +
         "span&gt;</code> element</span>. It is inside a <span>" +
         "<code>&lt;div&gt;</code> element</span>.</span>");

  focused.element.className = "boop";
  focused.ancestor = null;
  hud.onFocusChange(focused);
  equals($(hud.overlay).html(), "<span>You are on a <span><code>&lt;" +
         "span&gt;</code> element with class <code>boop</code>" +
         "</span>.</span>");

  focused.element.id = "barg";
  hud.onFocusChange(focused);
  equals($(hud.overlay).html(), "<span>You are on a <span><code>&lt;" +
         "span&gt;</code> element with id <code>barg</code> and " +
         "class <code>boop</code></span>.</span>");

  focused.element = document.createElement('a');
  focused.element.href = "http://goop.com/";
  hud.onFocusChange(focused);
  equals($(hud.overlay).html(), "<span>You are on a <span><code>&lt;" +
         "a&gt;</code> element pointing at <code>http://goop.com/</code>' +
         '</span>.</span>");

  focused.element.id = "barg";
  hud.onFocusChange(focused);
  equals($(hud.overlay).html(), "<span>You are on a <span><code>&lt;" +
         "a&gt;</code> element with id <code>barg</code>, pointing at " +
         "<code>http://goop.com/</code></span>.</span>");

  hud.destroy();
});
