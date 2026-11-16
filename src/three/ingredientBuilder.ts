import * as THREE from 'three';
import { IngredientSpec, ORBIT_INGREDIENTS } from '../data/ebookContent';
import {
  createAlmondTextures,
  createAvocadoTextures,
  createCheeseTextures,
  createChickenTextures,
  createCucumberTextures,
  createFloretBumpTexture,
  createGarlicTextures,
  createLeafTextures,
  createLemonTextures,
  createSalmonTextures,
} from './proceduralTextures';

export interface OrbitingIngredientNode {
  spec: IngredientSpec;
  pivot: THREE.Group;
  model: THREE.Group;
  hitProxy: THREE.Mesh;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  orbitTiltX: number;
  verticalAmp: number;
}

export interface IngredientField {
  group: THREE.Group;
  nodes: OrbitingIngredientNode[];
  hitProxies: THREE.Mesh[];
  dispose: () => void;
}

function attachCollider(
  parent: THREE.Group,
  id: IngredientSpec['id'],
  radius: number,
  disposables: { dispose: () => void }[],
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 10, 10);
  const mat = new THREE.MeshBasicMaterial({ visible: false });
  const proxy = new THREE.Mesh(geo, mat);
  proxy.layers.set(1);
  proxy.userData.ingredientId = id;
  parent.add(proxy);
  disposables.push(geo, mat);
  return proxy;
}

function buildAvocado(
  maxAnisotropy: number,
  disposables: { dispose: () => void }[],
): THREE.Group {
  const g = new THREE.Group();
  const { skinMap, skinBump, fleshMap, pitMap } = createAvocadoTextures(maxAnisotropy);
  disposables.push(skinMap, skinBump, fleshMap, pitMap);

  const skinPoints = [
    new THREE.Vector2(0.01, -0.4),
    new THREE.Vector2(0.24, -0.36),
    new THREE.Vector2(0.34, -0.1),
    new THREE.Vector2(0.27, 0.17),
    new THREE.Vector2(0.15, 0.38),
    new THREE.Vector2(0.01, 0.46),
  ];
  const skinGeo = new THREE.LatheGeometry(skinPoints, 32, 0, Math.PI);
  skinGeo.scale(1, 1, 0.92);
  const skinMat = new THREE.MeshStandardMaterial({
    map: skinMap,
    bumpMap: skinBump,
    bumpScale: 0.032,
    roughness: 0.72,
  });
  const skinMesh = new THREE.Mesh(skinGeo, skinMat);
  g.add(skinMesh);

  // Sculpted pear-shaped avocado cut face
  const pearShape = new THREE.Shape();
  pearShape.moveTo(0, -0.38);
  pearShape.bezierCurveTo(0.28, -0.38, 0.34, -0.12, 0.25, 0.14);
  pearShape.bezierCurveTo(0.18, 0.34, 0.08, 0.44, 0, 0.44);
  pearShape.bezierCurveTo(-0.08, 0.44, -0.18, 0.34, -0.25, 0.14);
  pearShape.bezierCurveTo(-0.34, -0.12, -0.28, -0.38, 0, -0.38);

  const fleshGeo = new THREE.ExtrudeGeometry(pearShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  // Normalize planar UVs so radial flesh gradient fits the pear cleanly
  const posAttr = fleshGeo.attributes.position;
  const uvArr = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const py = posAttr.getY(i);
    uvArr[i * 2] = (px + 0.36) / 0.72;
    uvArr[i * 2 + 1] = (py + 0.42) / 0.88;
  }
  fleshGeo.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

  const fleshMat = new THREE.MeshPhysicalMaterial({
    map: fleshMap,
    roughness: 0.36,
    clearcoat: 0.38,
    clearcoatRoughness: 0.24,
  });
  const fleshMesh = new THREE.Mesh(fleshGeo, fleshMat);
  fleshMesh.position.z = -0.02;
  g.add(fleshMesh);

  // Realistic glistening mahogany pit
  const pitGeo = new THREE.SphereGeometry(0.145, 28, 28);
  pitGeo.scale(0.95, 1.08, 0.82);
  const pitMat = new THREE.MeshPhysicalMaterial({
    map: pitMap,
    roughness: 0.24,
    clearcoat: 0.48,
    clearcoatRoughness: 0.18,
  });
  const pitMesh = new THREE.Mesh(pitGeo, pitMat);
  pitMesh.position.set(0, -0.11, 0.055);
  g.add(pitMesh);

  disposables.push(skinGeo, skinMat, fleshGeo, fleshMat, pitGeo, pitMat);
  return g;
}

