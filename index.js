(function(){
  const canvas = document.getElementById('globeCanvas');
  if(!canvas || !window.THREE) return;

  const size = 280;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setSize(size, size);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 4.5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dLight.position.set(3,2,4);
  scene.add(dLight);

  const globeGroup = new THREE.Group();
  globeGroup.rotation.x = 0.25; // slight tilt so it doesn't look flat
  scene.add(globeGroup);

  // solid base sphere so wireframe has something to sit on top of
  const solidGeo = new THREE.SphereGeometry(1.48, 32, 24);
  const solidMat = new THREE.MeshPhongMaterial({color:0xDCE8DE, transparent:true, opacity:0.35});
  globeGroup.add(new THREE.Mesh(solidGeo, solidMat));

  const wireGeo = new THREE.SphereGeometry(1.5, 22, 16);
  const wireMat = new THREE.MeshBasicMaterial({color:0x5A4632, wireframe:true, transparent:true, opacity:0.4});
  globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

  // farm location pins — bigger, glowing gold, with a thin stalk so they read as "pins" not dots
  const states = ['Oyo','Enugu','Kaduna','Imo','Kano','Benue','Kwara','Ogun','Plateau','Delta','Ondo','Niger'];
  const pinPositions = [
    [0.4,0.9],[1.1,0.3],[0.8,-0.5],[-0.6,0.7],[-1.0,-0.2],
    [0.1,1.3],[-0.3,-0.9],[1.3,-0.1],[-1.2,0.5],[0.6,-1.1],
    [-0.8,1.0],[0.2,-0.2]
  ];
  const headGeo = new THREE.SphereGeometry(0.08, 10, 10);
  const headMat = new THREE.MeshBasicMaterial({color:0xC98A3B});
  const glowGeo = new THREE.SphereGeometry(0.14, 10, 10);
  const glowMat = new THREE.MeshBasicMaterial({color:0xC98A3B, transparent:true, opacity:0.25});

  pinPositions.forEach(([theta, phi])=>{
    const r = 1.55;
    const x = r * Math.cos(phi) * Math.cos(theta);
    const y = r * Math.sin(phi);
    const z = r * Math.cos(phi) * Math.sin(theta);

    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(x,y,z);
    globeGroup.add(head);

    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(x,y,z);
    globeGroup.add(glow);
  });

  function animate(){
    requestAnimationFrame(animate);
    globeGroup.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();
})();