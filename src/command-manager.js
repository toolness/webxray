(function(jQuery) {
  "use strict";

  var $ = jQuery;
  
  function CommandManager(options) {
    var hud = options.hud;
    var focused = options.focusedOverlay;
    var locale = options.locale || jQuery.locale;
    var undoStack = [];
    var redoStack = [];
    var transitionEffects = options.transitionEffects;
    var l10n = locale.scope('command-manager');

    function updateStatus(verb, command) {
      var span = $('<span></span>');
      span.text(verb + ' ' + command.name + '.');
      $(hud.overlay).empty().append(span);
    }

    function internalUndo() {
      var command = undoStack.pop();
      redoStack.push(command);
      command.undo();
      return command;
    }
    
    function internalRedo() {
      var command = redoStack.pop();
      undoStack.push(command);
      command.execute();
      return command;
    }
    
    function serializeCommand(cmd) {
      var state = cmd.serialize();
      state.__cmd__ = cmd.registeredName;
      return state;
    }
    
    function deserializeCommand(state) {
      // The fallback here is just for backwards compatibility
      // with old-style serializations.
      var name = state.__cmd__ || ReplaceWithCmd.name;
      var constructor = registry[name];
      var cmd = constructor(state);
      cmd.registeredName = name;
      return cmd;
    }
    
    var registry = {};
    
    var self = {
      register: function(constructor, name) {
        name = name || constructor.name;
        registry[name] = constructor;
      },
      run: function(name) {
        var constructor = registry[name];
        var args = Array.prototype.slice.call(arguments, 1);
        var command = constructor.apply(null, args);
        command.registeredName = name;
        focused.unfocus();
        undoStack.push(command);
        redoStack.splice(0);
        transitionEffects.observe(command);
        command.execute();
        updateStatus(l10n('executed'), command);
      },
      undo: function() {
        if (undoStack.length) {
          focused.unfocus();
          updateStatus(l10n('undid'), internalUndo());
        } else
          $(hud.overlay).html(l10n('cannot-undo-html'));
      },
      redo: function() {
        if (redoStack.length) {
          focused.unfocus();
          updateStatus(l10n('redid'), internalRedo());
        } else
          $(hud.overlay).html(l10n('cannot-redo-html'));
      },
      getRecording: function() {
        var recording = [];
        var timesUndone = 0;
        transitionEffects.disableDuring(function() {
          while (undoStack.length) {
            var cmd = undoStack[undoStack.length - 1];
            internalUndo();
            recording.splice(0, 0, serializeCommand(cmd));
            timesUndone++;
          }
          for (var i = 0; i < timesUndone; i++)
            internalRedo();
        });
        return recording;
      },
      playRecording: function(recording) {
        undoStack.splice(0);
        redoStack.splice(0);
        transitionEffects.disableDuring(function() {
          for (var i = 0; i < recording.length; i++) {
            var cmd = deserializeCommand(recording[i]);
            transitionEffects.observe(cmd);
            undoStack.push(cmd);
            cmd.execute();
          }
        });
      },
      serializeUndoStack: function() {
        var commands = [];
        var timesUndone = 0;
        transitionEffects.disableDuring(function() {
          while (undoStack.length) {
            var cmd = undoStack[undoStack.length - 1];
            commands.push(serializeCommand(cmd));
            internalUndo();
            timesUndone++;
          }
          for (var i = 0; i < timesUndone; i++)
            internalRedo();
        });
        return commands;
      },
      deserializeUndoStack: function(commands) {
        undoStack.splice(0);
        redoStack.splice(0);
        transitionEffects.disableDuring(function() {
          for (var i = 0; i < commands.length; i++) {
            var cmd = deserializeCommand(commands[i]);
            transitionEffects.observe(cmd);
            undoStack.push(cmd);
            internalUndo();
          }
          for (var i = 0; i < commands.length; i++)
            internalRedo();
        });
      }
    };

    self.register(ReplaceWithCmd);

    return self;
  }
  
  function ReplaceWithCmd(name, elementToReplace, newContent) {
    var isExecuted = false;

    function deserialize(state) {
      if (typeof(state.isExecuted) == 'undefined')
        isExecuted = true; // support legacy serializations
      else
        isExecuted = state.isExecuted;
      name = state.name;
      if (isExecuted) {
        newContent = $(document.documentElement).find(state.selector);
        elementToReplace = $(state.html);
        if (newContent.length != 1)
          throw new Error("selector '" + state.selector + "' matches " +
                          newContent.length + " elements");
      } else {
        newContent = $(state.html);
        elementToReplace = $(document.documentElement).find(state.selector);
        if (elementToReplace.length != 1)
          throw new Error("selector '" + state.selector + "' matches " +
                          elementToReplace.length + " elements");
      }
    }

    if (typeof(name) == "object" && !elementToReplace && !newContent)
      deserialize(name);

    return jQuery.eventEmitter({
      name: name,
      execute: function() {
        if (isExecuted)
          throw new Error("command already executed");
        this.emit('before-replace', elementToReplace);
        $(elementToReplace).replaceWith(newContent);
        this.emit('after-replace', newContent);
        isExecuted = true;
      },
      undo: function() {
        if (!isExecuted)
          throw new Error("command not yet executed");
        this.emit('before-replace', newContent);
        $(newContent).replaceWith(elementToReplace);
        this.emit('after-replace', elementToReplace);
        isExecuted = false;
      },
      serialize: function() {
        var selector;
        var html;
        if (isExecuted) {
          selector = $(document.documentElement).pathTo(newContent);
          html = $(elementToReplace).outerHtml();
        } else {
          selector = $(document.documentElement).pathTo(elementToReplace);
          html = $(newContent).outerHtml();
        }
        return {
          isExecuted: isExecuted,
          name: name,
          selector: selector,
          html: html
        };
      }
    });
  }

  jQuery.extend({commandManager: CommandManager});
})(jQuery);