function buildSalmon(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { map: salmonTex, bumpMap: salmonBump } = createSalmonTextures(maxAnisotropy);
  disposables.push(salmonTex, salmonBump);

  const shape = new THREE.Shape();
  shape.moveTo(-0.44, -0.16);
  shape.quadraticCurveTo(0, -0.23, 0.46, -0.1);
  shape.quadraticCurveTo(0.48, 0.11, 0.34, 0.22);
  shape.quadraticCurveTo(0, 0.26, -0.42, 0.15);
  shape.closePath();

  const filletGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.17,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.035,
    bevelSegments: 4,
  });
  filletGeo.center();

  const fleshMat = new THREE.MeshPhysicalMaterial({
    map: salmonTex,
    bumpMap: salmonBump,
    bumpScale: 0.018,
    roughness: 0.26,
    clearcoat: 0.72,
    clearcoatRoughness: 0.12,
  });
  g.add(new THREE.Mesh(filletGeo, fleshMat));

  // Crisp silvery speckled skin underside
  const skinShape = new THREE.Shape();
  skinShape.moveTo(-0.42, -0.14);
  skinShape.quadraticCurveTo(0, -0.2, 0.43, -0.08);
  skinShape.quadraticCurveTo(0.43, 0.09, 0.32, 0.18);
  skinShape.quadraticCurveTo(0, 0.22, -0.4, 0.12);
  skinShape.closePath();
  const skinGeo = new THREE.ExtrudeGeometry(skinShape, { depth: 0.03, bevelEnabled: false });
  skinGeo.center();
  skinGeo.rotateX(Math.PI / 2);

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.48,
  });
  const skinMesh = new THREE.Mesh(skinGeo, skinMat);
  skinMesh.position.y = -0.12;
  g.add(skinMesh);

  // Fresh 3D rosemary sprig with delicate angled needles
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.13, 0.03),
    new THREE.Vector3(0.0, 0.16, 0.0),
    new THREE.Vector3(0.22, 0.14, -0.02),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 12, 0.012, 6, false);
  const herbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
  g.add(new THREE.Mesh(stemGeo, herbMat));

  const needleGeo = new THREE.ConeGeometry(0.014, 0.1, 6);
  for (let i = 0; i < 8; i++) {
    const t = 0.15 + (i / 7) * 0.75;
    const p = stemCurve.getPoint(t);
    const nL = new THREE.Mesh(needleGeo, herbMat);
    nL.position.set(p.x, p.y + 0.01, p.z + 0.03);
    nL.rotation.set(0.9, 0.2, -0.4);
    const nR = new THREE.Mesh(needleGeo, herbMat);
    nR.position.set(p.x, p.y + 0.01, p.z - 0.03);
    nR.rotation.set(-0.9, -0.2, -0.4);
    g.add(nL, nR);
  }

  disposables.push(filletGeo, fleshMat, skinGeo, skinMat, stemGeo, needleGeo, herbMat);
  return g;
}

