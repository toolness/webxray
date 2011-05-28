"use strict";

$(window).ready(function() {
  $(document.body).fadeIn();
  document.title = $("#header .mission").text() + ": " +
                   $("#header .name").text();
});

var MissionUtils = {
  wereGogglesInjected: function wereGogglesInjected() {
    return ($('#webxray-is-active').length != 0);
  },
  areGogglesActive: function areGogglesActive() {
    return ($("div.webxray-hud").length != 0);
  },
  whenGogglesFocusOn: function whenGogglesFocusOn(selector, handler) {
    window.addEventListener("mouseover", function(event) {
      if (MissionUtils.areGogglesActive() &&
          $(event.target).is(selector))
        handler.call(this, event);
    }, true);
  }
};
