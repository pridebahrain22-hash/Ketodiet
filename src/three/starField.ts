import * as THREE from 'three';

export interface StarFieldSystem {
  group: THREE.Group;
  update: (elapsed: number) => void;
  dispose: () => void;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStarFieldSystem(pixelRatio: number): StarFieldSystem {
  const group = new THREE.Group();
  const rand = createSeededRandom(20261115);

  const starCount = 1650;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const phases = new Float32Array(starCount);
  const speeds = new Float32Array(starCount);
  const alphas = new Float32Array(starCount);

  const colCoolWhite = new THREE.Color('#f1f5f9');
  const colIceBlue = new THREE.Color('#bae6fd');
  const colWarmAmber = new THREE.Color('#fde68a');
  const colEmeraldDust = new THREE.Color('#a7f3d0');

  for (let i = 0; i < starCount; i++) {
    // Concentrate ~70% in the rear cosmic hemisphere behind the black hole, 30% full 360° so camera orbiting never hits a void
    const isRearBackdrop = i < starCount * 0.7;
    const u = rand();
    const v = rand();
    const theta = isRearBackdrop
      ? Math.PI + (u - 0.5) * Math.PI * 1.15 // concentrated behind -Z
      : u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const radius = 28 + Math.pow(rand(), 0.75) * 48;

    const sinPhi = Math.sin(phi);
    const x = radius * sinPhi * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * sinPhi * Math.cos(theta) - 1.5;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const palettePick = rand();
    const chosen =
      palettePick < 0.56
        ? colCoolWhite
        : palettePick < 0.78
          ? colIceBlue
          : palettePick < 0.93
            ? colWarmAmber
            : colEmeraldDust;

    // Slight per-star luminance variance
    const tintScale = 0.85 + rand() * 0.25;
    colors[i * 3] = Math.min(1, chosen.r * tintScale);
    colors[i * 3 + 1] = Math.min(1, chosen.g * tintScale);
    colors[i * 3 + 2] = Math.min(1, chosen.b * tintScale);

    // Power-law star magnitude distribution: mostly crisp pinpoints, ~10% gently brighter accent stars
    const mag = Math.pow(rand(), 3.2);
    sizes[i] = 0.65 + mag * 2.15;
    phases[i] = rand() * Math.PI * 2;
    speeds[i] = 0.45 + rand() * 1.35;
    alphas[i] = 0.24 + mag * 0.46;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute('aBaseAlpha', new THREE.BufferAttribute(alphas, 1));
  geometry.computeBoundingSphere();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPixelRatio;

      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;
      attribute float aBaseAlpha;

      varying vec3 vColor;
      varying float vAlpha;
      varying float vAccent;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = max(-mvPosition.z, 1.0);

        float twinkle = 0.74 + 0.26 * sin(uTime * aSpeed + aPhase);
        // Gently fade outermost stars so the deep field feels continuous
        float depthFade = 1.0 - smoothstep(58.0, 95.0, dist);

        vColor = aColor;
        vAlpha = aBaseAlpha * twinkle * depthFade;
        vAccent = smoothstep(1.75, 2.75, aSize);

        gl_PointSize = clamp(aSize * uPixelRatio * (135.0 / dist), 1.2, 14.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      varying float vAccent;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        if (d > 0.5) discard;

        float core = exp(-d * d * 24.0);
        float halo = exp(-d * d * 6.5) * 0.28;

        // Subtle astronomical diffraction glint only on brighter accent stars
        float crossX = exp(-abs(uv.y) * 28.0) * exp(-abs(uv.x) * 6.5);
        float crossY = exp(-abs(uv.x) * 28.0) * exp(-abs(uv.y) * 6.5);
        float sparkle = (crossX + crossY) * 0.22 * vAccent;

        float strength = clamp(core + halo + sparkle, 0.0, 1.0);
        gl_FragColor = vec4(vColor, strength * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });

  const starsPoints = new THREE.Points(geometry, material);
  starsPoints.frustumCulled = false;
  group.add(starsPoints);

  return {
    group,
    update(elapsed: number) {
      material.uniforms.uTime.value = elapsed;
      starsPoints.rotation.y = elapsed * 0.0045;
      starsPoints.rotation.x = Math.sin(elapsed * 0.003) * 0.015;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
