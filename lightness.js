
/*
MIT LICENSE
Copyright (c) <2013> <David Jensen>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict';



/**
 * Calculate lightness of image
 * depends on TinyColor
 */ 
(function(root){

  var load = function(image,cb) {
      if (typeof image === 'string') {
        var src = image;
        image = new Image();
        image.onload = function(){ cb(image) };
        image.src = src;
      } else {
        cb(image);
      }
  };
 
  
  
  
  //pixelate by scaling image
  var pixelate = function(image,gridx,gridy) {
    var canvas =  document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    canvas.width  = gridx;
    canvas.height = gridy;
    
    //draw image to scale of grid
    ctx.drawImage(image,0,0,gridx,gridy);
    
    //getImage data from that
    var data = ctx.getImageData(0,0,gridx,gridy).data;
    
    //make a list of blocks
    var result = [];
    
    for (var i=0;i<data.length; i += 4) {
      var p = i/4;
      result.push({
        color: {
          r: data[i],
          g: data[i+1],
          b: data[i+2]
        }
      });
    }
    return result;
  };
  
  
  /**
   * Figure out lightness by transforming pixelated image data to hsl via TinyColor
   */ 
  var lightness = function(image,gridx,gridy) {
    
    
    var pixels = pixelate(image,gridx,gridy);
    
    for (var i=0; i<pixels.length; i++) {
      var p = pixels[i];
      p.rgb   = p.color;
      p.color = tinycolor(p.color);
      p.hsl   = p.color.toHsl(); 
    }
    return pixels;
  };
  
  root.lightness = lightness; 
  root.lightness.load = load;
  root.lightness.pixelate = pixelate;
  
})(this);
