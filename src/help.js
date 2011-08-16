(function(jQuery) {
  "use strict";

  var $ = jQuery;
  
  var keys = [
    {key: 'H', desc: 'This help reference'},
    {key: 'esc', desc: 'Deactivate goggles'},
    {key: 'R', desc: 'Replace/remix selected element'},
    {key: 'C', desc: 'View/edit computed style of selected element'},
    {key: 'delete', desc: 'Remove selected element'},
    {key: '←', desc: 'Undo'},
    {key: '→', desc: 'Redo'},
    {key: '↑', desc: 'Ascend to parent element'},
    {key: '↓', desc: 'Descend to child element'},
    {key: 'T', desc: 'Tear-out (export) page'}
  ];
  
  jQuery.extend({
    createKeyboardHelpReference: function() {
      var table = $('<div class="webxray-help-box"></div>');
      keys.forEach(function(info) {
        var row = $('<div class="webxray-help-row"></div>');
        var keyCell = $('<div class="webxray-help-key"></div>');
        var keyValue = $('<div class="webxray-help-desc"></div>');
        
        keyCell.append($('<div class="webxray-kbd"></div>').text(info.key));
        keyValue.text(info.desc);
        row.append(keyCell).append(keyValue);
        table.append(row);
      });
      return table;
    }
  });
})(jQuery);
