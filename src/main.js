(function(jQuery) {
  var $ = jQuery;

  /* This is some temporary code to provide some kind of 'remix'
   * functionality to the goggles, at least until we have the
   * real MixMaster tool ready. */

  function CommandManager(hud, focused) {
    var undoStack = [];
    var redoStack = [];

    function updateStatus(verb, command) {
      // TODO: We're assuming that 'verb' and 'command' are both already
      // HTML-escaped here, which isn't necessarily obvious. Might want
      // to escape them just in case.
      $(hud.overlay).html('<span>' + verb + ' ' + command.name + '.</span>');
    }

    var self = {
      run: function(command) {
        focused.unfocus();
        undoStack.push(command);
        redoStack.splice(0);
        command.execute();
        updateStatus('Busted', command);
      },
      undo: function() {
        if (undoStack.length) {
          focused.unfocus();
          var command = undoStack.pop();
          redoStack.push(command);
          command.undo();
          updateStatus('Unbusted', command);
        } else
          $(hud.overlay).html('<span>Nothing left to undo!</span>');
      },
      redo: function() {
        if (redoStack.length) {
          focused.unfocus();
          var command = redoStack.pop();
          undoStack.push(command);
          command.execute();
          updateStatus('Rebusted', command);
        } else
          $(hud.overlay).html('<span>Nothing left to redo!</span>');
      }
    };
    
    return self;
  }

  function ReplaceWithCmd(name, elementToReplace, newContent) {
    return {
      name: name,
      execute: function() {
        $(elementToReplace).replaceWith(newContent);
      },
      undo: function() {
        $(newContent).replaceWith(elementToReplace);
      }
    };
  }

  function temporaryHandleMixMasterEvent(focused, commandManager, event) {
    const KEY_R = 82;
    const KEY_DELETE = 8;
    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;

    if (event.altKey || event.ctrlKey ||
        event.altGraphKey || event.metaKey) {
      return false;
    }

    if (event.shiftKey) {
      if (event.keyCode == KEY_LEFT) {
        commandManager.undo();
        return true;
      } else if (event.keyCode == KEY_RIGHT) {
        commandManager.redo();
        return true;        
      }
      return false;
    }

    switch (event.keyCode) {
      case KEY_R:
      var elementToReplace = focused.ancestor || focused.element;
      if (elementToReplace) {
        var promptText = "Enter the HTML to replace this <" + 
                         elementToReplace.nodeName.toLowerCase() +
                         "> element with.";
        var html = prompt(promptText);
        if (html !== null && html != "") {
          if (html[0] != '<') {
            html = '<span>' + html + '</span>';
          }
          var newContent = $(html);
          commandManager.run(ReplaceWithCmd('replacement', elementToReplace,
                                            newContent));
        }
      }
      return true;

      case KEY_DELETE:
      var elementToDelete = focused.ancestor || focused.element;
      if (elementToDelete) {
        var placeholder = $('<span style="display: none;"></span>');
        commandManager.run(ReplaceWithCmd('deletion', elementToDelete,
                                          placeholder));
      }
      return true;
    }

    return false;
  }

  $(window).ready(function() {
    var hud = jQuery.hudOverlay();
    var focused = jQuery.focusedOverlay();
    var commandManager = CommandManager(hud, focused);

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
            return temporaryHandleMixMasterEvent(focused, commandManager,
                                                 event);
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