function buildBroccoli(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const budBump = createFloretBumpTexture(maxAnisotropy);
  disposables.push(budBump);

  const stalkMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.52 });
  const crownMats = [
    new THREE.MeshPhysicalMaterial({
      color: 0x14532d,
      bumpMap: budBump,
      bumpScale: 0.045,
      roughness: 0.82,
      sheen: 0.45,
      sheenColor: new THREE.Color(0x4ade80),
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x166534,
      bumpMap: budBump,
      bumpScale: 0.045,
      roughness: 0.8,
      sheen: 0.4,
      sheenColor: new THREE.Color(0x4ade80),
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x15803d,
      bumpMap: budBump,
      bumpScale: 0.045,
      roughness: 0.78,
      sheen: 0.4,
      sheenColor: new THREE.Color(0x86efac),
    }),
  ];

  const mainStalkGeo = new THREE.CylinderGeometry(0.085, 0.13, 0.34, 16);
  const mainStalk = new THREE.Mesh(mainStalkGeo, stalkMat);
  mainStalk.position.y = -0.18;
  g.add(mainStalk);

  // Branching stems leading to clusters
  const branchGeo = new THREE.CylinderGeometry(0.035, 0.06, 0.22, 10);
  const branchAngles: [number, number, number][] = [
    [-0.14, 0.02, 0.42],
    [0.14, 0.04, -0.38],
    [0.02, -0.14, -0.35],
    [-0.04, 0.13, 0.35],
  ];
  branchAngles.forEach(([ox, oz, tilt]) => {
    const b = new THREE.Mesh(branchGeo, stalkMat);
    b.position.set(ox * 0.7, -0.01, oz * 0.7);
    b.rotation.set(oz * 2.2, 0, tilt);
    g.add(b);
  });

  // 24 dense spherical organic floret clusters (replacing flat low-poly icosahedrons)
  const floretGeo = new THREE.SphereGeometry(0.095, 16, 14);
  const clusterSeeds: [number, number, number, number][] = [
    [0, 0.22, 0, 1.3],
    [-0.1, 0.2, 0.08, 1.08],
    [0.11, 0.21, 0.06, 1.05],
    [0.02, 0.24, -0.1, 1.02],
    [-0.2, 0.12, 0.08, 1.0],
    [0.2, 0.13, 0.05, 1.0],
    [0.05, 0.11, -0.2, 0.96],
    [-0.06, 0.13, 0.2, 0.96],
    [-0.16, 0.19, -0.09, 0.9],
    [0.16, 0.18, -0.1, 0.88],
    [-0.24, 0.06, -0.03, 0.82],
    [0.24, 0.07, -0.04, 0.84],
    [0.14, 0.09, 0.17, 0.85],
    [-0.13, 0.08, 0.18, 0.82],
    [-0.04, 0.28, 0.03, 0.86],
    [0.06, 0.27, -0.02, 0.84],
    [0, 0.08, 0.22, 0.78],
    [0, 0.07, -0.22, 0.78],
  ];
  clusterSeeds.forEach(([x, y, z, s], i) => {
    const f = new THREE.Mesh(floretGeo, crownMats[i % crownMats.length]);
    f.position.set(x, y, z);
    f.scale.set(s * 1.08, s * 0.88, s * 1.08);
    g.add(f);
  });

  disposables.push(stalkMat, ...crownMats, mainStalkGeo, branchGeo, floretGeo);
  return g;
}

function buildEgg(disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();

  // Two sculpted halved soft-boiled eggs with realistic albumen rims & jammy golden yolks
  const whiteMat = new THREE.MeshPhysicalMaterial({
    color: 0xfefce8,
    roughness: 0.22,
    clearcoat: 0.58,
    clearcoatRoughness: 0.16,
  });
  const yolkMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.18,
    clearcoat: 0.82,
    clearcoatRoughness: 0.1,
    emissive: 0x78350f,
    emissiveIntensity: 0.15,
  });
  const pepperMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.8 });

  const halfShellGeo = new THREE.SphereGeometry(0.24, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.5);
  halfShellGeo.scale(0.86, 0.7, 1.15);

  const flatWhiteGeo = new THREE.CircleGeometry(0.238, 28);
  flatWhiteGeo.scale(0.86, 1.15, 1);

  const yolkGeo = new THREE.SphereGeometry(0.115, 22, 16);
  yolkGeo.scale(1, 1, 0.55);

  const pepperGeo = new THREE.BoxGeometry(0.015, 0.015, 0.015);

  const buildHalf = (ox: number, oy: number, oz: number, ry: number, rz: number) => {
    const half = new THREE.Group();
    const dome = new THREE.Mesh(halfShellGeo, whiteMat);
    dome.rotation.x = -Math.PI / 2;
    half.add(dome);

    const face = new THREE.Mesh(flatWhiteGeo, whiteMat);
    half.add(face);

    const yolk = new THREE.Mesh(yolkGeo, yolkMat);
    yolk.position.set(0, -0.03, 0.02);
    half.add(yolk);

    [
      [-0.03, -0.01, 0.075],
      [0.035, -0.04, 0.072],
      [0.01, 0.02, 0.068],
    ].forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(pepperGeo, pepperMat);
      p.position.set(px, py, pz);
      half.add(p);
    });

    half.position.set(ox, oy, oz);
    half.rotation.set(-0.2, ry, rz);
    g.add(half);
  };

  buildHalf(-0.15, 0.04, 0.05, 0.25, 0.2);
  buildHalf(0.16, -0.06, -0.05, -0.3, -0.25);

  disposables.push(halfShellGeo, flatWhiteGeo, yolkGeo, pepperGeo, whiteMat, yolkMat, pepperMat);
  return g;
}

