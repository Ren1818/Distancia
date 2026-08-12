// Updated space.js - integrate Earth creation into the Three.js scene
import { createStars } from './stars.js';

let renderer = null;
let scene = null;
let camera = null;
let starsObj = null;
let earthObj = null;
let canvasEl = null;
let animationId = null;
let lastTime = 0;

function isWebGLAvailable(){
  try{
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  }catch(e){ return false; }
}

async function initThree(container){
  // dynamic import of local three module
  const THREE = await import('/libs/three/three.module.js');

  scene = new THREE.Scene();

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 5000);
  camera.position.set(0, 0, 400);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding || THREE.LinearEncoding;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  container.appendChild(renderer.domElement);
  canvasEl = renderer.domElement;

  // ambient subtle light
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  // create stars
  const concurrency = navigator.hardwareConcurrency || 4;
  let starCount = 900;
  if(concurrency <= 2) starCount = 300;
  else if(concurrency <= 4) starCount = 600;

  starsObj = createStars(THREE, { count: starCount, radius: 1600, innerRadius: 300, size: 1.6 });
  scene.add(starsObj.points);

  // attempt to create Earth
  try{
    const earthMod = await import('./earth.js');
    earthObj = earthMod.createEarth(THREE, { radius: 100, rotationSpeed: 0.02 });
    scene.add(earthObj.group);
    // position earth slightly off center for cinematic composition
    earthObj.group.position.set(0, -10, 0);
  }catch(err){
    console.warn('Earth module failed to load or init', err);
  }

  window.addEventListener('resize', onResize);

  lastTime = performance.now();
  animate();
}

function onResize(){
  if(!renderer || !camera) return;
  const parent = renderer.domElement.parentNode;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h);
}

function animate(now){
  animationId = requestAnimationFrame(animate);
  const delta = (now - lastTime) * 0.001; // seconds
  lastTime = now;

  if(starsObj && typeof starsObj.update === 'function'){
    starsObj.update(now * 0.001);
    starsObj.points.rotation.y += 0.0006;
  }

  if(earthObj && typeof earthObj.update === 'function'){
    earthObj.update(delta);
  }

  if(renderer && scene && camera) renderer.render(scene, camera);
}

function destroyThree(){
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
  if(earthObj){
    if(earthObj.group && earthObj.group.parent) earthObj.group.parent.remove(earthObj.group);
    earthObj.dispose();
    earthObj = null;
  }
  if(starsObj){
    if(starsObj.points.parent) starsObj.points.parent.remove(starsObj.points);
    starsObj.dispose();
    starsObj = null;
  }
  if(renderer){
    renderer.forceContextLoss && renderer.forceContextLoss();
    if(renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    renderer.dispose();
    renderer = null;
  }
  scene = null; camera = null; canvasEl = null;
}

function initFallback(container){
  // simple CSS/Canvas fallback: add a background and a 2D canvas with stars drawn
  container.innerHTML = '';
  const bg = document.createElement('div');
  bg.style.position = 'absolute'; bg.style.inset = '0'; bg.style.background = 'radial-gradient(circle at 20% 20%, rgba(20,30,60,0.2), transparent), #000010';
  container.appendChild(bg);

  const cv = document.createElement('canvas');
  cv.width = container.clientWidth; cv.height = container.clientHeight; cv.style.width = '100%'; cv.style.height = '100%';
  container.appendChild(cv);
  const ctx = cv.getContext('2d');

  const stars = [];
  const count = 200;
  for(let i=0;i<count;i++){
    stars.push({ x: Math.random()*cv.width, y: Math.random()*cv.height, r: Math.random()*1.6+0.2, a: Math.random() });
  }

  function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.fillStyle = '#ffffff22';
    for(const s of stars){
      ctx.beginPath(); ctx.globalAlpha = 0.7 + Math.sin(Date.now()*0.001 + s.a)*0.3; ctx.fillStyle = '#fff'; ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// Listen for entering space
window.addEventListener('app:enteredSpace', async (e)=>{
  // choose container created by loveQuestion transition
  const container = document.getElementById('space-container');
  if(!container) return;
  container.innerHTML = ''; container.style.position = 'relative'; container.style.overflow = 'hidden';

  if(isWebGLAvailable()){
    try{
      await initThree(container);
    }catch(err){
      console.warn('Three init failed, falling back', err);
      initFallback(container);
    }
  } else {
    initFallback(container);
  }
});

// expose cleanup if needed
export function destroySpace(){ destroyThree(); }
