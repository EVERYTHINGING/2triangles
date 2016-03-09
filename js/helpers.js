var webcamStream = null;

function getWebcam(width, height, callback){
	video = document.createElement('video');
	video.width = width;
	video.height = height;
	video.autoplay = true;
	video.loop = true;

	window.URL = window.URL || window.webkitURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	//get webcam
	navigator.getUserMedia({
		video: true
	}, function(stream) {
		webcamStream = stream;	
		video.src = window.URL.createObjectURL(stream);
		callback(video);
	}, function(error) {
		callback(false);
	});
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}