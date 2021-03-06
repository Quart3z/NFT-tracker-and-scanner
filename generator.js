var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('imageCanvas');
var hideCanvas = document.getElementById('hideCanvas');
hideCanvas.style.display = "none";
var ctx = canvas.getContext('2d');
ctx.fillStyle = "#949494";
ctx.fillRect(0, 0, canvas.width, canvas.height);
var ctxHide = hideCanvas.getContext('2d');

var reader = new FileReader();

var name;
var nameWithExt;
var gray;

var globalObj = {
    dpi: 0,
    nc: 0,
    w: 0,
    h: 0,
    arr: []
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#tracker_pic').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}


function handleImage(e) {
    nameWithExt = e.target.files[0].name;
    console.log("Image uploaded: " + nameWithExt);

    readURL(this);


    name = nameWithExt.substr(0, nameWithExt.lastIndexOf('.'));

    let extJpg = nameWithExt.substr(nameWithExt.lastIndexOf('.'));


    if (extJpg == '.jpg' || extJpg == '.jpeg' || extJpg == '.JPG' || extJpg == '.JPEG') {
        useJpeg(e);
    } else if (extJpg == '.png' || extJpg == '.PNG') {
        globalObj.dpi = 72;
        readImage(e)
    } else {
        console.log("Invalid image format!");
    }

    document.getElementById("generateBt").disabled = false;
}

function generate() {

    toGray();

    var imageCanvas = document.querySelector('#imageCanvas');
    imageCanvas.style.opacity = 0.25;

    setTimeout(() => {
        let cmdArr = [0, name];

        let heapSpace = Module._malloc(globalObj.arr.length * globalObj.arr.BYTES_PER_ELEMENT); // 1
        Module.HEAPU8.set(globalObj.arr, heapSpace); // 2

        Module._createImageSet(heapSpace, globalObj.dpi, globalObj.w, globalObj.h, globalObj.nc, name, cmdArr.length, cmdArr);
        Module._free(heapSpace);


        downloadIset();
    }, 500);
}

function downloadIset() {

    $("#loading").hide();

    let mime = "application/octet-stream";

    let filenameIset = "asa.iset";
    let filenameFset = "asa.fset";
    let filenameFset3 = "asa.fset3";

    let ext = ".iset";
    let ext2 = ".fset";
    let ext3 = ".fset3";

    let content = Module.FS.readFile(filenameIset);
    let contentFset = Module.FS.readFile(filenameFset);
    let contentFset3 = Module.FS.readFile(filenameFset3);

    var a = document.createElement('a');
    a.download = "marker.iset";
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.style.display = 'none';

    var b = document.createElement('a');
    b.download = "marker.fset";
    b.href = URL.createObjectURL(new Blob([contentFset], { type: mime }));
    b.style.display = 'none';

    var c = document.createElement('a');
    c.download = "marker.fset3";
    c.href = URL.createObjectURL(new Blob([contentFset3], { type: mime }));
    c.style.display = 'none';

    var d = document.createElement('a');
    var p = globalObj.w + "\n" + globalObj.h + "\n" + globalObj.dpi;
    d.download = 'marker.txt';
    d.href = URL.createObjectURL(new Blob([p], { type: "text/plain" }));
    d.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    document.body.appendChild(b);
    b.click();

    document.body.appendChild(c);
    c.click();

    document.body.appendChild(d);
    d.click();

}

function getUint8(str) {
    let base64 = str.substr(23, str.length);
    var raw = atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }

    // console.log("arr", array)
    return array;
}

function openModal() {
    let modalWrapper = document.getElementById("modal");
    modalWrapper.style.display = "block";
}

function closeModal() {
    let modalWrapper = document.getElementById("modal");
    modalWrapper.style.display = "none";
}

function setValueFromModal() {
    let input = document.getElementById("modalInput").value;
    globalObj.nc = parseInt(input);
    closeModal();
}

function detectColorSpace(arr) {
    let target = parseInt(arr.length / 4);

    let counter = 0;

    for (let j = 0; j < arr.length; j += 4) {
        let r = arr[j];
        let g = arr[j + 1];
        let b = arr[j + 2];

        if (r == g && r == b) {
            counter++;
        }
    }

    if (target == counter) {
        return 1;
    } else {
        return 3;
    }
}

function useJpeg(e) {
    EXIF.getData(e.target.files[0], function () {
        var dpi1 = parseFloat(EXIF.getTag(this, "XResolution"));

        if (isNaN(dpi1) || dpi1 == null) {
            globalObj.dpi = 72
        } else {
            globalObj.dpi = dpi1;
        }

        var nc1 = EXIF.getTag(this, "ComponentsConfiguration")

        if (isNaN(nc1) || nc1 == null) {
            var nc2 = parseFloat(EXIF.getTag(this, "SamplesPerPixel"));
            if (isNaN(nc2) || nc2 == null) {
                // openModal();
            } else {
                globalObj.nc = nc2;
            }
        } else {
            globalObj.nc = nc1;
        }

        readImage(e);
    });

}

function readImage(e) {
    reader.onload = function (event) {

        var img = new Image();
        img.onload = function () {

            var canvasEl = document.querySelector('#imageCanvas');
            canvas.width = canvasEl.clientWidth;
            canvas.height = canvasEl.clientHeight;

            hideCanvas.width = img.width;
            hideCanvas.height = img.height;

            globalObj.w = img.width;
            globalObj.h = img.height;

            ctxHide.drawImage(img, 0, 0);

            ctx.drawImage(img, 0, 0, img.width, img.height,     // source rectangle
                0, 0, canvas.width, canvas.height); // destination rectangle

            var imgData = ctxHide.getImageData(0, 0, hideCanvas.width, hideCanvas.height);

            let newArr = [];

            let verifyColorSpace = detectColorSpace(imgData.data);

            if (verifyColorSpace == 1) {
                for (let j = 0; j < imgData.data.length; j += 4) {
                    newArr.push(imgData.data[j]);
                }
            } else if (verifyColorSpace == 3) {
                for (let j = 0; j < imgData.data.length; j += 4) {
                    newArr.push(imgData.data[j]);
                    newArr.push(imgData.data[j + 1]);
                    newArr.push(imgData.data[j + 2]);
                }
            }

            globalObj.nc = verifyColorSpace;

            let uint = new Uint8Array(newArr);

            globalObj.arr = uint;


        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function calculateQuality(){

    let hist = getHistogram(gray);
    let ent = 0;
    let totSize = globalObj.w * globalObj.h;
    for(let i = 0; i < 255; i++){
        if(hist[i] > 0){
            let temp = (hist[i]/totSize)*(Math.log(hist[i]/totSize));
            ent += temp;
        }
    }

    let entropy = (-1 * ent).toFixed(2);
    let oldRange = (5.17 - 4.6);
    let newRange = (5 - 0);
    let level = (((entropy - 4.6) * newRange) / oldRange);

    if(level > 5){
        level = 5;
    }else if(level < 0){
        level = 0;
    }
    return {l:level.toFixed(2), e: entropy};
}

function getHistogram(arr){
    let hist = [256];
    for(let i = 0; i < arr.length; i++){
        hist[i] = 0;
    }
    for(let i = 0; i < arr.length; i++){
        hist[arr[i]]++;
    }
    return hist;
}

function toGray(){

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var grey_canvas = document.getElementById('grey_canvas');
    var grey_context = grey_canvas.getContext('2d');

    var image = document.getElementById('tracker_pic');

    var width = image.width;
    var height = image.height;

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
        gray = tracking.Image.grayscale(imageData.data, width, height);
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
    $("p").show();
    $("#loading").show();
}
