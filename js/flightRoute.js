// flightRoute.js - creates a curved flight route over the Earth, markers, and a simple plane that follows the path
import { latLonToVector3, calculateDistance } from './geography.js';

export function createFlightRoute(THREE, scene, camera, renderer, earthGroup, earthRadius, origin, destination, options = {}){
  const opts = Object.assign({
    points: 180,
    routeHeight: 0.08,
    color: 0x69e3a6,
    width: 2,
    labelClass: 'route-label'
  }, options);

  const group = new THREE.Group();
  group.name = 'flight-route-group';

  // convert to vectors on sphere surface
  const v0 = latLonToVector3(origin.latitude, origin.longitude, earthRadius);
  const v1 = latLonToVector3(destination.latitude, destination.longitude, earthRadius);

  // normalized directions for great-circle interpolation
  const n0 = v0.clone().normalize();
  const n1 = v1.clone().normalize();

  // axis of rotation
  const axis = new THREE.Vector3().copy(n0).cross(n1).normalize();
  const angle = Math.acos(Math.min(1, Math.max(-1, n0.dot(n1))));

  const pts = [];
  for(let i=0;i<=opts.points;i++){
    const t = i / opts.points;
    // slerp via axis-angle rotation
    const v = n0.clone();
    if(axis.lengthSq() > 0.000001){
      v.applyAxisAngle(axis, angle * t);
    } else {
      // nearly antipodal or same: lerp and normalize
      v.lerp(n1, t).normalize();
    }
    // elevate
    const elev = 1 + opts.routeHeight * Math.sin(Math.PI * t);
    v.multiplyScalar(earthRadius * elev);
    pts.push(v);
  }

  // build line geometry
  const positions = new Float32Array((opts.points+1) * 3);
  for(let i=0;i<pts.length;i++){
    positions[i*3] = pts[i].x;
    positions[i*3+1] = pts[i].y;
    positions[i*3+2] = pts[i].z;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setDrawRange(0, 0); // initially hidden

  const mat = new THREE.LineBasicMaterial({ color: opts.color, transparent: true, opacity: 0.95 });
  const line = new THREE.Line(geom, mat);
  line.name = 'flight-route-line';
  group.add(line);

  // markers
  const markerGeom = new THREE.SphereGeometry(earthRadius * 0.01, 12, 12);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffddaa, transparent: true, opacity: 1 });
  const originMarker = new THREE.Mesh(markerGeom, markerMat.clone());
  originMarker.position.copy(v0);
  group.add(originMarker);

  const destMarker = new THREE.Mesh(markerGeom, markerMat.clone());
  destMarker.position.copy(v1);
  group.add(destMarker);

  // simple pulsing scale animation value store
  let pulse = 0;

  // labels (DOM)
  const container = renderer.domElement.parentNode;
  const originLabel = document.createElement('div');
  originLabel.className = opts.labelClass;
  originLabel.style.position = 'absolute'; originLabel.style.pointerEvents = 'none';
  originLabel.innerHTML = `<strong>${origin.city}</strong><br><small>${origin.country}</small>`;
  container.appendChild(originLabel);

  const destLabel = document.createElement('div');
  destLabel.className = opts.labelClass;
  destLabel.style.position = 'absolute'; destLabel.style.pointerEvents = 'none';
  destLabel.innerHTML = `<strong>${destination.city}</strong><br><small>${destination.country}</small>`;
  container.appendChild(destLabel);

  // plane: simple geometry (cone + tail) grouped
  const planeGroup = new THREE.Group();
  const fus = new THREE.ConeGeometry(earthRadius*0.01, earthRadius*0.03, 6);
  const fusMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness:0.2, roughness:0.6 });
  const fusMesh = new THREE.Mesh(fus, fusMat);
  fusMesh.rotation.x = Math.PI/2;
  fusMesh.position.z = 0;
  planeGroup.add(fusMesh);
  planeGroup.visible = false;
  group.add(planeGroup);

  scene.add(group);

  // distance
  const km = calculateDistance(origin, destination);

  // animation state
  let progress = 0; // 0..1 along the path
  let animatingIn = true;
  let drawingIndex = 0;
  const totalPoints = pts.length;

  function update(delta){
    pulse += delta * 3;
    const scale = 1 + Math.sin(pulse)*0.06;
    originMarker.scale.set(scale,scale,scale);
    destMarker.scale.set(scale,scale,scale);

    // animate drawing the route progressively when animatingIn
    if(animatingIn){
      drawingIndex = Math.min(totalPoints, drawingIndex + Math.ceil(totalPoints * delta * 0.6));
      geom.setDrawRange(0, Math.max(2, drawingIndex));
      if(drawingIndex >= totalPoints){
        animatingIn = false;
        planeGroup.visible = true;
      }
    }

    // animate plane along path
    if(planeGroup.visible){
      progress += delta * 0.06; // speed
      if(progress > 1) progress = 1;
      // compute position by sampling pts
      const idx = Math.floor(progress * (pts.length-1));
      const pos = pts[idx];
      planeGroup.position.copy(pos);
      // orient by tangent
      const next = pts[Math.min(idx+2, pts.length-1)];
      const tangent = next.clone().sub(pos).normalize();
      // compute quaternion that points +Z (the cone's forward) to tangent
      const up = pos.clone().normalize();
      const m = new THREE.Matrix4();
      // create basis
      const z = tangent.clone().normalize();
      const x = new THREE.Vector3().crossVectors(up, z).normalize();
      const y = new THREE.Vector3().crossVectors(z, x).normalize();
      m.makeBasis(x, y, z);
      planeGroup.setRotationFromMatrix(m);
    }

    // update labels position
    updateLabelPosition(originLabel, originMarker.position, camera, renderer);
    updateLabelPosition(destLabel, destMarker.position, camera, renderer);
  }

  function updateLabelPosition(el, vec3, camera, renderer){
    const pos = vec3.clone();
    pos.project(camera);
    const x = (pos.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = ( - pos.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    el.style.opacity = pos.z > 1 || pos.z < -1 ? '0' : '1';
  }

  function dispose(){
    // cleanup
    if(originLabel && originLabel.parentNode) originLabel.parentNode.removeChild(originLabel);
    if(destLabel && destLabel.parentNode) destLabel.parentNode.removeChild(destLabel);
    scene.remove(group);
    geom.dispose();
    mat.dispose();
    markerGeom.dispose();
  }

  function showInfoCard(){
    // create small card overlay with distance info
    const container = renderer.domElement.parentNode;
    let card = container.querySelector('.route-info-card');
    if(card) return card;
    card = document.createElement('div');
    card.className = 'route-info-card';
    card.style.position = 'absolute';
    card.style.right = '18px';
    card.style.top = '18px';
    card.style.background = 'rgba(255,255,255,0.04)';
    card.style.color = 'var(--text)';
    card.style.padding = '12px 14px';
    card.style.borderRadius = '10px';
    card.style.backdropFilter = 'blur(6px)';
    card.innerHTML = `<div style="font-weight:700;">✈ Nuestra distancia</div>
      <div style="margin-top:8px;">${origin.city}, ${origin.country}<br>↓<br><strong>${Math.round(km)} km</strong><br>↓<br>${destination.city}, ${destination.country}</div>`;
    container.appendChild(card);
    return card;
  }

  return {
    group,
    update,
    dispose,
    showInfoCard
  };
}
