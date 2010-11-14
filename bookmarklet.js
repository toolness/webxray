(function() {
  var base = "http://localhost:8000/";

  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", base + "webexplode.css");
  document.documentElement.appendChild(link);

  var script = document.createElement("script");
  script.src = base + "webexplode.js";
  document.documentElement.appendChild(script);
})();
