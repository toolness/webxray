
// Override JSON.stringify with our safe version within the 
// goggles to avoid Array.prototype.toJSON getting in the way.
// See http://stackoverflow.com/questions/710586/json-stringify-bizarreness
var JSON = {
  stringify: function(value){ 
    var restore = Array.prototype.toJSON;
    try {
      delete Array.prototype.toJSON;
      var stringified = this._unsafeStringify(value);
    } finally {
      Array.prototype.toJSON = restore;
    }
    return stringified;
  },
  _unsafeStringify: window.JSON.stringify,
  parse: window.JSON.parse
};
