// ======= Three.js の基本セットアップ =======

// シーン（空間）を作成
const scene = new THREE.Scene();

// カメラ（見る位置）を作成
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.z = 5;

// レンダラー（描画エンジン）を作成
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setClearColor(0x000000, 0); // 背景を透明に設定
document.body.appendChild(renderer.domElement);

// ======= たまご型オブジェクトを作成 =======

// 球体を縦に伸ばしてたまご型に
const geometry = new THREE.SphereGeometry(1, 32, 32);
geometry.scale(1, 1.3, 1);

// 表面の見た目（マテリアル）を設定
const material = new THREE.MeshStandardMaterial({ color: 0xffcc99 });

// 形（ジオメトリ）と表面（マテリアル）を合体
const egg = new THREE.Mesh(geometry, material);

// シーンに追加
scene.add(egg);

// ======= ライト（光）を追加 =======

// 環境光（全体をほんのり明るくする）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// ポイントライト（1点から放たれる強い光）
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// ======= アニメーション（回転） =======

let waitTime = 0;        // 待機時間用
let isShaking = false;   // 今震えてるかどうか
let shakeStart = 0;      // 震え始めた時間

function animate() {
  requestAnimationFrame(animate);

  if (!isShaking) {
    // 震えてないときは時間をカウント
    waitTime += 0.5;

    if (waitTime > 240) { // 120フレーム（約2秒）経ったら震える
      isShaking = true;
      shakeStart = 0;
      waitTime = 0;
    }
  } else {
    // 震えモード中
    shakeStart += 1;
    egg.position.x = Math.sin(shakeStart * 0.1) * 0.1;
    egg.position.y = Math.cos(shakeStart * 0.1) * 0.1;

    if (shakeStart > 20) { // 震えを20フレームくらいで終わらせる
      isShaking = false;
      egg.position.x = 0;
      egg.position.y = 0;
    }
  }

  renderer.render(scene, camera);
}

animate();

// ======= 画面サイズ変更にも対応 =======

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
