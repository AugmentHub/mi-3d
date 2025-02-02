var loader, scene, camera, renderer, controls,
  ambiLight, sphere, xAxis, yAxis, zAxis, ket0, ket1, states;


function init_bloch_sphere(containerName='Bloch Sphere') {
  var viewAngle = 25; // 75
  var nearClipping = 0.1;
  var farClipping = 1000;

  var container = document.getElementById(containerName);

  loader = new THREE.FontLoader();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  ambiLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambiLight);

  camera = new THREE.PerspectiveCamera(viewAngle, window.innerWidth / window.innerHeight, nearClipping, farClipping);
  // Position camera
  camera.position.set(0, 0, 10); // Ensure the camera is positioned straight ahead of the sphere
  camera.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure the camera is looking at the origin


  renderer = new THREE.WebGLRenderer({antialias: true});

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);


  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  var blockedAngle = 0.25;
  /*
  controls.minPolarAngle = blockedAngle;
  controls.maxPolarAngle = Math.PI - blockedAngle;
  controls.minDistance = 1.2;
  controls.maxDistance = 4;
  */
  //camera.position.set(1.1, 1.1, 1.3);
  //camera.lookAt(new THREE.Vector3(0, 0, 0));
  controls.update();
  controls.rotateSpeed = 0.1;
  controls.dampingFactor = 1; // Adjust for smoothness

  //controls.autoRotate = true;
  //controls.autoRotateSpeed = 5;
  

  sphere = genSphere();

/*
  xAxis = genLine(new THREE.Vector3(1, 0, 0), 0x44FF44, 'x');
  yAxis = genLine(new THREE.Vector3(0, 0, 1), 0xFF4444, 'y');
  zAxis = genLine(new THREE.Vector3(0, 1, 0), 0x4444FF, 'z');
  */


  window.addEventListener('resize', onWindowResize, false);

  states = [];

  requestAnimationFrame(animate);
}



function animate() {
  requestAnimationFrame(animate);


  controls.update();
 // ket0.lookAt(camera.position);
 // ket1.lookAt(camera.position);
  /*xAxis.stateName.lookAt(camera.position);
  yAxis.stateName.lookAt(camera.position);
  zAxis.stateName.lookAt(camera.position);
  for (var i=0; i<states.length; i++) {
    states[i].stateName.lookAt(camera.position);
  }
  */
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function genSphere() {

  var txtrHW = 360;

  var txtrData = new Uint8Array(4 * txtrHW * txtrHW);
  for (var w = 0; w < txtrHW; w++) {
    for (var h = 0; h < txtrHW; h++) {
    	var stride = ((h * txtrHW) + w) * 4;
    	txtrData[stride] = 255; // red
    	txtrData[stride + 1] = 255; // green
      txtrData[stride + 2] = 255; // blue
      if (w % 45 == 0 || h % 45 == 0) {
        txtrData[stride + 3] = 255; // alfa; opaque
      } else {
        txtrData[stride + 3] = 0; // alfa; transparen
      }
    }
  }
/*
  var ambient = new THREE.AmbientLight( 0xffffff );
        scene.add( ambient );

        pointLight = new THREE.PointLight( 0xffffff, 2 );
        scene.add( pointLight );
 
*/
  var sphereTexture = new THREE.DataTexture(txtrData, txtrHW, txtrHW, THREE.RGBAFormat);
  sphereTexture.needsUpdate = true;

  var path = "/static/clouds/";
  var format = '.webp';
  var urls = [
      path + 'right' + format, path + 'left' + format,
      path + 'top' + format, path + 'bottom' + format,
      path + 'back' + format, path + 'front' + format
  ];

  var reflectionCube = new THREE.CubeTextureLoader().load( urls );
        reflectionCube.format = THREE.RGBFormat; 

  scene.background=reflectionCube;

  var sphereMaterial = new THREE.MeshPhongMaterial( { color: "white", envMap: reflectionCube, depthWrite: false, depthTest: false, reflectivity :0.5 , refractionRatio: 0.95 } );
  //0xccddff
  /*new THREE.MeshPhongMaterial({
    map: sphereTexture,
    shininess: 0.0,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false});
    */

  var sphereGeometry = new THREE.SphereGeometry(1.0, 64, 64);
  var local_sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  local_sphere.position.z = 0;
  local_sphere.position.x = 0;
  local_sphere.position.y = 0;
  
  scene.add(local_sphere);
  return local_sphere;

}

function genLine(position, lineColor, name) {
  var lineMaterial = new THREE.LineBasicMaterial({color: lineColor});
  var lineGeometry = new THREE.Geometry();
  lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
  lineGeometry.vertices.push(position);
  var line = new THREE.Line(lineGeometry, lineMaterial);

  line.stateName = null;
  line.name = name;
  loader.load('https://threejs.org/examples/fonts/optimer_regular.typeface.json', function (font) {
    var nameGeometry = new THREE.TextGeometry(name, {
      font: font,
      size: 0.1,
      height: 0.01 });
    var nameMaterial = new THREE.MeshPhongMaterial({color: lineColor});
    line.stateName = new THREE.Mesh(nameGeometry, nameMaterial);
    line.stateName.position.set(position.x, position.y, position.z);
    line.stateName.position.multiplyScalar(0.7);
    line.add(line.stateName);
  });

  scene.add(line);

  return line;
}

function addState(x, y, z, color, name) {
  var vec = new THREE.Vector3(x, z, y); // Three.js swaps y and z for some reason
  vec.normalize();
  states.push(genLine(vec, color, name));
}

function removeState(name) {
  for (var i=0; i<states.length; i++) {
    if (states[i].name == name) {
      scene.remove(states[i]);
      states.splice(i, 1);
      break;
    }
  }
}
