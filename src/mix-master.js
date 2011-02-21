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

  function MixMaster(options) {
    var promptFunction = options.prompt || prompt;
    var focused = options.focusedOverlay;
    var commandManager = CommandManager(options.hud, focused);

    var self = {
      commandManager: commandManager,
      replaceFocusedElement: function replaceFocusedElement() {
        var elementToReplace = focused.ancestor || focused.element;
        if (elementToReplace) {
          var promptText = "Enter the HTML to replace this <" + 
                           elementToReplace.nodeName.toLowerCase() +
                           "> element with.";
          var html = promptFunction(promptText);
          if (html !== null && html != "") {
            if (html[0] != '<') {
              html = '<span>' + html + '</span>';
            }
            var newContent = $(html);
            commandManager.run(ReplaceWithCmd('replacement',
                                              elementToReplace,
                                              newContent));
          }
        }
      },
      deleteFocusedElement: function deleteFocusedElement() {
        var elementToDelete = focused.ancestor || focused.element;
        if (elementToDelete) {
          var placeholder = $('<span style="display: none;"></span>');
          commandManager.run(ReplaceWithCmd('deletion', elementToDelete,
                                            placeholder));
        }
      }
    };
    return self;
  }

  jQuery.extend({mixMaster: MixMaster});
})(jQuery);