function buildOliveOil(isSoftwareGl: boolean, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const profile = [
    new THREE.Vector2(0.01, -0.46),
    new THREE.Vector2(0.22, -0.46),
    new THREE.Vector2(0.245, -0.38),
    new THREE.Vector2(0.235, 0.06),
    new THREE.Vector2(0.11, 0.24),
    new THREE.Vector2(0.08, 0.44),
    new THREE.Vector2(0.1, 0.47),
  ];
  const bottleGeo = new THREE.LatheGeometry(profile, 32);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xa7f3d0,
    roughness: 0.06,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transmission: isSoftwareGl ? 0 : 0.78,
    transparent: true,
    opacity: isSoftwareGl ? 0.52 : 0.94,
    ior: 1.52,
    thickness: 0.45,
    depthWrite: false,
  });
  const bottleMesh = new THREE.Mesh(bottleGeo, glassMat);
  bottleMesh.renderOrder = 2;
  g.add(bottleMesh);

  const oilGeo = new THREE.CylinderGeometry(0.195, 0.2, 0.44, 24);
  const oilMat = new THREE.MeshPhysicalMaterial({
    color: 0xeab308,
    roughness: 0.12,
    clearcoat: 0.85,
    emissive: 0x854d0e,
    emissiveIntensity: 0.22,
  });
  const oilMesh = new THREE.Mesh(oilGeo, oilMat);
  oilMesh.position.y = -0.19;
  g.add(oilMesh);

  // Parchment bottle band label
  const labelGeo = new THREE.CylinderGeometry(0.242, 0.244, 0.2, 28, 1, true);
  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xf5efe2,
    roughness: 0.82,
    side: THREE.DoubleSide,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = -0.14;
  g.add(labelMesh);

  const collarGeo = new THREE.CylinderGeometry(0.085, 0.095, 0.09, 20);
  const collarMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.55 });
  const collarMesh = new THREE.Mesh(collarGeo, collarMat);
  collarMesh.position.y = 0.48;
  g.add(collarMesh);

  const spoutGeo = new THREE.CylinderGeometry(0.026, 0.065, 0.16, 20);
  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6bf47,
    roughness: 0.18,
    metalness: 0.94,
    anisotropy: 0.8,
  });
  const spoutMesh = new THREE.Mesh(spoutGeo, brassMat);
  spoutMesh.position.y = 0.56;
  g.add(spoutMesh);

  disposables.push(
    bottleGeo,
    glassMat,
    oilGeo,
    oilMat,
    labelGeo,
    labelMat,
    collarGeo,
    collarMat,
    spoutGeo,
    brassMat,
  );
  return g;
}

function buildLemon(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { sliceMap, sliceBump, rindBump } = createLemonTextures(maxAnisotropy);
  disposables.push(sliceMap, sliceBump, rindBump);

  // Sculpted lemon dome half with citrus nipple profile
  const lemonProfile = [
    new THREE.Vector2(0.005, -0.34),
    new THREE.Vector2(0.075, -0.3),
    new THREE.Vector2(0.22, -0.22),
    new THREE.Vector2(0.31, -0.06),
    new THREE.Vector2(0.32, 0.02),
  ];
  const rindGeo = new THREE.LatheGeometry(lemonProfile, 28);
  const rindMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    bumpMap: rindBump,
    bumpScale: 0.025,
    roughness: 0.46,
  });
  g.add(new THREE.Mesh(rindGeo, rindMat));

  const faceGeo = new THREE.CircleGeometry(0.318, 32);
  const faceMat = new THREE.MeshPhysicalMaterial({
    map: sliceMap,
    bumpMap: sliceBump,
    bumpScale: 0.015,
    roughness: 0.2,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
  });
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.rotation.x = -Math.PI / 2;
  faceMesh.position.y = 0.02;
  g.add(faceMesh);

  // Angled thick fresh citrus wheel slice leaning against the half
  const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.055, 28);
  const wheelMesh = new THREE.Mesh(wheelGeo, [rindMat, faceMat, faceMat]);
  wheelMesh.position.set(0.18, 0.06, 0.18);
  wheelMesh.rotation.set(0.95, 0.25, -0.45);
  g.add(wheelMesh);

  disposables.push(rindGeo, rindMat, faceGeo, faceMat, wheelGeo);
  return g;
}

