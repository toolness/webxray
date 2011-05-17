(function() {
  QUnit.config.autostart = false;

  var $ = fullJQuery;

  window.jQuery = {};

  function loadScripts(name, scripts, prefix, cb) {
    scripts = scripts.slice();
    scripts.reverse();

    var log = [];

    function loadNextScript() {
      var errorThrown = false;
      
      function onWindowError(event) {
        if (event.target == window)
          errorThrown = true;
      }

      function cleanupAndLoadNext() {
        window.removeEventListener("error", onWindowError, false);
        loadNextScript();
      }

      if (scripts.length) {
        var src = prefix + scripts.pop();

        if (src.match(/\.local\./)) {
          // TODO: Do an XHR to see if the file exists and
          // load it if so, instead of skipping it entirely.
          // We're skipping it for now b/c opera doesn't
          // seem to fire error events when scripts aren't
          // found, so it just hangs if we don't do this.
          log.push([true, "skipping optional script: ", src]);
          loadNextScript();
          return;
        }

        var script = document.createElement('script');
        script.setAttribute('src', src);
        script.addEventListener("load", function () {
          if (errorThrown) {
            log.push([false, "error thrown while loading", src]);
          } else
            log.push([true, "loaded", src]);
          cleanupAndLoadNext();
        }, false);
        script.addEventListener("error", function() {
          log.push([false, "script not found:", src]);
          cleanupAndLoadNext();
        }, false);
        window.addEventListener("error", onWindowError, false);
        document.head.appendChild(script);
      } else {
        module("load " + name);
        test("load scripts", function() {
          log.forEach(function(item) {
            ok(item[0], item[1] + " " + item[2]);
          });
        });
        cb();
      }
    }
    
    loadNextScript();
  }

  $(window).ready(function() {
    $.getJSON("../config.json", function(obj) {
      var scripts = obj.compiledFileParts;

      scripts = scripts.slice(scripts.indexOf('src/intro.js') + 1,
                              scripts.indexOf('src/main.js'));

      loadScripts("bookmarklet scripts", scripts, "../", function() {
        window.jQuery.noConflict();
        loadScripts("unit tests", unitTests, "unit/", function() {
          QUnit.start();
        });
      });
    });
  });
})();
