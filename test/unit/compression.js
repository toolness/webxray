module("compression");

test("jQuery.compressStrToUriComponent()", function() {
  var json = JSON.stringify({foo: 1, bar: '\u2026'});
  var c = jQuery.compressStrToUriComponent(json);
  equal(jQuery.decompressUriComponentToStr(c), json,
        "compression/decompression work");
});
