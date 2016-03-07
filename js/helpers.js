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
		video.src = window.URL.createObjectURL(stream);
		callback(video);
	}, function(error) {
		callback(false);
	});
}