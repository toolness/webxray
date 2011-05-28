module("get-bookmarklet-url");

test("jQuery.getGogglesBookmarkletURL()", function() {
  ok(jQuery.getGogglesBookmarkletURL().indexOf(document.baseURI) != -1,
     "works with no arg");
  ok(jQuery.getGogglesBookmarkletURL("blargy").indexOf("blargy") != -1,
     "works with URL arg");
});