function buildAlmonds(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { map, bumpMap } = createAlmondTextures(maxAnisotropy);
  disposables.push(map, bumpMap);

  const nutMat = new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.032,
    roughness: 0.56,
  });

  // Sculpted asymmetric almond teardrop lathe
  const profile = [
    new THREE.Vector2(0.004, -0.17),
    new THREE.Vector2(0.085, -0.13),
    new THREE.Vector2(0.115, -0.03),
    new THREE.Vector2(0.09, 0.09),
    new THREE.Vector2(0.045, 0.18),
    new THREE.Vector2(0.004, 0.22),
  ];
  const nutGeo = new THREE.LatheGeometry(profile, 22);
  nutGeo.scale(1.0, 1.0, 0.62);

  const offsets: [number, number, number, number, number, number][] = [
    [-0.17, 0.02, 0.06, 0.35, 0.2, 0.45],
    [0.16, -0.05, 0.08, -0.45, -0.3, -0.35],
    [0.01, 0.17, -0.09, 0.25, 0.5, 0.9],
    [-0.04, -0.16, -0.05, 0.55, -0.4, -0.75],
    [0.13, 0.11, 0.05, -0.2, 0.65, -0.2],
  ];
  offsets.forEach(([x, y, z, rx, ry, rz]) => {
    const nut = new THREE.Mesh(nutGeo, nutMat);
    nut.position.set(x, y, z);
    nut.rotation.set(rx, ry, rz);
    g.add(nut);
  });

  disposables.push(nutGeo, nutMat);
  return g;
}

function buildGreens(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { map, bumpMap } = createLeafTextures(maxAnisotropy);
  disposables.push(map, bumpMap);

  // Curved organic spinach leaf surface (no flat geometric cutouts)
  const leafGeo = new THREE.PlaneGeometry(0.36, 0.5, 10, 14);
  const pos = leafGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const v = (y + 0.25) / 0.5; // 0 base -> 1 tip
    // Taper width organically into rounded spinach silhouette
    const widthEnvelope = Math.sin(Math.pow(v, 0.72) * Math.PI);
    const cuppedX = x * (0.22 + 0.95 * widthEnvelope);
    // Natural leaf arch + cupped cross section
    const curlZ = Math.sin(v * Math.PI) * 0.07 + (cuppedX * cuppedX) * 0.75;
    pos.setX(i, cuppedX);
    pos.setZ(i, curlZ);
  }
  leafGeo.computeVertexNormals();

  const leafMat = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap,
    bumpScale: 0.018,
    roughness: 0.38,
    clearcoat: 0.32,
    clearcoatRoughness: 0.25,
    side: THREE.DoubleSide,
  });

  const configs: [number, number, number, number, number, number, number][] = [
    [0, 0.02, 0.04, 0.25, 0.0, 0.1, 1.05],
    [-0.17, 0.05, 0.08, 0.1, 0.55, 0.5, 0.92],
    [0.17, -0.02, 0.02, 0.3, -0.5, -0.48, 0.95],
    [-0.06, -0.1, -0.08, -0.15, 0.25, 0.95, 0.85],
    [0.08, 0.14, -0.06, 0.4, -0.2, -0.75, 0.82],
  ];
  configs.forEach(([x, y, z, rx, ry, rz, s]) => {
    const m = new THREE.Mesh(leafGeo, leafMat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.scale.setScalar(s);
    g.add(m);
  });

  disposables.push(leafGeo, leafMat);
  return g;
}

function buildChicken(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { map, bumpMap } = createChickenTextures(maxAnisotropy);
  disposables.push(map, bumpMap);

  const shape = new THREE.Shape();
  shape.moveTo(-0.36, -0.08);
  shape.bezierCurveTo(-0.22, -0.22, 0.18, -0.2, 0.36, -0.04);
  shape.bezierCurveTo(0.42, 0.08, 0.28, 0.22, 0.02, 0.2);
  shape.bezierCurveTo(-0.24, 0.18, -0.4, 0.06, -0.36, -0.08);

  const breastGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.11,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.05,
    bevelSegments: 4,
  });
  breastGeo.center();

  const chickenMat = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap,
    bumpScale: 0.024,
    roughness: 0.38,
    clearcoat: 0.44,
    clearcoatRoughness: 0.22,
  });

  const cutA = new THREE.Mesh(breastGeo, chickenMat);
  cutA.position.set(-0.08, 0.04, 0.04);
  cutA.rotation.set(0.15, 0.1, 0.25);
  const cutB = new THREE.Mesh(breastGeo, chickenMat);
  cutB.position.set(0.14, -0.08, -0.05);
  cutB.scale.setScalar(0.84);
  cutB.rotation.set(-0.1, -0.2, -0.2);
  g.add(cutA, cutB);

  // Crisp fresh herb sprig resting across
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.22, 0.12, 0.1),
    new THREE.Vector3(0.0, 0.15, 0.11),
    new THREE.Vector3(0.2, 0.11, 0.09),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 10, 0.01, 6, false);
  const herbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  g.add(new THREE.Mesh(stemGeo, herbMat));

  const leafGeo = new THREE.ConeGeometry(0.014, 0.085, 6);
  for (let i = 0; i < 6; i++) {
    const p = stemCurve.getPoint(0.15 + (i / 5) * 0.72);
    const l1 = new THREE.Mesh(leafGeo, herbMat);
    l1.position.set(p.x, p.y + 0.015, p.z + 0.02);
    l1.rotation.set(0.85, 0, -0.35);
    g.add(l1);
  }

  disposables.push(breastGeo, chickenMat, stemGeo, leafGeo, herbMat);
  return g;
}

