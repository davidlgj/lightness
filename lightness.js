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
