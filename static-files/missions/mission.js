$(window).ready(function() {
  $(document.body).fadeIn();
  document.title = $("#header .mission").text() + ": " +
                   $("#header .name").text();
});