function buildOlives(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { map: leafMap } = createLeafTextures(maxAnisotropy);
  disposables.push(leafMap);

  const oliveGeo = new THREE.SphereGeometry(0.15, 24, 24);
  oliveGeo.scale(0.84, 1.24, 0.84);
  const greenMat = new THREE.MeshPhysicalMaterial({
    color: 0x65a30d,
    roughness: 0.16,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
  });
  const kalamataMat = new THREE.MeshPhysicalMaterial({
    color: 0x2b121e,
    roughness: 0.14,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
  });
  const pimentoGeo = new THREE.TorusGeometry(0.042, 0.018, 12, 20);
  const pimentoMat = new THREE.MeshPhysicalMaterial({
    color: 0xdc2626,
    roughness: 0.28,
    clearcoat: 0.6,
  });

  const o1 = new THREE.Mesh(oliveGeo, greenMat);
  o1.position.set(-0.17, 0.05, 0.05);
  o1.rotation.set(0.2, 0, 0.45);
  const p1 = new THREE.Mesh(pimentoGeo, pimentoMat);
  p1.position.set(-0.24, 0.19, 0.06);
  p1.rotation.set(Math.PI / 2 - 0.2, 0.45, 0);

  const o2 = new THREE.Mesh(oliveGeo, kalamataMat);
  o2.position.set(0.16, -0.05, 0.04);
  o2.rotation.set(-0.2, 0.3, -0.35);

  const o3 = new THREE.Mesh(oliveGeo, greenMat);
  o3.position.set(0.0, 0.16, -0.11);
  o3.rotation.set(0.55, 0.2, -0.1);

  // Olive leaf accent
  const leafGeo = new THREE.SphereGeometry(0.16, 12, 10);
  leafGeo.scale(0.28, 1.35, 0.06);
  const leafMat = new THREE.MeshStandardMaterial({
    map: leafMap,
    color: 0x86efac,
    roughness: 0.5,
  });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.set(0.04, -0.18, -0.02);
  leaf.rotation.set(0.2, 0.4, 0.9);

  g.add(o1, p1, o2, o3, leaf);
  disposables.push(
    oliveGeo,
    greenMat,
    kalamataMat,
    pimentoGeo,
    pimentoMat,
    leafGeo,
    leafMat,
  );
  return g;
}

function buildCucumber(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { sliceMap, skinMap, bumpMap } = createCucumberTextures(maxAnisotropy);
  disposables.push(sliceMap, skinMap, bumpMap);

  const sliceGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.072, 32);
  const skinMat = new THREE.MeshPhysicalMaterial({
    map: skinMap,
    bumpMap,
    bumpScale: 0.02,
    roughness: 0.34,
    clearcoat: 0.55,
  });
  const faceMat = new THREE.MeshPhysicalMaterial({
    map: sliceMap,
    roughness: 0.22,
    clearcoat: 0.78,
    clearcoatRoughness: 0.1,
  });

  const slices: [number, number, number, number, number, number][] = [
    [-0.12, -0.1, 0.02, 0.42, 0.2, 0.32],
    [0.09, -0.01, 0.08, 0.35, -0.25, -0.18],
    [-0.04, 0.11, -0.02, -0.28, 0.3, 0.12],
    [0.08, 0.2, -0.08, 0.55, -0.1, -0.35],
  ];
  slices.forEach(([x, y, z, rx, ry, rz]) => {
    const s = new THREE.Mesh(sliceGeo, [skinMat, faceMat, faceMat]);
    s.position.set(x, y, z);
    s.rotation.set(rx, ry, rz);
    g.add(s);
  });

  disposables.push(sliceGeo, skinMat, faceMat);
  return g;
}

