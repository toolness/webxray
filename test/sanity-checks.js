module("sanity checks");

test("ensure all script tags do not 404", function() {
  var jQuery = fullJQuery;
  var requestsLeft = [];

  function doneWith(src) {
    requestsLeft.splice(requestsLeft.indexOf(src), 1);
    if (requestsLeft.length == 0)
      start();
  }

  jQuery("script").each(function() {
    var src = jQuery(this).attr("src");

    if (!src || jQuery(this).hasClass("ok-if-not-present"))
      return;

    requestsLeft.push(src);
    jQuery.ajax({
      url: src,
      complete: function(xhr, textStatus) {
        switch (textStatus) {
          case "success":
          case "notmodified":
          ok(true, "got " + src);
          break;

          default:
          ok(false, "loading " + src + " failed (" + textStatus + ")");          
        }
        doneWith(src);
      },
      dataType: "text"
    });
  });
  stop();
});
