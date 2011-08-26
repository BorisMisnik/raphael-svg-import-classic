/*
* Raphael SVG Import Classic 0.1.0 - Extension to Raphael JS
* https://github.com/crccheck/raphael-svg-import-classic
*
* Copyright (c) 2009 Wout Fierens
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*
*/

/* global Raphael */
Raphael.fn.importSVG = function (svgXML) {
  var myNewSet = this.set();
  try {
    this.parseElement = function(elShape) {
      var attr = {"stroke": "transparent", "stroke-width": 0, "fill":"#000"}, i;
      if (elShape.attributes){
        for (i = elShape.attributes.length - 1; i >= 0; --i){
          attr[elShape.attributes[i].name] = elShape.attributes[i].value;
        }
      }
      var shape, style;
      var shapeName = elShape.nodeName;
      switch(shapeName) {
        case "svg":
        case "g":
          // pass the id to the first child, parse the children
          var groupId = elShape.getAttribute('id');
          if (groupId && elShape.childNodes.length) {
            elShape.childNodes.item(1).setAttribute('id', groupId);
          }
          for (i = 0; i < elShape.childNodes.length; ++i) {
            this.parseElement(elShape.childNodes.item(i));
          }
          return;
        case "rect":
        case "circle":
        case "ellipse":
          shape = this[shapeName]();
        break;
        case "path":
          shape = this.path(attr.d);
          delete attr.d;
        break;
        case "polygon":
          shape = this.polygon(attr.points);
          delete attr.points;
        break;
        case "polyline":
          shape = this.polyline(attr);
          delete attr.points;
        break;
        case "line":
          shape = this.line(attr);
        break;
        case "image":
          shape = this.image();
        break;
        case "text":
          shape = this.text(attr.x, attr.y, elShape.text || elShape.textContent);
          shape.attr("stroke","none");
          shape.origFontPt = parseInt(attr["font-size"], 10);
        break;
        default:
          return;
      }

      // apply matrix transformation
      var matrix = attr.transform;
      if (matrix) {
        matrix = matrix.substring(7, matrix.length-1).split(', ');
        shape.matrix(+matrix[0], +matrix[1], +matrix[2], +matrix[3]);
        shape.translate(matrix[4], matrix[5]);
        delete attr.transform;
      }

      shape.attr(attr);

      // assign an arbitrary id
      var nodeID = elShape.getAttribute("id");
      if (nodeID) {
        shape.node.id = nodeID;
      }

      myNewSet.push(shape);
      return shape;
    };

    var elSVG = svgXML.getElementsByTagName("svg")[0];
    elSVG.normalize();
    this.parseElement(elSVG);
  } catch (error) {
    throw "SVGParseError (" + error + ")";
  }

  return myNewSet;
};


Raphael.fn.line = function(attr){
  var pathString = ["M",
                    attr.x1,
                    attr.y1,
                    "L",
                    attr.x2,
                    attr.y2,
                    "Z"];
  delete attr.x1;
  delete attr.y1;
  delete attr.x2;
  delete attr.y2;
  return this.path(pathString);
}

// extending raphael with a polygon function
Raphael.fn.polygon = function(pointString) {
  var poly = ['M'],
      point = pointString.split(' ');

  for(var i=0; i < point.length; i++) {
     var c = point[i].split(',');
     for(var j=0; j < c.length; j++) {
        var d = parseFloat(c[j]);
        if (!isNaN(d))
          poly.push(d);
     }
     if (i === 0)
      poly.push('L');
  }
  poly.push('Z');

  return this.path(poly);
};

Raphael.fn.polyline = function(attr) {
  var pointString = attr.points;
  var poly = ['M'],
      point = pointString.split(' ');

  for(var i=0; i < point.length; i++) {
     var c = point[i].split(',');
     for(var j=0; j < c.length; j++) {
        var d = parseFloat(c[j]);
        if (!isNaN(d))
          poly.push(d);
     }
     if (i === 0)
      poly.push('L');
  }
  delete attr.points;
  return this.path(poly);
};
