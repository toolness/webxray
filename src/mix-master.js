(function(jQuery) {
  "use strict";

  var $ = jQuery;
  var GLOBAL_RECORDING_VAR = 'webxrayRecording';

  function CommandManager(hud, focused) {
    var undoStack = [];
    var redoStack = [];
    var transitionEffects = TransitionEffectManager();

    function updateStatus(verb, command) {
      // TODO: We're assuming that 'verb' and 'command' are both already
      // HTML-escaped here, which isn't necessarily obvious. Might want
      // to escape them just in case.
      $(hud.overlay).html('<span>' + verb + ' ' + command.name + '.</span>');
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
    
    var self = {
      transitionEffects: transitionEffects,
      run: function(command) {
        focused.unfocus();
        undoStack.push(command);
        redoStack.splice(0);
        transitionEffects.observe(command);
        command.execute();
        updateStatus('Busted', command);
      },
      undo: function() {
        if (undoStack.length) {
          focused.unfocus();
          updateStatus('Unbusted', internalUndo());
        } else
          $(hud.overlay).html('<span>Nothing left to undo!</span>');
      },
      redo: function() {
        if (redoStack.length) {
          focused.unfocus();
          updateStatus('Rebusted', internalRedo());
        } else
          $(hud.overlay).html('<span>Nothing left to redo!</span>');
      },
      getRecording: function() {
        var recording = [];
        var timesUndone = 0;
        transitionEffects.disableDuring(function() {
          while (undoStack.length) {
            var cmd = undoStack[undoStack.length - 1];
            internalUndo();
            recording.splice(0, 0, cmd.serialize());
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
            var cmd = ReplaceWithCmd(recording[i]);
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
            commands.push(cmd.serialize());
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
            var cmd = ReplaceWithCmd(commands[i]);
            transitionEffects.observe(cmd);
            undoStack.push(cmd);
            internalUndo();
          }
          for (var i = 0; i < commands.length; i++)
            internalRedo();
        });
      }
    };
    
    return self;
  }

  function TransitionEffectManager() {
    var isEnabled = true;
    return {
      disableDuring: function disableDuring(fn) {
        if (isEnabled) {
          isEnabled = false;
          fn();
          isEnabled = true;
        } else
          fn();
      },
      observe: function(cmd) {
        cmd.on('before-replace', function before(elementToReplace) {
          if (!isEnabled)
            return;
          var overlay = $(elementToReplace).overlay();
          cmd.on('after-replace', function after(newContent) {
            cmd.removeListener('after-replace', after);
            overlay.applyTagColor(newContent, 0.25)
                   .resizeToAndFadeOut(newContent);            
          });
        });
      },
      setEnabled: function(enabled) {
        isEnabled = enabled;
      }
    };
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

  function MixMaster(options) {
    var focused = options.focusedOverlay;
    var commandManager = CommandManager(options.hud, focused);

    var self = {
      transitionEffects: commandManager.transitionEffects,
      undo: function() { commandManager.undo(); },
      redo: function() { commandManager.redo(); },
      saveHistoryToDOM: function saveHistoryToDOM() {
        $('#webxray-serialized-history-v1').remove();
        var serializedHistory = $('<div></div>');
        serializedHistory.attr('id', 'webxray-serialized-history-v1')
                         .text(self.serializeHistory()).hide();
        $(document.body).append(serializedHistory);
      },
      loadHistoryFromDOM: function loadHistoryFromDOM() {
        var serializedHistory = $('#webxray-serialized-history-v1');
        if (serializedHistory.length)
          try {
            self.deserializeHistory(serializedHistory.text());
          } catch (e) {
            jQuery.warn("deserialization of history in DOM failed", e);
          }
      },
      isRecordingInGlobal: function isRecordingInGlobal(global) {
        return (GLOBAL_RECORDING_VAR in global);
      },
      playRecordingFromGlobal: function playRecordingFromGlobal(global) {
        var msg, recording, success;

        try {
          recording = JSON.stringify(global[GLOBAL_RECORDING_VAR]);
          self.playRecording(recording);
          success = true;
        } catch (e) {
          success = false;
          jQuery.warn("payback of recording from global failed", e);
        }
        delete global[GLOBAL_RECORDING_VAR];
        return success;
      },
      convertRecordingToJS: function convertRecordingToJS(recording) {
        return ";(function(){" + GLOBAL_RECORDING_VAR + "=" + recording + 
               "})();";
      },
      getRecording: function getRecording() {
        return JSON.stringify(commandManager.getRecording());
      },
      playRecording: function playRecording(recording) {
        commandManager.playRecording(JSON.parse(recording));
      },
      serializeHistory: function serializeHistory() {
        return JSON.stringify(commandManager.serializeUndoStack());
      },
      deserializeHistory: function deserializeHistory(history) {
        commandManager.deserializeUndoStack(JSON.parse(history));
      },
      htmlToJQuery: function htmlToJQuery(html) {
        if (html == '' || typeof(html) != 'string')
          return $('<span></span>');
        if (html[0] != '<')
          html = '<span>' + html + '</span>';
        return $(html);
      },
      deleteFocusedElement: function deleteFocusedElement() {
        var elementToDelete = focused.getPrimaryElement();
        if (elementToDelete) {
          if ($(elementToDelete).is('html, body')) {
            var msg = "Deleting that would be a bad idea."
            jQuery.transparentMessage($('<div></div>').text(msg));
            return;
          }
          // Replacing the element with a zero-length invisible
          // span is a lot easier than actually deleting the element,
          // since it allows us to place a "bookmark" in the DOM
          // that can easily be undone if the user wishes.
          var placeholder = $('<span class="webxray-deleted"></span>');
          commandManager.run(ReplaceWithCmd('deletion', elementToDelete,
                                            placeholder));
        }
      },
      infoForFocusedElement: function infoForFocusedElement(open) {
        var element = focused.getPrimaryElement();
        open = open || window.open;
        if (element) {
          var url = 'https://developer.mozilla.org/en/HTML/Element/' +
                    element.nodeName.toLowerCase();
          open(url, 'info');
        }
      },
      replaceElement: function(elementToReplace, html) {
        var newContent = self.htmlToJQuery(html);
        commandManager.transitionEffects.disableDuring(function() {
          commandManager.run(ReplaceWithCmd('replacement',
                                            elementToReplace,
                                            newContent));
        });
        return newContent;
      },
      replaceFocusedElementWithDialog: function(input, dialogURL, body) {
        var MAX_HTML_LENGTH = 1000;
        var focusedElement =  focused.getPrimaryElement();
        if (!focusedElement)
          return;
        var focusedHTML = $(focusedElement).outerHtml();

        if (focusedHTML.length == 0 ||
            focusedHTML.length > MAX_HTML_LENGTH) {
          var tagName = focusedElement.nodeName.toLowerCase();
          var msg = $("<div>That " +
                      "<code>&lt;" + tagName + "&gt;</code> element " +
                      "is too big for me to remix. Try selecting " +
                      "a smaller one!</div>");
          jQuery.transparentMessage(msg);
          return;
        }

        focused.unfocus();
        $(focusedElement).addClass('webxray-hidden');

        jQuery.morphElementIntoDialog({
          input: input,
          body: body,
          url: dialogURL + "#dialog",
          element: focusedElement,
          onLoad: function(dialog) {
            dialog.iframe.get(0).contentWindow.postMessage(JSON.stringify({
              title: "Compose A Replacement",
              instructions: "<span>When you're done composing your " +
                            "replacement HTML, press the " +
                            "<strong>Ok</strong> button.",
              startHTML: focusedHTML,
              baseURI: document.location.href
            }), "*");
            dialog.iframe.fadeIn();
            dialog.iframe.bind("message", function onMessage(event, data) {
              if (data && data.length && data[0] == '{') {
                var data = JSON.parse(data);
                if (data.msg == "ok") {
                  // The dialog may have decided to replace all our spaces
                  // with non-breaking ones, so we'll undo that.
                  var html = data.endHTML.replace(/\u00a0/g, " ");
                  var newContent = self.replaceElement(focusedElement, html);

                  newContent.addClass('webxray-hidden');
                  $(focusedElement).removeClass('webxray-hidden');
                  jQuery.morphDialogIntoElement({
                    dialog: dialog,
                    input: input,
                    element: newContent,
                    onDone: function() {
                      newContent.removeClass('webxray-hidden');
                    }
                  });
                } else {
                  // TODO: Re-focus previously focused elements?
                  $(focusedElement).removeClass('webxray-hidden');
                  dialog.close();
                }
              }
            });
          }
        });
      }
    };
    return self;
  }

  jQuery.extend({mixMaster: MixMaster});
})(jQuery);
