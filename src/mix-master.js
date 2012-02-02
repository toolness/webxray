(function(jQuery) {
  "use strict";

  var $ = jQuery;

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
    var commandManager = options.commandManager;
    var l10n = locale.scope('mix-master');
    var dialogPageMods = null;
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
      setDialogPageMods: function(mods) {
        dialogPageMods = mods;
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
        
        var currentHTML = focusedHTML;
        var dialogHolder = $('<div class="webxray-base webxray-tiny-dialog"><div class="webxray-commit">Close</div></div>');
        var dialog = $('<iframe></iframe>');
        dialog.attr("src", dialogURL);
        dialogHolder.prepend(dialog);
        $(document.body).append(dialogHolder);
        focused.unfocus();
        input.deactivate();

        (function morphElementIntoDialog() {
          var dialogBounds = dialogHolder.bounds();
          var ovr = $(focusedElement).overlayWithTagColor(1.0);
          ovr.addClass('webxray-topmost');
          ovr.animate(dialogBounds, function() {
            ovr.fadeOut(function() { ovr.remove(); });
            dialogHolder.show();
          });
          dialogHolder.hide();
        })();
        
        var focusedParent = focusedElement.parentNode;

        var doppelganger = $(focusedHTML)[0];
        focusedParent.replaceChild(doppelganger, focusedElement);

        $(".webxray-toolbar").hide();
        
        dialogHolder.find(".webxray-commit").click(function() {
          $(".webxray-toolbar").show();
          focusedParent.replaceChild(focusedElement, doppelganger);
          if (currentHTML != focusedHTML)
            self.replaceElement(focusedElement, currentHTML);
          dialogHolder.remove();
          input.activate();
        });
        
        function onMessage(event) {
          if (event.source == dialog[0].contentWindow) {
            var data = JSON.parse(event.data);
            if (data.currentHTML) {
              currentHTML = data.currentHTML;
              if (currentHTML == focusedHTML) {
                dialogHolder.find(".webxray-commit").text("Close");
              } else {
                dialogHolder.find(".webxray-commit").text("Commit Changes");
              }
              var newDoppelganger = self.htmlToJQuery(currentHTML)[0];
              focusedParent.replaceChild(newDoppelganger, doppelganger);
              doppelganger = newDoppelganger;
            }
          }
        }
        
        window.addEventListener("message", onMessage, false);
        dialog.load(function(event) {
          dialog[0].contentWindow.postMessage(JSON.stringify({
            startHTML: focusedHTML
          }), "*");
        });
        dialog.focus();
      }
    };
    return self;
  }

  jQuery.extend({mixMaster: MixMaster});
})(jQuery);
