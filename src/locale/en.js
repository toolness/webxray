(function(jQuery) {
  "use strict";

  var locale = "en";

  jQuery.localization.extend(locale, "hud-overlay", {
    "default-html": "<span>Web X-Ray Goggles activated! Press ESC to deactivate.</span>",
    "element": "element",
    "with": "with",
    "id": "id",
    "and": "and",
    "class": "class",
    "pointing-at": "pointing at",
    "focused-intro": "You are on a",
    "ancestor-intro": "It is inside a"
  });

  jQuery.localization.extend(locale, "input", {
    "unload-blocked": 'You have made unsaved changes to this page.',
    "link-click-blocked": 'If you would like to follow that link, please deactivate the goggles first by pressing ESC.'
  });

  jQuery.localization.extend(locale, "command-manager", {
    "executed": "Busted",
    "undid": 'Unbusted',
    "redid": 'Rebusted',
    "cannot-undo-html": '<span>Nothing left to undo!</span>',
    "cannot-redo-html": '<span>Nothing left to redo!</span>'
  });

  jQuery.localization.extend(locale, "mix-master", {
    "too-big-to-change": "Changing that would be a bad idea.",
    "too-big-to-remix-html": "<div>That <code>&lt;${tagName}&gt;</code> element is too big for me to remix. Try selecting a smaller one!</div>",
    "deletion": "deletion",
    "replacement": "replacement",
    "compose-a-replacement": "Compose A Replacement",
    "replacement-instructions-html": "<span>When you're done composing your replacement HTML, press the <strong>Ok</strong> button.</span>"
  });

  jQuery.localization.extend(locale, "dialog-common", {
    "ok": "Ok",
    "nevermind": "Nevermind",
    "close": "Close"
  });

  jQuery.localization.extend(locale, "mix-master-dialog", {
    "html-header": "HTML Source Code",
    "skeleton-header": "What Your Browser Sees",
    "rendering-header": "What You See",
    "basic-source-tab": "Basic",
    "advanced-source-tab": "Advanced"
  });

  jQuery.localization.extend(locale, "style-info", {
    "tap-space-html": 'Tap <div class="webxray-kbd">space bar</div> to edit this style.',
    "style-change": "style change"
  });

  jQuery.localization.extend(locale, "key-names", {
    "LEFT": "←",
    "RIGHT": "→",
    "UP": "↑",
    "DOWN": "↓",
    "ESC": "esc",
    "DELETE": "backspace",
    "DELETE-MacIntel": "delete"
  });

  jQuery.localization.extend(locale, "command-descriptions", {
    "help": "This help reference",
    "quit": "Deactivate goggles",
    "remix": "Replace/remix selected element",
    "css-quasimode": "View/edit computed style of selected element",
    "remove": "Remove selected element",
    "undo": "Undo",
    "redo": "Redo",
    "dom-ascend": "Ascend to parent element",
    "dom-descend": "Descend to child element",
    "uproot": "Publish your remix"
  });
})(jQuery);