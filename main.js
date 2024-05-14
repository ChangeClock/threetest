import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import glburl from '/asset/scene.glb?url';

var planeMeshLayer = new THREE.Layers();
planeMeshLayer.enable(1);
planeMeshLayer.disable(0);
//scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcccccc, 60, 80);
//camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(0, 4, 0)
camera.layers.enable(1);
scene.add(camera)


// Light
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
scene.add(ambientLight);
const pointLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(pointLight);
/*axes
var axes = new THREE.AxesHelper(40,20);
scene.add(axes);*/
//canvas render
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({
	alpha: true,
	antialias: true,
	canvas: canvas
});
renderer.setSize(window.innerWidth, window.innerHeight)
//controller
const controls = new OrbitControls(camera, renderer.domElement);
var isclickDisable = true;
controls.update();
//loader
const gltfLoader = new GLTFLoader();

//raycast
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//animator renderer
function animator() {
	requestAnimationFrame(animator);
	renderer.render(scene, camera);
}

//加入一圈画面
function adddrawings() {
	const radius = 10; // 圈的半径
	const numPlanes = 1; // 平面的数量，这将决定圈的精细度
	const planeWidth = 2; // 平面的宽度
	const planeHeight = 2; // 平面的高度
	const planeSegment = Math.PI * 2 / numPlanes; // 每个平面之间的角度

	// 创建材质
	const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
	const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
	for (let i = 0; i < numPlanes; i++) {
		// 计算平面的位置
		const theta = i * planeSegment;
		const x = radius * Math.cos(theta);
		const y = 4;
		const z = radius * Math.sin(theta);

		// 创建平面网格并设置位置
		const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

		planeMesh.position.set(x, y, z);

		// 旋转平面，使其面向原点
		planeMesh.lookAt(new THREE.Vector3(0, 4, 0));
		planeMesh.layers = planeMeshLayer;
		// 将平面添加到场景中
		scene.add(planeMesh);
	}
}

//显示物件信息
function showObjectInfo(object) {
	alert('大作: ' + object.name + '\n介绍: 这是一幅画，画面优美，技术力很高' + object.layers.mask);
}

//模型导入
gltfLoader.load(glburl, function (gltf) {
	scene.add(gltf.scene);
})

//选取交互
function select() {
	raycaster.setFromCamera(mouse, camera);
	raycaster.layers = planeMeshLayer;
	renderer.domElement, addEventListener('dblclick', e => {
		e.preventDefault(); // 阻止默认行为
		e.stopPropagation(); // 阻止事件冒泡
		//鼠标位置标准化为设备位置
		mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

		//更新射线
		raycaster.setFromCamera(mouse, camera);
		//计算交集
		const intersects = raycaster.intersectObjects(scene.children);

		if (intersects.length > 0) {
			// 获取第一个相交的物体
			const intersectedObject = intersects[0].object;
			// 改变物体的颜色
			if (intersectedObject.layers.test(planeMeshLayer)) {
				var tempcolor = intersectedObject.material.color;
				intersectedObject.material.color.set(0xff0000); // 设置为红色
				showObjectInfo(intersectedObject);
				intersectedObject.material.color = tempcolor
			}
			else (console.log(intersectedObject.name))
		}
	}, false)
}
select();
adddrawings();
animator();