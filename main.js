import './style.css';
import * as THREE from 'three';
import {ObjectControls} from 'threeJS-object-controls';
//import * as CANNON from 'cannon-es';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('.bg')});

/*
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
})
*/

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(40);
var controls = new ObjectControls(camera, renderer.domElement);

renderer.render(scene, camera);

const geometry = new THREE.SphereGeometry( 15, 50, 50 );
const material = new THREE.MeshStandardMaterial({color: 0x2e6930, wireframe:false});
const sphere = new THREE.Mesh(geometry, material,);
scene.add(sphere);

const geometryD = new THREE.SphereGeometry( 15, 50, 50 );
const materialD = new THREE.MeshStandardMaterial({color: 0x2e6930, wireframe:false});
const sphereD = new THREE.Mesh(geometryD, materialD);
scene.add(sphereD);

//const globeTexture = new THREE.TextureLoader().load( "./assets/waterTexture.jpg" );
const geometryO = new THREE.SphereGeometry( 15.1, 400, 400 );
const materialO = new THREE.MeshStandardMaterial({color: 0x6495ED, wireframe:false} );
const OuterSphere = new THREE.Mesh(geometryO, materialO,);
scene.add(OuterSphere);



const geometryMaker = new THREE.SphereGeometry(0.4, 32, 32);
const materialMaker = new THREE.MeshStandardMaterial({color: 0xF00AA0});
const Maker = new THREE.Mesh(geometryMaker, materialMaker);
Maker.position.set(1, 1, 1);
scene.add(Maker);

Maker.userData.ignoreRaycast = true;

const raycasterMaker = new THREE.Raycaster();
const mouseMaker = new THREE.Vector2();
const objectToFollow = Maker;
let lastMouseX = 0;
let lastMouseY = 0;

function onMouseMove(event) {
  mouseMaker.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseMaker.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function updateObjectPosition() {
  if (mouseMaker.x !== lastMouseX || mouseMaker.y !== lastMouseY) {
    raycasterMaker.setFromCamera(mouseMaker, camera);
    const intersects = raycasterMaker.intersectObjects(scene.children);
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      objectToFollow.position.copy(intersectionPoint);
    }
  }
  lastMouseX = mouseMaker.x;
  lastMouseY = mouseMaker.y;
}

window.addEventListener('mousemove', onMouseMove, false);

function animate() {
  requestAnimationFrame(animate);
  updateObjectPosition();
  renderer.render(scene, camera);
}

animate();


OuterSphere.userData.ignoreRaycast = true;

const light = new THREE.DirectionalLight( 0xffffCf, 1.2);
light.position.set( 10, 10, 30 );
scene.add( light );

const gridhelper = new THREE.GridHelper(200, 50);
//scene.add(gridhelper)

/*
function onDocumentMouseMove(event) {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  camera.position.x = mouseX * 20;
  camera.position.y = mouseY * 20;

  camera.lookAt(scene.position);
}
*/

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
const vector3 = new THREE.Vector3();
const MAX_CLICK_DISTANCE = 2.2

window.addEventListener('click', event => {
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(clickMouse, camera);
  const found = raycaster.intersectObjects(scene.children.filter(obj => obj !== OuterSphere && obj !== Maker));
  if (found.length > 0 && (found[0].object).geometry) {
      const mesh = found[0].object
      if (mesh === OuterSphere){
        return;
      } 
      const geometry = mesh.geometry
      const point = found[0].point
      const isSphereD = mesh === sphereD;
      const isSphere = mesh === sphere;
      
      for (let i = 0; i  < geometry.attributes.position.count; i++) {
          vector3.setX(geometry.attributes.position.getX(i))
          vector3.setY(geometry.attributes.position.getY(i))
          vector3.setZ(geometry.attributes.position.getZ(i))
          const toWorld = mesh.localToWorld(vector3)
          const distance = point.distanceTo(toWorld)
          if (distance < MAX_CLICK_DISTANCE) {
              if (isSphereD) {
                  geometry.attributes.position.setY(i, geometry.attributes.position.getY(i) - (MAX_CLICK_DISTANCE - distance) / 2);
                  console.log("create land down")
              } 
              if (isSphere){
                  geometry.attributes.position.setY(i, geometry.attributes.position.getY(i) + (MAX_CLICK_DISTANCE - distance) / 2);
                  console.log("create land up")
              }
          }
      }
      geometry.computeVertexNormals()
      geometry.attributes.position.needsUpdate = true
  }
});

document.addEventListener('mousemove',(event) => {
  const rotationSpeed = 0.00004 ;
  sphere.rotation.y += (event.clientX - window.innerWidth / 2) * rotationSpeed;
  sphere.rotation.x += (event.clientY - window.innerHeight / 2) * rotationSpeed;
  sphereD.rotation.y += (event.clientX - window.innerWidth / 2) * rotationSpeed;
  sphereD.rotation.x += (event.clientY - window.innerHeight / 2) * rotationSpeed;
});


function addStars(){
  const geometry = new THREE.SphereGeometry(0.04, 2, 2);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(140));
  star.position.set(x, y, z);
  star.position.z = -1;
  scene.add(star);
}

Array(2000).fill().forEach(addStars);

scene.background = new THREE.Color( 0x1F1921 );

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();

controls.enableHorizontalRotation();
controls.enableVerticalRotation();
//controls.setRotationSpeed(0.1);
controls.setObjectToMove(sphere, sphereD);
controls.disableZoom();





//dev tools

document.addEventListener("keydown", (event) => {
  if (event.code === "KeyF") {
    document.querySelector(".bg").style.cursor = "none";
    console.log("cursor off")
  } else if (event.code === "KeyG") {
    document.querySelector(".bg").style.cursor = "default";
    console.log("cursor on")
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "KeyR") {
    location.reload();  
  }
});

console.log(
  "DEV TOOLS",
  "",
  "---",
  "",
  "Cursor off = F",
  "",
  "Cursor on = G",
  "",
  "Reset = R"
);