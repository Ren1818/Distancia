// earth.js - creates a real 3D Earth with textures and a subtle atmosphere (shader)
export function createEarth(THREE, options = {}){
  const opts = Object.assign({
    radius: 100,
    widthSegments: 64,
    heightSegments: 64,
    rotationSpeed: 0.02,
    texturePath: '/assets/textures/earth/'
  }, options);

  const group = new THREE.Group();

  const loader = new THREE.TextureLoader();
  const colorMap = loader.load(opts.texturePath + 'earth_color.jpg');
  const normalMap = loader.load(opts.texturePath + 'earth_normal.jpg');
  const roughnessMap = loader.load(opts.texturePath + 'earth_roughness.jpg');
  const nightMap = loader.load(opts.texturePath + 'earth_night.jpg');

  // main earth material
  const earthMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap: normalMap || null,
    roughnessMap: roughnessMap || null,
    roughness: 1.0,
    metalness: 0.0,
    emissiveMap: nightMap || null,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.3
  });

  const geom = new THREE.SphereGeometry(opts.radius, opts.widthSegments, opts.heightSegments);
  const earthMesh = new THREE.Mesh(geom, earthMat);
  earthMesh.name = 'earth-main';
  group.add(earthMesh);

  // atmosphere - slightly larger sphere with additive shader/fresnel
  const atmosphereGeom = new THREE.SphereGeometry(opts.radius * 1.02, 32, 32);

  const atmosphereMat = new THREE.ShaderMaterial({
    uniforms: {
      'c': { value: 0.5 },
      'p': { value: 2.0 },
      glowColor: { value: new THREE.Color(0x6ea6ff) },
      viewVector: { value: new THREE.Vector3(0,0,1) }
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float intensity;
      void main(){
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormView = normalize(normalMatrix * (viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz));
        intensity = pow( max(0.0, dot(vNormal, vNormView)), 1.5 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main(){
        vec3 col = glowColor * intensity * 0.9;
        gl_FragColor = vec4(col, intensity * 0.6);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
  atmosphereMesh.name = 'earth-atmosphere';
  group.add(atmosphereMesh);

  // optional tilt
  earthMesh.rotation.z = THREE.MathUtils.degToRad(0);

  // public update
  function update(delta){
    // earth rotation
    earthMesh.rotation.y += delta * opts.rotationSpeed;
    // slowly rotate atmosphere differently for depth
    atmosphereMesh.rotation.y += delta * (opts.rotationSpeed * 0.96);

    // update shader view vector (camera must set this from outside if needed)
  }

  function dispose(){
    geom.dispose();
    earthMat.map && earthMat.map.dispose();
    earthMat.normalMap && earthMat.normalMap.dispose();
    earthMat.roughnessMap && earthMat.roughnessMap.dispose();
    earthMat.emissiveMap && earthMat.emissiveMap.dispose();
    earthMat.dispose();
    atmosphereGeom.dispose();
    atmosphereMat.dispose();
  }

  return { group, earthMesh, atmosphereMesh, update, dispose, radius: opts.radius };
}
