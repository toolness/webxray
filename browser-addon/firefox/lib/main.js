var tabs = require('tabs');
var data = require('self').data;

require("widget").Widget({
  id: "goggles-icon",
  label: "Activate Goggles",
  contentURL: data.url("favicon.ico"),
  onClick: function() {
    var gogglesConfig = JSON.parse(data.load("webxray/config.json"));
    // We're removing intro/outro files with slice().
    var files = gogglesConfig.compiledFileParts.slice(1, -1);
    var urls = files.map(function(filename) {
      return data.url("webxray/" + filename);
    });
    var worker = tabs.activeTab.attach({
      contentScriptFile: urls
    });
  }
});
