(function (jQuery) {
  var $ = jQuery;

  jQuery.Editor = function (idToEdit, textContent, onChange) {
    var self = this;
    var editor;

    // The interface of Ace widgets doesn't seem to be very well-defined,
    // this could break if/when we upgrade Ace.
    function setupAceWidget() {
      $("#" + idToEdit).text(textContent);

      // The default Mac keybindings map Command-L to 'go to line #',
      // which both isn't needed for this page and also overrides
      // the browser-default behavior of selecting the address bar,
      // so we'll disable it.
      var mac = require("ace/keyboard/keybinding/default_mac");
      delete mac.bindings.gotoline;

      editor  = ace.edit(idToEdit);
      editor.setTheme("ace/theme/eclipse");
      var HTMLMode = require("ace/mode/html").Mode;
      var session = editor.getSession();
      session.setMode(new HTMLMode());
      editor.renderer.setShowGutter(false);
      editor.setHighlightActiveLine(false);
      session.setUseWrapMode(true);
      session.setWrapLimitRange(36, 36);
      session.getDocument().on("change", function() {
        onChange(self.getText());
      });

      onChange(self.getText());
    }

    self.getText = function getText() {
      return editor.getSession().getDocument().getValue();
    }
    
    self.destroy = function destroy() {
      // TODO: How do we destroy an ACE editor? For now,
      // we will just wipe out the DOM element it's in.
      $("#" + idToEdit).empty();
    }
    
    setupAceWidget();
  }
})(jQuery);
