var container;
var camera, scene, renderer;
var uniforms;
var material;
var renderTarget1, renderTarget2, webcamTexture;
var startTime = Date.now();

function init() {
    container = document.getElementById('container');

    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    createRenderTargets();

    uniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        mouse: { type: "v2", value: new THREE.Vector2() },
        backbuffer: { type: "t", value: renderTarget2 }
    };

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    } );

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    document.onmousemove = function(e){
        uniforms.mouse.value.x = (e.pageX/window.innerWidth);
        uniforms.mouse.value.y = (e.pageY/window.innerHeight);
    }

    animate();
}

function createRenderTargets(){
    renderTarget1 = new THREE.WebGLRenderTarget(window.innerWidth/data.settings.quality, window.innerHeight/data.settings.quality, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });
    renderTarget2 = new THREE.WebGLRenderTarget(window.innerWidth/data.settings.quality, window.innerHeight/data.settings.quality, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });
}

function setWebcamTexture(){
    getWebcam(1024, 768, function(video){
        webcamTexture = new THREE.Texture(video);
        webcamTexture.minFilter = THREE.LinearFilter;
        webcamTexture.magFilter = THREE.LinearFilter;
        uniforms.webcam = { type: "t", value: webcamTexture };
        material.needsUpdate = true;
    });
}

function removeWebcamTexture(){
    webcamStream.getVideoTracks()[0].stop();
    uniforms.webcam = null;
    material.needsUpdate = true;
}

function onWindowResize(event) {
    renderer.setSize(window.innerWidth/data.settings.quality, window.innerHeight/data.settings.quality);
    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
    createRenderTargets();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    if(uniforms.webcam){ webcamTexture.needsUpdate = true; }
    uniforms.time.value = (Date.now() - startTime) / 1000;
    uniforms.backbuffer.value = renderTarget2;
    
    renderer.render(scene, camera, renderTarget1, false);
    renderer.render(scene, camera);

    var tmpRT = renderTarget1;
    renderTarget1 = renderTarget2;
    renderTarget2 = tmpRT;
}