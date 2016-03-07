var data = {
	settings: {
		hideCode: false,
		quality: 1,
		webcam: true
	}
}

function initGUI(){
	initEditor();
	initDAT();
}

function initEditor(){
	var $textArea = $('#codemirror-container__inner textarea');
	$textArea.text($('#fragmentShader').text().trim());
	console.log($textArea.text());

	var editor = CodeMirror.fromTextArea($textArea[0], {
	    keyMap: 'sublime',
	    lineNumbers: true,
	    theme: 'monokai',
	    mode: 'x-shader/x-fragment'
	});

	editor.on('change', function(){
	    material.fragmentShader = editor.getValue();
	    material.needsUpdate = true;
	});
}

function initDAT(){
	var GUI = new dat.GUI();
	var settingsFolder = GUI.addFolder('Settings');
    controlsFolder = GUI.addFolder('Controls');
    settingsFolder.open();
    controlsFolder.open();

    var hideCodeCheckbox = settingsFolder.add(data.settings, 'hideCode').listen();
    hideCodeCheckbox.onFinishChange(function(value){
        $('#codemirror-container').toggleClass('disabled', value);
    });
    var qualityDropdown = settingsFolder.add(data.settings, 'quality', [0.5, 1, 2, 4, 8]).listen();
    qualityDropdown.onFinishChange(function(value){
        onWindowResize();
    });
    var webcamCheckbox = settingsFolder.add(data.settings, 'webcam');
    webcamCheckbox.onFinishChange(function(value){
    	if(value){
    		setWebcamTexture();
    	}else{
    		removeWebcamTexture();
    	}
    });

    if(data.settings.webcam){ setWebcamTexture(); }
}