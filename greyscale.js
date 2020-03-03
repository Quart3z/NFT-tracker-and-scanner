

$(document).ready(function(){





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