function buildCauliflower(
  maxAnisotropy: number,
  disposables: { dispose: () => void }[],
): THREE.Group {
  const g = new THREE.Group();
  const curdBump = createFloretBumpTexture(maxAnisotropy);
  disposables.push(curdBump);

  const curdMatA = new THREE.MeshPhysicalMaterial({
    color: 0xfbfaf4,
    bumpMap: curdBump,
    bumpScale: 0.042,
    roughness: 0.68,
    sheen: 0.35,
    sheenColor: new THREE.Color(0xfef9c3),
  });
  const curdMatB = new THREE.MeshPhysicalMaterial({
    color: 0xf2eedb,
    bumpMap: curdBump,
    bumpScale: 0.042,
    roughness: 0.72,
    sheen: 0.3,
  });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.52 });

  const curdGeo = new THREE.SphereGeometry(0.11, 16, 14);
  const pts: [number, number, number, number][] = [
    [0, 0.16, 0, 1.35],
    [-0.11, 0.14, 0.08, 1.12],
    [0.12, 0.15, 0.06, 1.1],
    [0.01, 0.17, -0.11, 1.05],
    [-0.18, 0.06, 0.05, 1.0],
    [0.18, 0.07, 0.04, 1.0],
    [0.02, 0.06, -0.18, 0.98],
    [-0.03, 0.06, 0.18, 0.98],
    [-0.12, 0.22, -0.05, 0.88],
    [0.12, 0.22, -0.05, 0.88],
    [0.02, 0.25, 0.06, 0.9],
  ];
  pts.forEach(([x, y, z, s], idx) => {
    const f = new THREE.Mesh(curdGeo, idx % 2 === 0 ? curdMatA : curdMatB);
    f.position.set(x, y, z);
    f.scale.set(s * 1.08, s * 0.9, s * 1.08);
    g.add(f);
  });

  // 4 cupped green wrapper leaves at the base
  const wrapperGeo = new THREE.SphereGeometry(0.18, 14, 12);
  wrapperGeo.scale(0.65, 1.2, 0.12);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const leaf = new THREE.Mesh(wrapperGeo, leafMat);
    leaf.position.set(Math.cos(a) * 0.2, -0.08, Math.sin(a) * 0.2);
    leaf.lookAt(0, 0.2, 0);
    g.add(leaf);
  }

  disposables.push(curdMatA, curdMatB, leafMat, curdGeo, wrapperGeo);
  return g;
}

function buildCheese(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { map, bumpMap } = createCheeseTextures(maxAnisotropy);
  disposables.push(map, bumpMap);

  // Classic gourmet triangular cheese wedge (ExtrudeGeometry pie slice — NEVER boxes!)
  const wedgeShape = new THREE.Shape();
  wedgeShape.moveTo(-0.24, -0.14);
  wedgeShape.lineTo(0.28, -0.04);
  wedgeShape.quadraticCurveTo(0.32, 0.12, 0.22, 0.22);
  wedgeShape.lineTo(-0.24, -0.14);

  const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.014,
    bevelSegments: 3,
  });
  wedgeGeo.center();

  const cheeseMat = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap,
    bumpScale: 0.022,
    roughness: 0.44,
    clearcoat: 0.18,
    clearcoatRoughness: 0.35,
  });
  const rindMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.65,
  });

  const w1 = new THREE.Mesh(wedgeGeo, [cheeseMat, rindMat]);
  w1.position.set(-0.04, -0.08, 0.03);
  w1.rotation.set(0.25, 0.35, -0.15);

  const w2 = new THREE.Mesh(wedgeGeo, [cheeseMat, rindMat]);
  w2.position.set(0.06, 0.11, -0.04);
  w2.scale.setScalar(0.84);
  w2.rotation.set(-0.2, -0.45, 0.28);

  g.add(w1, w2);
  disposables.push(wedgeGeo, cheeseMat, rindMat);
  return g;
}

