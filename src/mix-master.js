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
      undo: function() { commandManager.undo(); },
      redo: function() { commandManager.redo(); },
      replaceFocusedElement: function replaceFocusedElement(html) {
        var elementToReplace = focused.ancestor || focused.element;
        if (elementToReplace) {
          if (typeof(html) != "string") {
            var promptText = "Enter the HTML to replace this <" + 
                             elementToReplace.nodeName.toLowerCase() +
                             "> element with.";
            html = promptFunction(promptText);
          }
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
        var element = focused.ancestor || focused.element;
        open = open || window.open;
        if (element) {
          var url = 'https://developer.mozilla.org/en/HTML/Element/' +
                    element.nodeName.toLowerCase();
          open(url, 'info');
        }
      },
      replaceFocusedElementWithAwesomeDialog: function(input) {
        var MAX_HTML_LENGTH = 1000;
        var focusedElement =  focused.ancestor || focused.element;
        if (!focusedElement)
          return;
        var tagName = focusedElement.nodeName.toLowerCase();
        var clonedElement = $(focusedElement).clone();
        var trivialParent = $('<div></div>').append(clonedElement);
        var focusedHTML = trivialParent.html();

        if (focusedHTML.length == 0 || focusedHTML.length > MAX_HTML_LENGTH)
          focusedHTML = "<span>The HTML source for your selected <code>&lt;" + tagName + "&gt;</code> element could make your head explode.</span>";

        input.deactivate();
        var dialogURL = "http://labs.toolness.com/dom-tutorial/";
        //var dialogURL = "http://localhost:8001/";
        var div = $('<div class="webxray-dialog-overlay"><div class="webxray-dialog-outer"><div class="webxray-dialog-middle"><div class="webxray-dialog-inner"><iframe src="' + dialogURL + '#dialog"></iframe></div></div></div></div>');
        $(document.body).append(div);
        // We need to use document.defaultView here because 'window' is a trivial
        // window subclass rather than window itself, which confuses Safari.
        document.defaultView.addEventListener("message", function onMessage(event) {
          if (event.data && event.data.length && event.data[0] == '{') {
            var data = JSON.parse(event.data);
            div.fadeOut(function() {
              div.remove();
              input.activate();
              if (data.msg == "ok") {
                // The dialog may have decided to replace all our spaces
                // with non-breaking ones, so we'll undo that.
                var html = data.endHTML.replace(/\u00a0/g, " ");
                self.replaceFocusedElement(html);
              }
              document.defaultView.removeEventListener("message", onMessage,
                                                       false);
              $(document.defaultView).focus();
            });
          }
        }, false);
        div.find("iframe").hide().load(function onLoad() {
          this.contentWindow.postMessage(JSON.stringify({
            title: "Compose A Replacement",
            instructions: "<span>When you're done composing your replacement HTML, press the <strong>Ok</strong> button.",
            startHTML: focusedHTML,
            baseURI: document.location.href
          }), "*");
          $(this).unbind("load", onLoad);
          $(this).fadeIn();
        });
      }
    };
    return self;
  }

  jQuery.extend({mixMaster: MixMaster});
})(jQuery);
