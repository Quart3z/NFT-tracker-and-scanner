

$(document).ready(function(){

 
  
    $("#generate_btn").click(function(e){


      
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');

        var grey_canvas = document.getElementById('grey_canvas');
        var grey_context = grey_canvas.getContext('2d');
  
        var image = document.getElementById('tracker_pic');

        var width = image.width;
        var height = image.height;
        console.log(width,height);

        canvas.width = width;
        canvas.height = height;

        grey_canvas.width = width;
        grey_canvas.height = height;
  
        window.fastThreshold = 30;


        var doFindFeatures = function() {
            //Tracking.js //To find features
            tracking.Fast.THRESHOLD = window.fastThreshold;
            context.drawImage(image, 0, 0, width, height);
        
            var imageData = context.getImageData(0, 0, width, height);
            var gray = tracking.Image.grayscale(imageData.data, width, height);
            var corners = tracking.Fast.findCorners(gray, width, height);
        
            //JSFeat //To display greyscale image
            var grey = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t );
            var code = jsfeat.COLOR_RGBA2GRAY;
            jsfeat.imgproc.grayscale(imageData.data, width, height, grey, code);
        
        
        
            var data = new Uint32Array(imageData.data.buffer);
            var alpha = (0xff << 24);
            var i = width * height, pix = 0;
            while (--i >= 0) {
                pix = grey.data[i];
                data[i] = alpha | (pix << 16) | (pix << 8) | pix;
            }
            
            grey_context.putImageData(imageData, 0, 0);
            context.putImageData(imageData, 0, 0);
            //JSFeat end
        
            //To draw points of features
            for (var i = 0; i < corners.length; i += 2) {
                context.fillStyle = '#f00';
                context.fillRect(corners[i], corners[i + 1], 3, 3);
            }
            //Tracking.js end
        };
  
       
  
        doFindFeatures();
     
    });

    //save image
    $("#save_btn").click(function(){
        
        var canvas = document.getElementById("canvas");
        var image = canvas.toDataURL();

        var alink = document.createElement('a');
        alink.setAttribute('download', 'Image.png');
        alink.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        alink.click();
        

    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    

    















});

