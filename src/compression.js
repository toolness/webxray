(function(jQuery) {
  "use strict";
  
  // taken from http://rosettacode.org/wiki/LZW_compression#JavaScript
  //LZW Compression/Decompression for Strings
  var LZW = {
      "compress" : function(uncompressed) 
      {
          // Build the dictionary.
          var dictSize = 256;
          var dictionary = {};
          for (var i = 0; i < 256; i++)
          {
              dictionary[String.fromCharCode(i)] = i;
          }

          var w = "";
          var result = [];
          for (var i = 0; i < uncompressed.length; i++) 
          {
          	var c = uncompressed.charAt(i);
              var wc = w + c;
              if (dictionary[wc])
                  w = wc;
              else {
                  result.push(dictionary[w]);
                  // Add wc to the dictionary.
                  dictionary[wc] = dictSize++;
                  w = "" + c;
              }
          }

          // Output the code for w.
          if (w != "")
              result.push(dictionary[w]);
          return result;
      },


      "decompress" : function(compressed) {
          // Build the dictionary.
          var dictSize = 256;
          var dictionary = [];
          for (var i = 0; i < 256; i++)
          {
              dictionary[i] = String.fromCharCode(i);
   	      }

          var w = String.fromCharCode(compressed[0]);
          var result = w;
          for (var i = 1; i < compressed.length; i++) {
              var entry = "";
              var k = compressed[i];
              if (dictionary[k])
                  entry = dictionary[k];
              else if (k == dictSize)
                  entry = w + w.charAt(0);
              else
                  return null;

              result += entry;

              // Add w+entry[0] to the dictionary.
              dictionary[dictSize++] = w + entry.charAt(0);

              w = entry;
          }
          return result;
      }
  }

  // Taken from http://en.wikibooks.org/wiki/Algorithm_implementation/Miscellaneous/Base64#Javascript

  var base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split("");

  var base64inv = {}; 
  for (var i = 0; i < base64chars.length; i++) 
  { 
    base64inv[base64chars[i]] = i; 
  }
  
  function base64_encode (s)
  {
    // the result/encoded string, the padding string, and the pad count
    var r = ""; 
    var p = ""; 
    var c = s.length % 3;

    // add a right zero pad to make this string a multiple of 3 characters
    if (c > 0) { 
      for (; c < 3; c++) { 
        p += '='; 
        s += "\0"; 
      } 
    }

    // increment over the length of the string, three characters at a time
    for (c = 0; c < s.length; c += 3) {

      // we add newlines after every 76 output characters, according to the MIME specs
      if (c > 0 && (c / 3 * 4) % 76 == 0) { 
        r += "\r\n"; 
      }

      // these three 8-bit (ASCII) characters become one 24-bit number
      var n = (s.charCodeAt(c) << 16) + (s.charCodeAt(c+1) << 8) + s.charCodeAt(c+2);

      // this 24-bit number gets separated into four 6-bit numbers
      n = [(n >>> 18) & 63, (n >>> 12) & 63, (n >>> 6) & 63, n & 63];

      // those four 6-bit numbers are used as indices into the base64 character list
      r += base64chars[n[0]] + base64chars[n[1]] + base64chars[n[2]] + base64chars[n[3]];
    }
     // add the actual padding string, after removing the zero pad
    return r.substring(0, r.length - p.length) + p;
  }

  function base64_decode (s)
  {
    // remove/ignore any characters not in the base64 characters list
    //  or the pad character -- particularly newlines
    s = s.replace(new RegExp('[^'+base64chars.join("")+'=]', 'g'), "");

    // replace any incoming padding with a zero pad (the 'A' character is zero)
    var p = (s.charAt(s.length-1) == '=' ? 
            (s.charAt(s.length-2) == '=' ? 'AA' : 'A') : ""); 
    var r = ""; 
    s = s.substr(0, s.length - p.length) + p;

    // increment over the length of this encrypted string, four characters at a time
    for (var c = 0; c < s.length; c += 4) {

      // each of these four characters represents a 6-bit index in the base64 characters list
      //  which, when concatenated, will give the 24-bit number for the original 3 characters
      var n = (base64inv[s.charAt(c)] << 18) + (base64inv[s.charAt(c+1)] << 12) +
              (base64inv[s.charAt(c+2)] << 6) + base64inv[s.charAt(c+3)];

      // split the 24-bit number into the original three 8-bit (ASCII) characters
      r += String.fromCharCode((n >>> 16) & 255, (n >>> 8) & 255, n & 255);
    }
     // remove any zero pad that was added to make this a multiple of 24 bits
    return r.substring(0, r.length - p.length);
  }

  // taken from
  // http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html

  function encode_utf8( s )
  {
    return unescape( encodeURIComponent( s ) );
  }

  function decode_utf8( s )
  {
    return decodeURIComponent( escape( s ) );
  }
  
  jQuery.extend({
    compressStrToUriComponent: function(str) {
      var utf8 = encode_utf8(str);
      var compressedArray = LZW.compress(utf8);
      var binary = String.fromCharCode.apply(String, compressedArray);
      var base64 = base64_encode(encode_utf8(binary));
      return encodeURIComponent(base64);
    },
    decompressUriComponentToStr: function(uriComponent) {
      var base64 = decodeURIComponent(uriComponent);
      var binary = decode_utf8(base64_decode(base64));
      var compressedArray = [];
      
      for (var i = 0; i < binary.length; i++)
        compressedArray.push(binary.charCodeAt(i));
      
      var utf8 = LZW.decompress(compressedArray);
      return decode_utf8(utf8);
    }
  });
})(jQuery);