function buildGarlic(maxAnisotropy: number, disposables: { dispose: () => void }[]): THREE.Group {
  const g = new THREE.Group();
  const { map, bumpMap } = createGarlicTextures(maxAnisotropy);
  disposables.push(map, bumpMap);

  const cloveMat = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap,
    bumpScale: 0.02,
    roughness: 0.52,
    sheen: 0.45,
    sheenColor: new THREE.Color(0xfaf5ff),
  });

  const cloveGeo = new THREE.SphereGeometry(0.125, 18, 18);
  cloveGeo.scale(0.76, 1.32, 0.72);

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const c = new THREE.Mesh(cloveGeo, cloveMat);
    c.position.set(Math.cos(a) * 0.095, -0.01, Math.sin(a) * 0.095);
    c.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.22);
    g.add(c);
  }

  // Tapered papery dry stalk at top of garlic bulb
  const stemGeo = new THREE.CylinderGeometry(0.024, 0.058, 0.2, 14);
  const stem = new THREE.Mesh(stemGeo, cloveMat);
  stem.position.y = 0.2;
  g.add(stem);

  // Knobby multi-lobe organic ginger root alongside
  const gingerMat = new THREE.MeshStandardMaterial({
    color: 0xd99b43,
    bumpMap,
    bumpScale: 0.018,
    roughness: 0.74,
  });
  const lobeGeo = new THREE.SphereGeometry(0.085, 16, 14);
  lobeGeo.scale(0.85, 1.45, 0.8);

  const gingerGroup = new THREE.Group();
  const mainLobe = new THREE.Mesh(lobeGeo, gingerMat);
  const sideLobe = new THREE.Mesh(lobeGeo, gingerMat);
  sideLobe.scale.setScalar(0.75);
  sideLobe.position.set(0.08, 0.05, 0.02);
  sideLobe.rotation.z = -0.65;
  gingerGroup.add(mainLobe, sideLobe);
  gingerGroup.position.set(0.22, -0.14, 0.13);
  gingerGroup.rotation.set(0.35, 0.2, 0.95);
  g.add(gingerGroup);

  disposables.push(cloveGeo, cloveMat, stemGeo, lobeGeo, gingerMat);
  return g;
}

export function createIngredientField(
  maxAnisotropy: number,
  isSoftwareGl: boolean,
): IngredientField {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const nodes: OrbitingIngredientNode[] = [];
  const hitProxies: THREE.Mesh[] = [];

  ORBIT_INGREDIENTS.forEach((spec, idx) => {
    const pivot = new THREE.Group();
    let model: THREE.Group;

    switch (spec.id) {
      case 'avocado':
        model = buildAvocado(maxAnisotropy, disposables);
        break;
      case 'salmon':
        model = buildSalmon(maxAnisotropy, disposables);
        break;
      case 'broccoli':
        model = buildBroccoli(maxAnisotropy, disposables);
        break;
      case 'egg':
        model = buildEgg(disposables);
        break;
      case 'oliveOil':
        model = buildOliveOil(isSoftwareGl, disposables);
        break;
      case 'lemon':
        model = buildLemon(maxAnisotropy, disposables);
        break;
      case 'almonds':
        model = buildAlmonds(maxAnisotropy, disposables);
        break;
      case 'greens':
        model = buildGreens(maxAnisotropy, disposables);
        break;
      case 'chicken':
        model = buildChicken(maxAnisotropy, disposables);
        break;
      case 'olives':
        model = buildOlives(maxAnisotropy, disposables);
        break;
      case 'cucumber':
        model = buildCucumber(maxAnisotropy, disposables);
        break;
      case 'cauliflower':
        model = buildCauliflower(maxAnisotropy, disposables);
        break;
      case 'cheese':
        model = buildCheese(maxAnisotropy, disposables);
        break;
      case 'garlic':
        model = buildGarlic(maxAnisotropy, disposables);
        break;
    }

    const hitProxy = attachCollider(model, spec.id, 0.65, disposables);
    hitProxies.push(hitProxy);

    // 3 multi-tiered inclined 3D orbital rings surrounding the book & black hole
    const tier = idx % 3;
    const orbitRadius = tier === 0 ? 3.35 : tier === 1 ? 4.25 : 5.1;
    const orbitPhase = (idx / ORBIT_INGREDIENTS.length) * Math.PI * 2;
    const orbitSpeed = tier === 0 ? 0.28 : tier === 1 ? -0.22 : 0.17;
    const orbitTiltX = tier === 0 ? 0.36 : tier === 1 ? -0.32 : 0.18;
    const verticalAmp = 0.24 + (idx % 3) * 0.1;

    pivot.add(model);
    group.add(pivot);

    nodes.push({
      spec,
      pivot,
      model,
      hitProxy,
      orbitRadius,
      orbitSpeed,
      orbitPhase,
      orbitTiltX,
      verticalAmp,
    });
  });

  return {
    group,
    nodes,
    hitProxies,
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
