(function( originalWindow, undefined ) {

function BookmarkletWindow() {
}

BookmarkletWindow.prototype = originalWindow;

var window = new BookmarkletWindow();

// Use the correct document accordingly with window argument (sandbox)
var document = window.document;
