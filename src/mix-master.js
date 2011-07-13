(function(jQuery) {
  "use strict";

  var $ = jQuery;
  var GLOBAL_RECORDING_VAR = 'webxrayRecording';

  function NullTransitionEffectManager() {
    return {
      enableDuring: function enableDuring(fn) { fn(); }
    };
  }
  
  function TransitionEffectManager(commandManager) {
    var isEnabled = false;

    commandManager.on('command-created', function(cmd) {
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
    });
    
    return {
      enableDuring: function enableDuring(fn) {
        if (!isEnabled) {
          isEnabled = true;
          fn();
          isEnabled = false;
        } else
          fn();
      }
    };
  }

  function MixMaster(options) {
    var hud = options.hud;
    var focused = options.focusedOverlay;
    var locale = options.locale || jQuery.locale;
    var commandManager = jQuery.commandManager();
    var l10n = locale.scope('mix-master');
    var transitionEffects;
    
    if (options.disableTransitionEffects)
      transitionEffects = NullTransitionEffectManager();
    else
      transitionEffects = TransitionEffectManager(commandManager);

    function updateStatus(verb, command) {
      var span = $('<span></span>');
      span.text(verb + ' ' + command.name + '.');
      $(hud.overlay).empty().append(span);
    }

    function runCommand(name, options) {
      focused.unfocus();
      var command = commandManager.run(name, options);
      updateStatus(locale.get('command-manager:executed'), command);
    }
    
    var self = {
      undo: function() {
        if (commandManager.canUndo()) {
          focused.unfocus();
          transitionEffects.enableDuring(function() {
            updateStatus(locale.get('command-manager:undid'),
                         commandManager.undo());
          });
        } else {
          var msg = locale.get('command-manager:cannot-undo-html');
          $(hud.overlay).html(msg);
        }
      },
      redo: function() {
        if (commandManager.canRedo()) {
          focused.unfocus();
          transitionEffects.enableDuring(function() {
            updateStatus(locale.get('command-manager:redid'),
                         commandManager.redo());
          });
        } else {
          var msg = locale.get('command-manager:cannot-redo-html');
          $(hud.overlay).html(msg);
        }
      },
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
        return ";(function(){window." + GLOBAL_RECORDING_VAR + "=" +
               recording + "})();";
      },
      getRecording: function getRecording() {
        return commandManager.getRecording();
      },
      playRecording: function playRecording(recording) {
        commandManager.playRecording(recording);
      },
      serializeHistory: function serializeHistory() {
        return commandManager.serializeUndoStack();
      },
      deserializeHistory: function deserializeHistory(history) {
        commandManager.deserializeUndoStack(history);
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
            var msg = l10n('too-big-to-change');
            jQuery.transparentMessage($('<div></div>').text(msg));
            return;
          }
          // Replacing the element with a zero-length invisible
          // span is a lot easier than actually deleting the element,
          // since it allows us to place a "bookmark" in the DOM
          // that can easily be undone if the user wishes.
          var placeholder = $('<span class="webxray-deleted"></span>');
          transitionEffects.enableDuring(function() {
            runCommand("ReplaceWithCmd", {
              name: l10n('deletion'),
              elementToReplace: elementToDelete,
              newContent: placeholder
            });
          });
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
        runCommand("ReplaceWithCmd", {
          name: l10n('replacement'),
          elementToReplace: elementToReplace,
          newContent: newContent
        });
        return newContent;
      },
      // At hack jams, users frequently want to be able to change what
      // appears to be a foreground image, but which is actually a
      // background image defined in a CSS stylesheet. Since the
      // goggles don't yet support CSS remixing, let's "imprint"
      // certain styles inline so that users can edit them.
      imprintCSSInline: function(focusedElement) {
        var all = $(focusedElement);
        var wasAnythingChanged = false;
        var props = [
          {name: 'background-image', defaultValue: 'none'},
          {name: 'background-repeat', defaultValue: 'repeat'}
        ];
        
        all.add(all.find('*')).each(function() {
          var element = this;
          var applyInlineCSS = false;
          var inlineCSS = {};
          
          props.forEach(function(prop) {
            var value = $(element).css(prop.name);
            
            if (value && value.length && value != prop.defaultValue) {
              if (prop.onlyIfDefined && !(prop.onlyIfDefined in inlineCSS))
                return;
              applyInlineCSS = true;
              inlineCSS[prop.name] = value;
            }
          });
          
          if (applyInlineCSS) {
            $(element).css(inlineCSS);
            wasAnythingChanged = true;
          }
        });
        
        return wasAnythingChanged;
      },
      replaceFocusedElementWithDialog: function(options) {
        var input = options.input;
        var dialogURL = options.dialogURL;
        var sendFullDocument = options.sendFullDocument;
        var MAX_HTML_LENGTH = 5000;
        var focusedElement =  focused.getPrimaryElement();
        if (!focusedElement)
          return;

        // We need to remove any script tags in the element now, or else
        // we'll likely re-execute them.
        $(focusedElement).find("script").remove();

        var focusedHTML = $(focusedElement).outerHtml();

        if ($(focusedElement).is('html, body')) {
          var msg = l10n("too-big-to-change");
          jQuery.transparentMessage($('<div></div>').text(msg));
          return;
        }

        if (focusedHTML.length == 0 ||
            focusedHTML.length > MAX_HTML_LENGTH) {
          var tagName = focusedElement.nodeName.toLowerCase();
          var msg = l10n("too-big-to-remix-html").replace("${tagName}",
                                                          tagName);
          jQuery.transparentMessage($(msg));
          return;
        }

        // imprintCSSInline() is experimental code added shortly
        // before a hack jam; don't let it prevent the user from
        // remixing if it doesn't work.
        try {
          if (self.imprintCSSInline(focusedElement))
            focusedHTML = $(focusedElement).outerHtml();
        } catch (e) {
          jQuery.warn("imprintCSSInline() failed", e);
        }
        
        if (sendFullDocument) {
          $(document).uprootIgnoringWebxray(function (html, head, body) {
            begin({
              head: head,
              body: body,
              selector: $(document.body).pathTo(focused.getPrimaryElement())
            });
          });
        } else
          begin(focusedHTML);

        function begin(startHTML) {
          focused.unfocus();
          $(focusedElement).addClass('webxray-hidden');

          jQuery.morphElementIntoDialog({
            input: input,
            body: options.body,
            url: dialogURL + "#dialog",
            element: focusedElement,
            onLoad: function(dialog) {
              dialog.iframe.postMessage(JSON.stringify({
                title: l10n("compose-a-replacement"),
                instructions: l10n("replacement-instructions-html"),
                languages: jQuery.locale.languages,
                startHTML: startHTML,
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
      }
    };
    return self;
  }

  jQuery.extend({mixMaster: MixMaster});
})(jQuery);
