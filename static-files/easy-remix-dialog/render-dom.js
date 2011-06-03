(function(jQuery) {
  "use strict";
  
  var $ = jQuery;

  function makeAttributeList(node) {
    var attribs = $('<ul class="attributes"></ul>');
    for (var i = 0; i < node.attributes.length; i++) {
      var attr = node.attributes[i];
      var name = $('<span class="name"></span>').text(attr.name);
      var value = $('<span class="value"></span>').text(attr.value);
      value.data("linked-node", attr);
      attribs.append($('<li></li>').append(name).append(value));
    }
    return attribs;
  }
  
  function renderTextNode(node) {
    var div = $('<div class="text"></div>');
    div.text(node.nodeValue);
    div.data("linked-node", node);
    return div;
  }
  
  function renderElement(node) {
    node = $(node).get(0);
    
    var rendered = $('<div class="element"></div>');
    var start = $('<span class="start"></span>');
    var name = $('<span class="name"></span>');
    name.text(node.nodeName.toLowerCase());
    start.append(name);
    var attribs = makeAttributeList(node);
    if (attribs.children().length)
      start.append(attribs);
    rendered.append(start);
    var children = $('<ul class="children"></ul>');
    $(node).contents().each(function() {
      var item = $('<li></li>');
      switch (this.nodeType) {
        case this.TEXT_NODE:
        if (jQuery.trim(this.nodeValue).length) {
          item.append(renderTextNode(this));
          children.append(item);
        }
        break;
        
        case this.ELEMENT_NODE:
        item.append(renderElement(this));
        children.append(item);
        break;

        // TODO: What about other node types?
      }
    });
    if (children.children().length) {
      var end = $('<span class="end"></span>').append(name.clone());
      rendered.append(children).append(end);
    }
    rendered.addClass('tag-' + jQuery.colorForTag(name.text()).slice(1));
    rendered.applyTagColor(node, 0.33);
    rendered.data("linked-node", node);
    return rendered;
  }
    
  jQuery.fn.extend({
    renderDom: function renderDom() {
      return renderElement(this);
    }
  });
})(jQuery);
