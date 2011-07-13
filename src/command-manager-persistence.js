(function(jQuery) {
  "use strict";

  var $ = jQuery;
  var GLOBAL_RECORDING_VAR = 'webxrayRecording';
  
  jQuery.extend({
    commandManagerPersistence: function CMPersistence(commandManager) {
      return {
        saveHistoryToDOM: function saveHistoryToDOM() {
          $('#webxray-serialized-history-v1').remove();
          var serializedHistory = $('<div></div>');
          serializedHistory.attr('id', 'webxray-serialized-history-v1')
                           .text(commandManager.serializeUndoStack()).hide();
          $(document.body).append(serializedHistory);
        },
        loadHistoryFromDOM: function loadHistoryFromDOM() {
          var serializedHistory = $('#webxray-serialized-history-v1');
          if (serializedHistory.length)
            try {
              commandManager.deserializeUndoStack(serializedHistory.text());
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
            commandManager.playRecording(recording);
            success = true;
          } catch (e) {
            success = false;
            jQuery.warn("playback of recording from global failed", e);
          }
          delete global[GLOBAL_RECORDING_VAR];
          return success;
        },
        convertRecordingToJS: function convertRecordingToJS(recording) {
          return ";(function(){window." + GLOBAL_RECORDING_VAR + "=" +
                 recording + "})();";
        }
      };
    }
  });
})(jQuery);
