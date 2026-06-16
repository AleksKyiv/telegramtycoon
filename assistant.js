const studio = document.querySelector(".assistant-studio");
const reference = document.getElementById("studioReference");
const modeButtons = [...document.querySelectorAll("[data-studio-mode]")];
const stateButtons = [...document.querySelectorAll("[data-state]")];
let currentState = "idle";

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.studioMode));
});

stateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentState = button.dataset.state;
    stateButtons.forEach((item) => item.classList.toggle("active", item === button));
  });
});

setMode(localStorage.getItem("labos-assistant-studio-mode") || "3d");
initStudio3d();

function setMode(mode) {
  studio.classList.toggle("reference-mode", mode === "reference");
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.studioMode === mode);
  });
  localStorage.setItem("labos-assistant-studio-mode", mode);
}

async function initStudio3d() {
  const canvas = document.getElementById("assistantStudioCanvas");
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");
  } catch {
    setMode("reference");
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 0.25, 7.2);

  const rig = new THREE.Group();
  scene.add(rig);

  const skin = new THREE.MeshPhysicalMaterial({
    color: "#d9b4a2",
    emissive: "#2d1614",
    emissiveIntensity: 0.05,
    roughness: 0.4,
    clearcoat: 0.18,
    clearcoatRoughness: 0.52
  });

  const hair = new THREE.MeshStandardMaterial({
    color: "#111a24",
    emissive: "#061922",
    emissiveIntensity: 0.32,
    roughness: 0.28,
    metalness: 0.08
  });

  const suit = new THREE.MeshStandardMaterial({
    color: "#07101a",
    emissive: "#0b3940",
    emissiveIntensity: 0.44,
    metalness: 0.38,
    roughness: 0.34
  });

  const cyanGlow = new THREE.MeshBasicMaterial({
    color: "#57e5da",
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide
  });

  const limeGlow = new THREE.MeshStandardMaterial({
    color: "#b4ff67",
    emissive: "#b4ff67",
    emissiveIntensity: 1.6,
    roughness: 0.18
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 72, 42), skin);
  head.scale.set(0.82, 1.08, 0.72);
  head.position.y = 1.08;
  rig.add(head);

  const faceLight = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 18), new THREE.MeshBasicMaterial({
    color: "#f4d0bf",
    transparent: true,
    opacity: 0.14
  }));
  faceLight.scale.set(0.86, 0.76, 0.08);
  faceLight.position.set(0, 1.08, 0.53);
  rig.add(faceLight);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.77, 64, 28, 0, Math.PI * 2, 0, Math.PI * 0.6), hair);
  hairCap.scale.set(0.9, 0.68, 0.76);
  hairCap.position.set(0, 1.38, -0.03);
  hairCap.rotation.x = -0.2;
  rig.add(hairCap);

  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.34, 36, 24), hair);
  bun.scale.set(1.05, 0.88, 0.8);
  bun.position.set(0.15, 1.82, -0.18);
  rig.add(bun);

  const sideHairGeo = new THREE.CapsuleGeometry(0.12, 1.08, 8, 24);
  const leftHair = new THREE.Mesh(sideHairGeo, hair);
  const rightHair = new THREE.Mesh(sideHairGeo, hair);
  leftHair.position.set(-0.52, 0.82, 0.03);
  rightHair.position.set(0.52, 0.82, 0.03);
  leftHair.rotation.z = -0.13;
  rightHair.rotation.z = 0.13;
  rig.add(leftHair, rightHair);

  const eyeWhite = new THREE.MeshBasicMaterial({ color: "#efffff" });
  const irisMaterial = new THREE.MeshStandardMaterial({
    color: "#23e5db",
    emissive: "#57e5da",
    emissiveIntensity: 0.7,
    roughness: 0.18
  });

  const eyeGeo = new THREE.SphereGeometry(0.078, 24, 14);
  const leftEye = new THREE.Mesh(eyeGeo, eyeWhite);
  const rightEye = new THREE.Mesh(eyeGeo, eyeWhite);
  leftEye.scale.set(1.48, 0.68, 0.16);
  rightEye.scale.set(1.48, 0.68, 0.16);
  leftEye.position.set(-0.25, 1.13, 0.52);
  rightEye.position.set(0.25, 1.13, 0.52);
  rig.add(leftEye, rightEye);

  const irisGeo = new THREE.SphereGeometry(0.032, 16, 10);
  const leftIris = new THREE.Mesh(irisGeo, irisMaterial);
  const rightIris = new THREE.Mesh(irisGeo, irisMaterial);
  leftIris.position.set(-0.25, 1.13, 0.58);
  rightIris.position.set(0.25, 1.13, 0.58);
  rig.add(leftIris, rightIris);

  const browMaterial = new THREE.MeshStandardMaterial({ color: "#101821", roughness: 0.38 });
  const browGeo = new THREE.BoxGeometry(0.21, 0.02, 0.016);
  const leftBrow = new THREE.Mesh(browGeo, browMaterial);
  const rightBrow = new THREE.Mesh(browGeo, browMaterial);
  leftBrow.position.set(-0.25, 1.28, 0.55);
  rightBrow.position.set(0.25, 1.28, 0.55);
  leftBrow.rotation.z = 0.08;
  rightBrow.rotation.z = -0.08;
  rig.add(leftBrow, rightBrow);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 16), skin);
  nose.position.set(0, 1.02, 0.58);
  nose.rotation.x = Math.PI / 2;
  rig.add(nose);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.02, 0.012), new THREE.MeshBasicMaterial({ color: "#9f5e66" }));
  mouth.position.set(0, 0.86, 0.58);
  rig.add(mouth);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.5, 36), skin);
  neck.position.y = 0.34;
  rig.add(neck);

  const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(1.02, 0.82, 8, 42), suit);
  shoulders.scale.set(1.16, 0.52, 0.5);
  shoulders.position.y = -0.64;
  shoulders.rotation.z = Math.PI / 2;
  rig.add(shoulders);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.66, 1.05, 8, 40), suit);
  torso.scale.set(0.98, 0.86, 0.52);
  torso.position.y = -0.55;
  rig.add(torso);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.018, 8, 128), cyanGlow);
  collar.position.y = -0.1;
  collar.rotation.x = Math.PI / 2.2;
  rig.add(collar);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 20), limeGlow);
  core.position.set(0, -0.54, 0.5);
  rig.add(core);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.26, 0.012, 8, 160), cyanGlow.clone());
  halo.position.y = 1.12;
  halo.rotation.x = Math.PI / 2.55;
  rig.add(halo);

  const lowerHalo = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.01, 8, 160), cyanGlow.clone());
  lowerHalo.material.opacity = 0.28;
  lowerHalo.position.y = -0.42;
  lowerHalo.rotation.x = Math.PI / 2.18;
  rig.add(lowerHalo);

  const key = new THREE.PointLight("#ffe1d2", 2.8, 8);
  key.position.set(-1.5, 2.4, 3.2);
  const rim = new THREE.PointLight("#57e5da", 2.5, 7);
  rim.position.set(2, 1.4, 2.8);
  const fill = new THREE.PointLight("#b4ff67", 0.85, 6);
  fill.position.set(1.5, -0.7, 2.5);
  scene.add(key, rim, fill, new THREE.AmbientLight("#bdf8f0", 0.58));

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(time = 0) {
    requestAnimationFrame(render);
    const t = time * 0.001;
    const alert = currentState === "alert" ? 1 : 0;
    const thinking = currentState === "thinking" ? 1 : 0;
    const listening = currentState === "listening" ? 1 : 0;
    rig.rotation.y = Math.sin(t * 0.48) * 0.14 + listening * Math.sin(t * 1.2) * 0.04;
    rig.rotation.x = Math.sin(t * 0.38) * 0.025;
    rig.position.y = Math.sin(t * 1.05) * 0.04;
    halo.rotation.z = t * (0.22 + thinking * 0.45 + alert * 0.7);
    lowerHalo.rotation.z = -t * 0.18;
    core.scale.setScalar(1 + Math.sin(t * (2.2 + alert * 2.2)) * (0.08 + alert * 0.08));
    leftIris.position.x = -0.25 + Math.sin(t * 0.9) * 0.012;
    rightIris.position.x = 0.25 + Math.sin(t * 0.9) * 0.012;
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener("resize", resize);
  render();
}
