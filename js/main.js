var NUM_FRAMES = 20;
var currFrame = 1;

var DRAGGABLE = true;

var cubeMesh;

var frames = [];
var allFrames = [];

var playback;

var PAUSED = true;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var playFrame = 1;

// Intersection point
var intersection = new THREE.Vector3(0, 0, 0);
var plane;
var selectedObject;

// Array of intersected objects
var intersects;

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

var HEIGHT, WIDTH;


function updateFrame(frame) {
    currFrame = frame;
    outputUpdate(currFrame);

    // Draw the current position
    if (frames != undefined && frames[currFrame] != undefined) {
      cubeMesh.position.copy(frames[currFrame].positionVec);
    }
}

function outputUpdate(frame) {
    document.querySelector('#currFrame').value = frame;
}


// Set a keyframe
$(document).ready(function(){
    $("#keyFrameButton").click(function(){

        frames[currFrame] = new Frame(new THREE.Vector3(0, 0, 0), true);

        if (frames[currFrame].positionVec == undefined) {
          console.log("hi");
        }
        frames[currFrame].positionVec.copy(cubeMesh.position);

        interpolateKeys();

    });

    $("#playButton").click(function(){

        PAUSED = false;
        playback = setInterval(updateAll, 41.5);

        
    });

    $("#pauseButton").click(function(){

        PAUSED = true;
        
    });


});

function interpolateKeys() {
  var prevKey = null;
  var nextKey = null;
  for (var i = 0; i < frames.length; i++) {
    if (frames[i] != undefined && frames[i].isKey) {

      // We have a set keyframe

      if (prevKey != null) {
        // If we're not on the first frame and the previous frame
        if (i > 0 && (frames[i - 1] == undefined || !frames[i - 1].isKey)) {
          interpolateTwoKeys(prevKey, i);
        }
      }

      prevKey = i;

    }

  }
}

function updateAll() {
  // If we hit the end, or PAUSED = true
  if (playFrame >= NUM_FRAMES || PAUSED) {

    playFrame = currFrame;
    clearInterval(playback);

  } else {
    playFrame++;
  }

  updateTimeline(playFrame);
  updateFrame(playFrame);
}

function updateTimeline(i) {
  document.querySelector('#timeline').value = i;
}

var Frame = function (positionVec, isKey) {
  this.positionVec = positionVec;
  this.isKey = isKey;
};

// Interpolates the frames between frames[i1] and frames[i2]
function interpolateTwoKeys(i1, i2) {

  var newVec;

  // Get the difference vector between the two locations
  var vecDiff = new THREE.Vector3();
  vecDiff.copy(frames[i2].positionVec);
  vecDiff.sub(frames[i1].positionVec);

  // Get the frame difference
  var frameDiff = i2 - i1;

  // The add vector is vector / numFrames
  vecDiff.divideScalar(frameDiff);

  for (var j = i1 + 1; j < i2; j++) {
    newVec = new THREE.Vector3();
    newVec.copy(vecDiff);
    newVec.multiplyScalar(j-i1);

    // Add a new frame that is NOT a keyframe
    frames[j] = new Frame(newVec, false);
    frames[j].positionVec.add(frames[i1].positionVec);
  }
}


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
  camera.position.x = 70;
  camera.position.z = 80;
  camera.position.y = 70;

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
    var cube = new THREE.BoxGeometry(15, 15, 15);
    var cubeMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
    cubeMesh = new THREE.Mesh(cube, cubeMat);
    scene.add(cubeMesh);

}

// When the mouse moves
function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / WIDTH ) * 2 - 1;
	
	// HACKY!!!
	mouse.y = (- ( event.clientY / HEIGHT ) * 2 + 1) + 1;	

  if (selectedObject) {


    // If the mouse is moving while there is an object selected
    raycaster.setFromCamera( mouse, camera );
    
    intersects = raycaster.intersectObject( plane );

    if (intersects.length > 0) {
      selectedObject.position.copy(intersects[ 0 ].point);
    }
  /*} else {
    // If the mouse is moving while there is no object intersected
    intersects = raycaster.intersectObject(cubeMesh);
    if ( intersects.length > 0 ) {
      plane.position.copy(intersects[0].object.position );
      plane.lookAt( camera.position );
    }
  } */

 }
}
// When the mouse clicks down

// AFTER:
// selectedObject is the cube if selected, null if nothing
// offset is the difference between the intersection of the ray and plane minus the current plane position
function onMouseDown( event ) {

  // Intersects is the array of intersections with cubeMesh
  intersects = raycaster.intersectObject(cubeMesh);

  // If the mouse has clicked down on the cubeMesh
  if ( intersects.length > 0 ) {

    // Save the selected object (cubeMesh)
    selectedObject = intersects[ 0 ].object;

  }

}

function onMouseUp( event ) {
  selectedObject = null;
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mouseup', onMouseUp, false );

function render(){
    requestAnimationFrame(render);

    cubeMesh.material.color.set(Colors.red);
    
    // update the picking ray with the camera and mouse position	
    raycaster.setFromCamera( mouse, camera );	

    // calculate objects intersecting the picking ray
    intersects = raycaster.intersectObject(cubeMesh);
      
    for ( var i = 0; i < intersects.length; i++ ) {
    	intersects[ i ].object.material.color.set( 0xff0000 );
    }
      
    renderer.render(scene, camera);

}

function init(){

  createScene();
  createLights();
  createCube();
  setUpDrag();
  
  render();

}


function setUpDrag() {
  var planeMat = new THREE.MeshBasicMaterial({visible:false});

  plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000,
  2000, 18, 18 ), planeMat);

  plane.lookAt(camera.position);
  scene.add( plane ); 
}


window.addEventListener('load', init, false);
