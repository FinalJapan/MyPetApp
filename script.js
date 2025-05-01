// ======= Three.js 基本セットアップ =======
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======= ライト =======
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// ======= マテリアル =======
const material = new THREE.MeshStandardMaterial({
  color: 0xffcc99,
  emissive: new THREE.Color(0xffeeee),
  emissiveIntensity: 0
});

// ======= 卵オブジェクト =======
const geometry = new THREE.SphereGeometry(1, 32, 32);
geometry.scale(1, 1.3, 1);
const egg = new THREE.Mesh(geometry, material);
scene.add(egg);

// ======= 状態管理 =======
let isCracking = false;
let crackTime = 0;

let isShaking = false;
let waitTime = 0;
let shakeTime = 0;
let lastTime = performance.now();

// ======= クリックで割れ演出スタート =======
document.addEventListener("click", () => {
  if (!isCracking) {
    isCracking = true;
    crackTime = 0;
  }
});

// ======= アニメーション =======
function animate(currentTime) {
  requestAnimationFrame(animate);

  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  let hasFlashed = false;

if (isCracking) {
  crackTime += delta;

  // 光パキパキ
  material.emissiveIntensity = Math.abs(Math.sin(crackTime * 10)) * 1.5;
  egg.rotation.y += 0.02;
  egg.position.x = Math.sin(crackTime * 10) * 0.05;
  egg.position.y = Math.cos(crackTime * 12) * 0.05;

  if (crackTime > 1.4 && !hasFlashed) {
    renderer.setClearColor(0xffffff, 1);
    setTimeout(() => {
      renderer.setClearColor(0x000000, 0);
    }, 100);
    createParticles(); // フラッシュと同時に出すとより美しい
    hasFlashed = true;
  }

  if (crackTime > 1.5) {
    isCracking = false;
    scene.remove(egg);
  }
}
 else {
    // ======= 震えアニメーション =======
    if (!isShaking) {
      waitTime += delta;
      if (waitTime > 2) {
        isShaking = true;
        shakeTime = 0;
        waitTime = 0;
      }
    } else {
      shakeTime += delta;
      egg.position.x = Math.sin(shakeTime * 70) * 0.1;
      egg.position.y = Math.cos(shakeTime * 90) * 0.08;
      if (shakeTime > 0.15) {
        isShaking = false;
        egg.position.set(0, 0, 0);
      }
    }
  }

  renderer.render(scene, camera);
}

function createParticles() {
  const count = 150;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const velocities = [];

  for (let i = 0; i < count; i++) {
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI;

    const radius = Math.random() * 1.5 + 0.5; // ランダムな広がり

    const x = Math.cos(angle1) * Math.sin(angle2) * radius;
    const y = Math.sin(angle1) * Math.sin(angle2) * radius;
    const z = Math.cos(angle2) * radius;

    positions.push(x, y, z);

    // 拡散の速度（方向に飛ばす）
    velocities.push(x * 0.03, y * 0.03, z * 0.03);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

  const material = new THREE.PointsMaterial({
    size: 0.07,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // 拡散アニメーション
  const animateParticles = () => {
    const posAttr = points.geometry.getAttribute('position');
    const velAttr = points.geometry.getAttribute('velocity');

    for (let i = 0; i < posAttr.count; i++) {
      posAttr.array[i * 3] += velAttr.array[i * 3];
      posAttr.array[i * 3 + 1] += velAttr.array[i * 3 + 1];
      posAttr.array[i * 3 + 2] += velAttr.array[i * 3 + 2];
    }

    posAttr.needsUpdate = true;
    points.material.opacity -= 0.01;

    if (points.material.opacity > 0) {
      requestAnimationFrame(animateParticles);
    } else {
      scene.remove(points);
    }
  };

  animateParticles();
}

// ======= ウィンドウリサイズ =======
animate(performance.now());
