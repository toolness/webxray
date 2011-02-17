(function(jQuery) {
  var $ = jQuery;

  /* This is some temporary code to provide some kind of 'remix'
   * functionality to the goggles, at least until we have the
   * real MixMaster tool ready. */

  function temporaryHandleMixMasterEvent(focused, event) {
    const KEY_R = 82;
    const KEY_DELETE = 8;

    if (event.shiftKey || event.altKey || event.ctrlKey ||
        event.altGraphKey || event.metaKey) {
      return false;
    }

    switch (event.keyCode) {
      case KEY_R:
      var elementToReplace = focused.ancestor || focused.element;
      if (elementToReplace) {
        var promptText = "Enter the HTML to replace this <" + 
                         elementToReplace.nodeName.toLowerCase() +
                         "> element with.";
        var html = window.prompt(promptText);
        if (html !== null && html != "") {
          focused.unfocus();
          if (html[0] != '<') {
            html = '<span>' + html + '</span>'
          }
          var newContent = $(html);
          $(elementToReplace).replaceWith(newContent);
        }
      }
      return true;
      
      case KEY_DELETE:
      var elementToDelete = focused.ancestor || focused.element;
      if (elementToDelete) {
        focused.unfocus();
        $(elementToDelete).remove();
      }
      return true;
    }

    return false;
  }

  $(window).ready(function() {
    var hud = jQuery.hudOverlay();
    var focused = jQuery.focusedOverlay();

    $(document.body).append(hud.overlay);
    focused.on('change', hud.onFocusChange);

    var listeners = {
      keydown: function(event) {
        const KEY_UP = 38;
        const KEY_DOWN = 40;
        const KEY_ESC = 27;

        function handleKey(event) {
          if (event.shiftKey && event.keyCode == KEY_UP) {
            focused.upfocus();
            return true;
          } else if (event.shiftKey && event.keyCode == KEY_DOWN) {
            focused.downfocus();
            return true;
          } else if (event.keyCode == KEY_ESC) {
            $(window.document).trigger('unload');
            return true;
          } else
            return temporaryHandleMixMasterEvent(focused, event);
        }

        if (handleKey(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      mouseout: function(event) {
        event.stopPropagation();
        focused.unfocus();
      },
      mouseover: function(event) {
        event.stopPropagation();
        focused.set(event.target);
      }
    };

    for (var eventName in listeners)
      document.addEventListener(eventName, listeners[eventName], true);

    $(window.document).unload(function() {
      focused.destroy();
      focused = null;
      for (var eventName in listeners)
        document.removeEventListener(eventName, listeners[eventName], true);
      hud.destroy();
      hud = null;
    });
  });
})(jQuery);
