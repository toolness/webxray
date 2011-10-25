(function (jQuery) {
  var $ = jQuery;

  function browserSupportsAce() {
    return (!jQuery.browser.opera &&
            navigator.userAgent.indexOf('Mobile') == -1 &&
            navigator.userAgent.indexOf('Fennec') == -1);
  }
  
  jQuery.HtmlEditor = function (idToEdit, textContent, onChange) {
    function setupFallbackWidget() {
      var textarea = $('<textarea class="fallback"></textarea>');
      $("#" + idToEdit).append(textarea);
      textarea.val(textContent).keyup(function() {
        onChange($(this).val());
      }).keyup();
    }

    // The interface of Ace widgets doesn't seem to be very well-defined,
    // this could break if/when we upgrade Ace.
    function setupAceWidget() {
      function getText() {
        return editor.getSession().getDocument().getValue();
      }

      $("#" + idToEdit).text(textContent);

      var width = $(document.body).width() / 2.08;
      var height = $(document.body).height() / 1.75;
      
      $("#" + idToEdit).parent().andSelf().width(width);
      $("#" + idToEdit).parent().andSelf().height(height);

      // The default Mac keybindings map Command-L to 'go to line #',
      // which both isn't needed for this page and also overrides
      // the browser-default behavior of selecting the address bar,
      // so we'll disable it.
      var mac = require("ace/keyboard/keybinding/default_mac");
      delete mac.bindings.gotoline;

      var editor  = ace.edit(idToEdit);
      editor.setTheme("ace/theme/eclipse");
      var HTMLMode = require("ace/mode/html").Mode;
      var session = editor.getSession();
      session.setMode(new HTMLMode());
      editor.renderer.setShowGutter(false);
      editor.setHighlightActiveLine(false);
      session.setUseWrapMode(true);
      session.setWrapLimitRange(64, Math.floor(width / 7.8));
      session.getDocument().on("change", function() {
        onChange(getText());
      });

      onChange(getText());
    }

    if (browserSupportsAce())
      setupAceWidget();
    else
      setupFallbackWidget();
  }
})(jQuery);
