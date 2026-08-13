// space.js - init optimizations and UI toggle for route; device tier detection and lazy texture selection
import { createStars } from './stars.js';
import { locations, settings } from './config.js';

let renderer = null;
let scene = null;
let camera = null;
let starsObj = null;
let earthObj = null;
let canvasEl = null;
let animationId = null;
let lastTime = 0;
let flightRoute = null;
let THREE = null;
let btnToggle = null;

function isWebGLAvailable(){
  try{
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  }catch(e){ return false; }
}

function detectDeviceTier(){
  const hc = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4; // in GB
  const ua = navigator.userAgent || '';
  const isMobile = /Mobi|Android/i.test(ua);

  // heuristic scoring
  let score = 0;
  if(hc >= 8) score += 2; else if(hc >=4) score += 1;
  if(mem >= 8) score +=2; else if(mem >=4) score +=1;
  if(!isMobile) score +=1;

  if(score >=5) return 'high';
  if(score >=3) return 'medium';
  return 'low';
}

async function initThree(container){
  THREE = await import('/libs/three/three.module.js');

  // device quality
  const tier = detectDeviceTier();
  const dpr = window.devicePixelRatio || 1;
  let pixelRatio = Math.min(dpr, tier === 'high' ? 1.5 : (tier === 'medium' ? 1.2 : 0.9));

  scene = new THREE.Scene();

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 5000);
  camera.position.set(0, 0, 400);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding || THREE.LinearEncoding;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  container.appendChild(renderer.domElement);
  canvasEl = renderer.domElement;

  // ambient subtle light
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  // choose star count based on tier
  let starCount = (tier === 'high') ? 900 : ((tier === 'medium') ? 600 : 200);
  starsObj = createStars(THREE, { count: starCount, radius: 1600, innerRadius: 300, size: tier === 'low' ? 1.0 : 1.6 });
  scene.add(starsObj.points);

  // attempt to create Earth and pass texture path; createEarth async handles choosing small textures when available
  try{
    const earthMod = await import('./earth.js');
    earthObj = await earthMod.createEarth(THREE, { radius: 100, rotationSpeed: settings.earthRotationSpeed, texturePath: '/assets/textures/earth/' });
    scene.add(earthObj.group);
    earthObj.group.position.set(0, -10, 0);
  }catch(err){
    console.warn('Earth module failed to load or init', err);
  }

  // add interaction: click on earth toggles route
  canvasEl.addEventListener('pointerdown', onPointerDown);

  // add toggle button for accessibility and mobile
  addRouteToggleButton(container);

  window.addEventListener('resize', onResize);

  lastTime = performance.now();
  animate();
}

function addRouteToggleButton(container){
  if(btnToggle) return;
  btnToggle = document.createElement('button');
  btnToggle.id = 'btn-toggle-route';
  btnToggle.textContent = 'Mostrar ruta';
  btnToggle.setAttribute('aria-label','Mostrar ruta entre origen y destino');
  btnToggle.addEventListener('click', ()=>{
    toggleRoute();
  });
  btnToggle.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRoute(); } });
  container.appendChild(btnToggle);
}

function removeRouteToggleButton(){
  if(btnToggle && btnToggle.parentNode) btnToggle.parentNode.removeChild(btnToggle);
  btnToggle = null;
}

function toggleRoute(){
  if(flightRoute){
    flightRoute.dispose && flightRoute.dispose();
    const card = renderer.domElement.parentNode.querySelector('.route-info-card');
    if(card) card.remove();
    flightRoute = null;
    if(btnToggle) btnToggle.textContent = 'Mostrar ruta';
    return;
  }
  if(!earthObj || !renderer || !camera || !THREE) return;
  import('./flightRoute.js').then(mod =>{
    flightRoute = mod.createFlightRoute(THREE, scene, camera, renderer, earthObj.group, earthObj.radius, locations.origin, locations.destination, { routeHeight: settings.routeHeight });
    const card = flightRoute.showInfoCard();
    if(btnToggle) btnToggle.textContent = 'Ocultar ruta';
  }).catch(err=>console.warn('Failed to create flight route', err));
}

function onPointerDown(e){
  if(!earthObj || !renderer || !camera || !THREE) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = {
    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
    y: -((e.clientY - rect.top) / rect.height) * 2 + 1
  };
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(earthObj.earthMesh, true);
  if(intersects && intersects.length > 0){
    // toggle route via pointer
    toggleRoute();
  }
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
    earthObj.update(delta, camera);
  }

  if(flightRoute && typeof flightRoute.update === 'function'){
    flightRoute.update(delta);
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
  if(flightRoute){
    flightRoute.dispose();
    flightRoute = null;
  }
  removeRouteToggleButton();
  if(renderer){
    renderer.forceContextLoss && renderer.forceContextLoss();
    if(renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    renderer.dispose();
    renderer = null;
  }
  scene = null; camera = null; canvasEl = null; THREE = null;
}

function initFallback(container){
  // improved fallback: show minimal route info overlay and simple canvas stars
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

  // add a small accessible button to show route info (non-3D)
  const infoBtn = document.createElement('button');
  infoBtn.id = 'btn-toggle-route';
  infoBtn.textContent = 'Mostrar ruta';
  infoBtn.style.position = 'absolute'; infoBtn.style.right = '18px'; infoBtn.style.bottom = '18px';
  infoBtn.addEventListener('click', ()=>{
    alert('Esta es una versión simplificada sin WebGL. La distancia aproximada es: ' + Math.round( (function(){
      // compute haversine quickly
      function toRad(v){ return v * Math.PI/180; }
      const o = locations.origin; const d = locations.destination;
      const R = 6371; const dLat = toRad(d.latitude - o.latitude); const dLon = toRad(d.longitude - o.longitude);
      const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(o.latitude))*Math.cos(toRad(d.latitude))*Math.sin(dLon/2)*Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R*c;
    })()) + ' km');
  });
  container.appendChild(infoBtn);
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
