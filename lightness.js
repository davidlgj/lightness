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
 
  
  
  /**
   * Pixelate an image, creating average color values for the entire image.
   * @param image {String|Element} image url or image element, if url is specified a "promise" function will be returned
   * @param gridx {number} nr of times to divide the grid horizontally, i.e. a value of 3 will make a grid that has three columns and three rows
   * @param gridy {number} (optional) number of times to divide grid vertically, defaults to gridx
   * @param box {Object} bounding box to use instead of whole image, and object with x,y,height,width attributes.
   *                     ex. {x:0,y:0,height:500, width 500}
   * @return {Array} an array of objects with hsl values or a function that acts as a promise and when called with a callback will return the array.
   */ 
  var pixelate = function(image,gridx,gridy,box){
    gridy = gridy || gridx;
      
    var canvas =  document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    
    
    if (box) {
      canvas.width  = box.width;
      canvas.height = box.height;
      //draw only part of image, top left corner of canvas
      ctx.drawImage(image, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
    } else {
      canvas.width  = image.width;
      canvas.height = image.height;
      ctx.drawImage(image,0,0);
    }
    
    
    //faster to get all pixels, than for each block
    var pixels = ctx.getImageData(0,0,canvas.width,canvas.height); 
    
    var getAverage = function(x,y,width,height) {
      var r = 0;
      var g = 0;
      var b = 0; //alpha not supported so we assume its 255, which it probably is in a photo
      
      var dx = x+width;
      var dy = y+height;
      
      //loop over pixels adding them up
      for (var iy=y; iy<dy; iy++) {
        var ly = iy*pixels.width*4;
        for (var ix=x; ix<dx; ix++) {
          //calculate where in the array we are
          var l = ly + ix*4;
          r += pixels.data[l];
          g += pixels.data[l+1];
          b += pixels.data[l+2];
        }
      }
      
      var count = width*height;
      
      return {
        r: Math.round(r/count),
        g: Math.round(g/count),
        b: Math.round(b/count)
      }      
    };
  
    //figure out the grid step size
    var result = [];
    var dx = Math.round(canvas.width/gridx); //we're going to miss a pixel here and there if width is not divisable by gridsize, but that's ok
    var dy = Math.round(canvas.height/gridy);
    var y = 0;
    var x = 0;
    
    for (var row = 0; row<gridy; row++) { 
      for (var col=0; col<gridx; col++) {
        var rgb = getAverage(x,y,dx,dy);
        result.push({
          x: x,
          y: y,
          width: dx,
          height: dy,
          color: rgb
        });
        x += dx;
      }
      y += dy;
      x = 0;
    }
    return result;
  };
  
  
  //pixelate by scaling
  var pixelate2 = function(image,gridx,gridy) {
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
    
    var w  = image.width/gridx;
    var h = image.height/gridy;
    var width  = Math.round(w);
    var height = Math.round(h);
    
    for (var i=0;i<data.length; i += 4) {
      var p = i/4;
      result.push({
        x: Math.round((p % gridx)*w),
        y: Math.round(Math.floor(p/gridx) * h),
        width: width,
        height: height,
        color: {
          r: data[i],
          g: data[i+1],
          b: data[i+2]
        }
      });
    }
    console.log(result)
    return result;
  };
  
  
  /**
   * Figure out lightness by transforming pixelated image data to hsl via TinyColor
   */ 
  var lightness = function(image,gridx,gridy,method) {
    
    if (method === 'average') {
      var pixels = pixelate(image,gridx,gridy);
    } else {
      var pixels = pixelate2(image,gridx,gridy);
    }
    
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
  root.lightness.pixelate = pixelate2;
  
})(this);