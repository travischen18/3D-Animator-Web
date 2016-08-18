var currFrame = 0;

var cubeMesh;

function updateFrame(frame) {
    currFrame = frame;
    outputUpdate(currFrame);
}

function outputUpdate(frame) {
    document.querySelector('#currFrame').value = frame;
}

//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0,
};

// THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };
   
/*    
var positionsArray;

positionsArray[0] = new THREE.Vector3(0, 0, 0);

positionsArray[5] = new THREE.Vector3(6, 0, 0);

positionsArray[10] = new THREE.Vector3(6, 8, 0); */

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

    container = document.getElementById('world');
    
HEIGHT = window.innerHeight * .6;
WIDTH = window.innerWidth;

scene = new THREE.Scene();
aspectRatio = WIDTH / HEIGHT;
fieldOfView = 60;
nearPlane = 1;
farPlane = 10000;
camera = new THREE.PerspectiveCamera(
fieldOfView,
aspectRatio,
nearPlane,
farPlane
);
camera.position.x = 0;
camera.position.z = 50;
camera.position.y = 25;

camera.lookAt(new THREE.Vector3(0, 0, 0));

renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMap.enabled = true;

container.appendChild(renderer.domElement);

window.addEventListener('resize', handleWindowResize, false);
}

// HANDLE SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight * .6;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}


// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
}




function createCube() {
    var cube = new THREE.BoxGeometry(10, 10, 10);
    var cubeMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
    cubeMesh = new THREE.Mesh(cube, cubeMat);
    scene.add(cubeMesh);

}


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / WIDTH ) * 2 - 1;
	
	// HACKY!!!
	mouse.y = (- ( event.clientY / HEIGHT ) * 2 + 1) + 1;	
	
	console.log(mouse.y);	

}

window.addEventListener( 'mousemove', onMouseMove, false );

window.requestAnimationFrame(render);

function render(){
    requestAnimationFrame(render);

    cubeMesh.position.x = currFrame;
    cubeMesh.material.color.set(Colors.red);
    
    // update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );	

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObject(cubeMesh);
    
	for ( var i = 0; i < intersects.length; i++ ) {
		intersects[ i ].object.material.color.set( 0xff0000 );
	}
    
    renderer.render(scene, camera);

  
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

function init(){
  createScene();
  createLights();
  createCube();
  
  render();
}


window.addEventListener('load', init, false);
