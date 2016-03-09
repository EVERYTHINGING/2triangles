var data = {
	settings: {
		hideCode: false,
		quality: 1,
		webcam: true
	},
	controls: { }
}

function initGUI(){
	initEditor();
	initDAT();
	initDOM();
}

var editor;

function initEditor(){
	var $textArea = $('#codemirror-container__inner textarea');
	$textArea.text($('#fragmentShader').text().trim());

	editor = CodeMirror.fromTextArea($textArea[0], {
	    keyMap: 'sublime',
	    lineNumbers: true,
	    theme: 'monokai',
	    mode: 'x-shader/x-fragment'
	});

	editor.on('change', function(){
		var code = editor.getValue();
	    material.fragmentShader = editor.getValue();
	    material.needsUpdate = true;
	});
}

var controlsFolder;

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

function initDOM(){
	var selectedType = null;

	$('.dg.ac').find('.folder:last-child').after('<li><button id="add-new-control-btn">Add New Control</button></li>');

	$('#add-new-control-btn').click(function(){ $('.modal').addClass('active'); });

	$('#select--type').on('change', function(){
		selectedType = $(this).find('option:selected').val();
		$('.modal__form').hide();
		$('#modal__form--'+selectedType).show();
	});

	$('.modal__form').on('submit', function(event){
		var $form = $(this);
		event.preventDefault();

		switch(selectedType){
			case "checkbox":
				var name = $form.find('#input--checkbox-name').val();
				var value = $form.find('#input--checkbox-checked').val();
				value = value === "on" ? true : false;
				addControl(name, value, "checkbox");
			break;
			case "number":
				var name = $form.find('#input--number-name').val();
				var value = $form.find('#input--number-value').val();
				var min = $form.find('#input--number-min').val();
				var max = $form.find('#input--number-max').val();
				var step = $form.find('#input--number-step').val();
				var numberObj = {
					val: parseFloat(value),
					min: parseFloat(min),
					max: parseFloat(max),
					step: parseFloat(step)
				};

				addControl(name, numberObj, "number");
			break;
			case "color":
				var name = $form.find('#input--color-name').val();
				var value = [parseFloat($form.find('#input--color-red').val()), parseFloat($form.find('#input--color-green').val()), parseFloat($form.find('#input--color-blue').val())];
				addControl(name, value, "color");
			break;
			case "texture":
				var name = $form.find('#input--texture-name').val();
				var value = $form.find('#input--texture-url').val();
				addControl(name, value, "texture");
			break;
		}
	});

}

function addControl(name, value, type){
	data.controls[name] = {
		type: type
	};

	data.controls[name][name] = value;

	var code = editor.getValue();

	switch(type){
		case "checkbox":
			uniforms[name] = { type: "bool", value: value };
			
			var control = controlsFolder.add(data.controls[name], name, value).listen();
		    control.onFinishChange(function(value){
		        uniforms[name].value = value;
		    });

		    code = "uniform bool "+name+";\n"+code;
		break;
		case "number":
			uniforms[name] = { type: "f", value: value.val };

			data.controls[name][name] = value.val;

			var control;			

			if(value.min){ 
				data.controls[name]["min"] = value.min;
			}
			if(value.max){
				data.controls[name]["max"] = value.max;
			}

			if(value.min && value.max){
				control = controlsFolder.add(data.controls[name], name, value.min, value.max).listen();
			}else{
				control = controlsFolder.add(data.controls[name], name, value.val).listen();
				if(value.min){ control.min(value.min); }
				if(value.max){ control.max(value.max); }
			}

			if(value.step){
				control.step(value.step);
				data.controls[name]["step"] = value.step;
			}

		    control.onChange(function(value){
		        uniforms[name].value = value;
		        console.log(value);
		    });

		    code = "uniform float "+name+";\n"+code;
		break;
		case "color":
			uniforms[name] = { type: "v3", value: new THREE.Vector3(value[0], value[1], value[2]) };

			var control = controlsFolder.addColor(data.controls[name], name, [value[0]*255, value[1]*255, value[2]*255]).listen();
		    control.onChange(function(value){
		        uniforms[name].value = new THREE.Vector3(value[0]/255, value[1]/255, value[2]/255);
		    });

		    code = "uniform vec3 "+name+";\n"+code;
		break;
		case "texture":
			uniforms[name] = { type: "t", value: new THREE.TextureLoader().load(value) };
			
			var control = controlsFolder.add(data.controls[name], name, value).listen();
		    control.onFinishChange(function(value){
		        uniforms[name].value = new THREE.TextureLoader().load(value);
		    });

		    code = "uniform sampler2D "+name+";\n"+code;
		break;
	}

	editor.setValue(code);

    material.needsUpdate = true;

    $('.modal').removeClass('active');
}