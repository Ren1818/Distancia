// stars.js - create and manage an efficient Points-based starfield for Three.js
export function createStars(THREE, options = {}){
  const {
    count = 600,
    radius = 600,
    innerRadius = 80,
    size = 1.2,
    color = 0xffffff
  } = options;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for(let i=0;i<count;i++){
    // spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = innerRadius + Math.random() * (radius - innerRadius);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i*3] = x;
    positions[i*3+1] = y;
    positions[i*3+2] = z;

    sizes[i] = size * (0.6 + Math.random()*1.6);

    const brightness = 0.6 + Math.random()*0.4;
    colors[i*3] = brightness;
    colors[i*3+1] = brightness;
    colors[i*3+2] = brightness;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Points material - use vertex colors
  const material = new THREE.PointsMaterial({
    size: size,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);

  // animate small twinkle by modifying sizes buffer
  const sizesArray = geometry.attributes.aSize.array;
  const twinklePhase = new Float32Array(count);
  for(let i=0;i<count;i++) twinklePhase[i] = Math.random()*Math.PI*2;

  function update(delta){
    for(let i=0;i<count;i++){
      const v = 0.8 + Math.sin(twinklePhase[i] + delta*1.2) * 0.2;
      sizesArray[i] = sizesArray[i] * 0.98 + (v * (sizesArray[i]*0 + 1));
    }
    geometry.attributes.aSize.needsUpdate = true;
    // feed size into material.size as average for now (Three PointsMaterial doesn't read aSize by default)
  }

  function dispose(){
    geometry.dispose();
    material.dispose();
  }

  return { points, update, dispose };
}
