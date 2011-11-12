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
      createXpathFromElement: function xpathFromElement(doc, element) {
        if (element == doc || !element) {
          return "/";
        }

        var nodeList;
        if (element.id) {
          nodeList = doc.evaluate("//*[@id='" + element.id + "']", doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          if (nodeList.snapshotLength == 1) {
            return "//*[@id='" + element.id + "']";
          }
        }

        var parentSelector = "",
                relativeElement = doc;

        if (element.parentNode != doc) {
          parentSelector = xpathFromElement(doc, element.parentNode);
          // TODO: extract our evaluate someplace so changes are easier
          relativeElement = doc.evaluate(parentSelector, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }

        nodeList = doc.evaluate(element.nodeName, relativeElement, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        if (nodeList.snapshotLength == 1) {
          return (parentSelector + "/" + element.nodeName).trim();
        } else {
          for (var i = 0; i < nodeList.snapshotLength; ++i) {
            if (element == nodeList.snapshotItem(i)) {
              return (parentSelector + "/" + element.nodeName + "[" + (i + 1) + "]").trim();
            }
          }

          throw new Error("Node not found by tag name");
        }
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
      xpathForFocusedElement: function xpathForFocusedElement(options) {
        var element = focused.getPrimaryElement();
        var xpath = self.createXpathFromElement(document, element);
        //alert(xpath);
        jQuery.simpleModalDialog({
          input: options.input,
          url: 'xpath-dialog.html',
          payload: JSON.stringify({
            xpath: xpath
          })
        });
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
            url: dialogURL,
            element: focusedElement,
            onLoad: function(dialog) {
              dialog.iframe.postMessage(JSON.stringify({
                languages: jQuery.locale.languages,
                startHTML: startHTML,
                mods: dialogPageMods,
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
                        newContent.reallyRemoveClass('webxray-hidden');
                      }
                    });
                  } else {
                    // TODO: Re-focus previously focused elements?
                    $(focusedElement).reallyRemoveClass('webxray-hidden');
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
