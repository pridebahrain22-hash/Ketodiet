import * as THREE from 'three';
import { createGlowSpriteTexture } from './proceduralTextures';

export interface BlackHoleSystem {
  group: THREE.Group;
  update: (elapsed: number) => void;
  dispose: () => void;
}

export function createBlackHoleSystem(): BlackHoleSystem {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];

  // 1. Central Event Horizon Void — compressed along Z behind the book so it NEVER swallows the book
  const coreGeo = new THREE.SphereGeometry(2.18, 64, 64);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x010203,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.set(0, 0.1, -1.25);
  coreMesh.scale.set(1, 1, 0.32); // max front Z = -1.25 + 0.70 = -0.55 (well behind the book at +0.45)
  group.add(coreMesh);
  disposables.push(coreGeo, coreMat);

  // 2. Relativistic Fresnel Photon Halo framing the event horizon behind the book
  const haloGeo = new THREE.SphereGeometry(2.42, 64, 64);
  const haloMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uInnerColor: { value: new THREE.Color('#fbbf24') },
      uOuterColor: { value: new THREE.Color('#10b981') },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uInnerColor;
      uniform vec3 uOuterColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = 1.0 - max(0.0, dot(vViewDir, vNormal));
        float photonRing = pow(rim, 3.2);
        float pulse = 0.92 + 0.1 * sin(uTime * 1.8 + rim * 6.0);
        vec3 col = mix(uOuterColor, uInnerColor, smoothstep(0.32, 0.94, rim));
        float alpha = clamp(photonRing * 1.6 * pulse, 0.0, 0.92);
        gl_FragColor = vec4(col * 1.45, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.copy(coreMesh.position);
  haloMesh.scale.set(1, 1, 0.34);
  group.add(haloMesh);
  disposables.push(haloGeo, haloMat);

  // 3. Swirling Accretion Vortex surrounding the book at z = -0.68
  const diskGeo = new THREE.RingGeometry(2.12, 5.2, 128, 10);
  const diskMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uGold: { value: new THREE.Color('#fbbf24') },
      uEmerald: { value: new THREE.Color('#22c55e') },
      uDeep: { value: new THREE.Color('#064e3b') },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vLocalPos;
      void main() {
        vUv = uv;
        vLocalPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uGold;
      uniform vec3 uEmerald;
      uniform vec3 uDeep;
      varying vec2 vUv;
      varying vec3 vLocalPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        float r = length(vLocalPos.xy);
        float normR = clamp((r - 2.12) / (5.2 - 2.12), 0.0, 1.0);
        float angle = atan(vLocalPos.y, vLocalPos.x);

        float spin = angle + uTime * (1.2 / (0.38 + normR)) + 4.8 * (1.0 - normR);
        float spiralA = noise(vec2(normR * 10.0, spin * 1.6));
        float spiralB = noise(vec2(normR * 22.0 - uTime * 0.3, spin * 3.0));
        float bands = 0.55 + 0.45 * sin(normR * 30.0 - uTime * 2.0 + spiralA * 3.2);

        float density = smoothstep(0.0, 0.08, normR) * (1.0 - smoothstep(0.55, 1.0, normR));
        float plasma = clamp((spiralA * 0.6 + spiralB * 0.4) * bands * 1.55, 0.0, 1.0);

        vec3 col = mix(uGold * 1.45, uEmerald * 1.2, smoothstep(0.06, 0.5, normR));
        col = mix(col, uDeep, smoothstep(0.55, 0.96, normR));

        float alpha = density * (0.38 + 0.62 * plasma);
        gl_FragColor = vec4(col * (1.22 - normR * 0.35), alpha * 0.92);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const mainDisk = new THREE.Mesh(diskGeo, diskMat);
  mainDisk.position.set(0, 0.1, -0.68);
  mainDisk.rotation.set(0.22, -0.06, 0);
  group.add(mainDisk);
  disposables.push(diskGeo, diskMat);

  // 4. Crisp Einstein Photon Ring around the circular black hole perimeter
  const photonGeo = new THREE.TorusGeometry(2.22, 0.065, 24, 128);
  const photonMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#fbbf24') },
      uColorB: { value: new THREE.Color('#34d399') },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        float wave = 0.5 + 0.5 * sin(vUv.x * 16.0 - uTime * 2.8);
        vec3 col = mix(uColorA, uColorB, 0.5 + 0.5 * sin(vPos.y * 0.9 + uTime * 0.7));
        gl_FragColor = vec4(col * (0.95 + 0.4 * wave), 0.88);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lensRing = new THREE.Mesh(photonGeo, photonMat);
  lensRing.position.set(0, 0.1, -0.68);
  lensRing.rotation.set(0.08, -0.04, 0);
  group.add(lensRing);
  disposables.push(photonGeo, photonMat);

  // 5. Outer Gravitational Dust & Starfield Halo orbiting around the black hole
  const particleCount = 750;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const colorGold = new THREE.Color('#fbbf24');
  const colorEmerald = new THREE.Color('#34d399');
  const colorWhite = new THREE.Color('#ecfdf5');

  for (let i = 0; i < particleCount; i++) {
    const r = 2.4 + Math.pow(Math.random(), 1.25) * 4.6;
    const theta = Math.random() * Math.PI * 2;
    const zSpread = (Math.random() - 0.5) * 1.2;

    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = Math.sin(theta) * r;
    positions[i * 3 + 2] = zSpread;

    const pick = Math.random();
    const c = pick < 0.45 ? colorEmerald : pick < 0.82 ? colorGold : colorWhite;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const spriteTex = createGlowSpriteTexture();
  const dustMat = new THREE.PointsMaterial({
    size: 0.16,
    map: spriteTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dustPoints = new THREE.Points(dustGeo, dustMat);
  dustPoints.position.set(0, 0.1, -0.78);
  group.add(dustPoints);
  disposables.push(dustGeo, dustMat, spriteTex);

  return {
    group,
    update(elapsed: number) {
      haloMat.uniforms.uTime.value = elapsed;
      diskMat.uniforms.uTime.value = elapsed;
      photonMat.uniforms.uTime.value = elapsed;
      dustPoints.rotation.z = elapsed * 0.14;
      mainDisk.rotation.z = elapsed * 0.1;
      lensRing.rotation.z = elapsed * 0.08;
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
