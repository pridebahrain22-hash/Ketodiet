import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { IngredientSpec, ORBIT_INGREDIENTS } from '../data/ebookContent';
import { createBlackHoleSystem } from '../three/blackHoleShader';
import { createKetoBookModel } from '../three/bookBuilder';
import { createIngredientField } from '../three/ingredientBuilder';
import { createStarFieldSystem } from '../three/starField';

type CameraPresetId = 'horizon' | 'book' | 'ingredients';

interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'horizon',
    label: 'Black Hole View',
    position: [0, -0.15, 9.2],
    target: [0, -0.35, -0.25],
  },
  {
    id: 'book',
    label: 'Book Close-Up',
    position: [0, 0.05, 5.1],
    target: [0, 0.1, 0.55],
  },
  {
    id: 'ingredients',
    label: 'Ingredients Orbit',
    position: [0, 2.6, 9.8],
    target: [0, -0.25, -0.25],
  },
];

// Pre-allocated scratch math helpers outside the render loop (Zero GC)
const _camGoalPos = new THREE.Vector3();
const _camGoalTarget = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();
const _zoomDir = new THREE.Vector3();

interface Hero3DCanvasProps {
  priceLabel: string;
  originalPriceLabel: string;
  usdPriceLabel: string;
  countdownFormatted: string;
  currency: 'BHD' | 'USD' | 'SAR' | 'AED' | 'GBP' | 'EUR';
  onChangeCurrency: (next: 'BHD' | 'USD') => void;
  onBuyClick: () => void;
  onPreviewPdfClick: () => void;
}

export function Hero3DCanvas({
  priceLabel,
  originalPriceLabel,
  usdPriceLabel,
  countdownFormatted,
  currency,
  onChangeCurrency,
  onBuyClick,
  onPreviewPdfClick,
}: Hero3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);
  const [dockOpen, setDockOpen] = useState(true);
  const [activePreset, setActivePreset] = useState<CameraPresetId>('horizon');
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [orbitPaused, setOrbitPaused] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientSpec | null>(null);

  const stateRef = useRef({
    isBookOpen: false,
    orbitPaused: false,
    selectedId: null as IngredientSpec['id'] | null,
    hoveredId: null as IngredientSpec['id'] | null,
    hoveredBook: false,
    transitionActive: false,
    goalPos: new THREE.Vector3(0, -0.15, 9.2),
    goalTarget: new THREE.Vector3(0, -0.35, -0.25),
    zoomStep: 0,
    initialZ: 9.2,
  });
  const hasMountedOpenEffect = useRef(false);

  useEffect(() => {
    stateRef.current.isBookOpen = isBookOpen;
    if (!hasMountedOpenEffect.current) {
      hasMountedOpenEffect.current = true;
      return;
    }
    const aspect = (mountRef.current?.clientWidth || 720) / (mountRef.current?.clientHeight || 640);
    if (isBookOpen) {
      const openZoomZ = aspect < 1 ? Math.min(10.8, 7.2 / Math.max(aspect, 0.66)) : 5.45;
      stateRef.current.goalPos.set(0, 0.18, openZoomZ);
      stateRef.current.goalTarget.set(0, 0.22, 0.55);
      stateRef.current.transitionActive = true;
      setActivePreset('book');
    } else {
      stateRef.current.goalPos.set(0, -0.15, stateRef.current.initialZ);
      stateRef.current.goalTarget.set(0, -0.35, -0.25);
      stateRef.current.transitionActive = true;
      setActivePreset('horizon');
    }
  }, [isBookOpen]);

  useEffect(() => {
    stateRef.current.orbitPaused = orbitPaused;
  }, [orbitPaused]);

  useEffect(() => {
    stateRef.current.selectedId = selectedIngredient?.id ?? null;
  }, [selectedIngredient]);

  const applyPreset = (preset: CameraPreset) => {
    setActivePreset(preset.id);
    stateRef.current.goalPos.set(...preset.position);
    stateRef.current.goalTarget.set(...preset.target);
    stateRef.current.transitionActive = true;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 640;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04070a);
    scene.fog = new THREE.FogExp2(0x04070a, 0.022);

    const initialAspect = width / height;
    const camera = new THREE.PerspectiveCamera(44, initialAspect, 0.1, 120);
    const initialZ = initialAspect < 1 ? Math.min(13.2, 9.2 / Math.max(initialAspect * 1.15, 0.65)) : 9.2;
    stateRef.current.initialZ = initialZ;
    camera.position.set(0, -0.15, initialZ);

    // Studio Reflection Environment (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Balanced Studio Lighting so Printed Pages Stay Crisp (Zero White Blowout) & Ingredients Pop
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x064e3b, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ec, 1.65);
    keyLight.position.set(2.8, 3.8, 7.6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const frontFill = new THREE.DirectionalLight(0xffffff, 0.24);
    frontFill.position.set(-1.5, 0.4, 8.2);
    scene.add(frontFill);

    const emeraldRim = new THREE.PointLight(0x22c55e, 15, 20, 1.4);
    emeraldRim.position.set(-4.2, 1.6, -1.5);
    scene.add(emeraldRim);

    const goldRim = new THREE.PointLight(0xf59e0b, 17, 20, 1.4);
    goldRim.position.set(4.2, -1.2, -1.8);
    scene.add(goldRim);

    // OrbitControls — drag to orbit 360°, keep page scroll smooth
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = 3.5;
    controls.maxDistance = 14.5;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.target.set(0, -0.35, -0.25);

    const cancelTransition = () => {
      stateRef.current.transitionActive = false;
    };
    controls.addEventListener('start', cancelTransition);

    // Subtle Deep-Space Starfield Backdrop behind the Black Hole
    const starField = createStarFieldSystem(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    scene.add(starField.group);

    // Centered Stage Group: Black Hole + Book centered right inside + 14 Orbiting Ingredients
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const blackHole = createBlackHoleSystem();
    stageGroup.add(blackHole.group);

    // Book sits squarely in front of the Black Hole event horizon core, centered inside the glowing ring
    const bookModel = createKetoBookModel(maxAnisotropy, isSoftwareGl);
    bookModel.group.position.set(0, 0.28, 0.55);
    bookModel.group.rotation.set(0.03, -0.08, 0);
    stageGroup.add(bookModel.group);

    const ingredientField = createIngredientField(maxAnisotropy, isSoftwareGl);
    stageGroup.add(ingredientField.group);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting restricted to Layer 1 hit proxies
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const allHitTargets = [...ingredientField.hitProxies, bookModel.hitProxy];
    let lastHoverCheck = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const updatePointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (ev: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      updatePointer(ev);
      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(allHitTargets, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj.userData.isBook) {
          stateRef.current.hoveredId = null;
          stateRef.current.hoveredBook = true;
        } else {
          stateRef.current.hoveredId = hitObj.userData.ingredientId as IngredientSpec['id'];
          stateRef.current.hoveredBook = false;
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        stateRef.current.hoveredId = null;
        stateRef.current.hoveredBook = false;
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onPointerDown = (ev: PointerEvent) => {
      pointerDownPos = { x: ev.clientX, y: ev.clientY };
    };

    const onPointerUp = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - pointerDownPos.x, ev.clientY - pointerDownPos.y);
      if (dist > 6) return;
      updatePointer(ev);
      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(allHitTargets, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj.userData.isBook) {
          setIsBookOpen((prev) => !prev);
        } else {
          const hitId = hitObj.userData.ingredientId as IngredientSpec['id'];
          const found = ORBIT_INGREDIENTS.find((item) => item.id === hitId) || null;
          setSelectedIngredient(found);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 640;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let frameId = 0;
    let disposed = false;
    let prevTime = performance.now();
    let orbitClock = 0;
    let openProgress = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const elapsed = now * 0.001;

      if (!stateRef.current.orbitPaused) {
        orbitClock += delta;
      }

      if (stateRef.current.zoomStep !== 0) {
        _zoomDir.subVectors(camera.position, controls.target);
        const dist = _zoomDir.length();
        const nextDist = THREE.MathUtils.clamp(dist + stateRef.current.zoomStep, 3.6, 14.5);
        _zoomDir.normalize().multiplyScalar(nextDist);
        camera.position.copy(controls.target).add(_zoomDir);
        stateRef.current.zoomStep = 0;
      }

      const targetOpen = stateRef.current.isBookOpen ? 1 : 0;
      openProgress = THREE.MathUtils.damp(openProgress, targetOpen, 5.5, delta);
      bookModel.setOpenProgress(openProgress);

      // Center both open pages horizontally when opened, keep closed cover centered in the vortex
      const targetBookX = stateRef.current.isBookOpen ? 1.01 : 0.0;
      bookModel.group.position.x = THREE.MathUtils.damp(
        bookModel.group.position.x,
        targetBookX,
        5.2,
        delta,
      );
      bookModel.group.position.y =
        0.28 + Math.sin(elapsed * 1.3) * (stateRef.current.isBookOpen ? 0.025 : 0.075);
      bookModel.group.rotation.x = THREE.MathUtils.damp(
        bookModel.group.rotation.x,
        stateRef.current.isBookOpen ? 0.0 : 0.03,
        5.0,
        delta,
      );
      bookModel.group.rotation.y = THREE.MathUtils.damp(
        bookModel.group.rotation.y,
        stateRef.current.isBookOpen ? 0.0 : -0.09 + Math.sin(elapsed * 0.6) * 0.07,
        4.5,
        delta,
      );
      const bookTargetScale = stateRef.current.hoveredBook ? 1.04 : 1.0;
      const nextBookScale = THREE.MathUtils.damp(bookModel.group.scale.x, bookTargetScale, 8, delta);
      bookModel.group.scale.setScalar(nextBookScale);

      starField.update(elapsed);
      blackHole.update(elapsed);

      // 14 3D ingredients orbiting cleanly around the black hole & book perimeter
      ingredientField.nodes.forEach((node, idx) => {
        const angle = node.orbitPhase + orbitClock * node.orbitSpeed;
        const rx = node.orbitRadius;
        const ry = node.orbitRadius * 0.68;
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry * 0.55 + Math.sin(angle * 2 + idx) * 0.35;
        const z = Math.sin(angle) * 1.55 - 0.15;

        node.pivot.position.set(x, y, z);
        node.model.rotation.y += delta * (0.55 + (idx % 3) * 0.15);
        node.model.rotation.x = Math.sin(elapsed * 0.85 + idx) * 0.18;

        const isFocused =
          stateRef.current.selectedId === node.spec.id ||
          stateRef.current.hoveredId === node.spec.id;
        const targetScale = isFocused ? 1.48 : 1.16;
        const nextScale = THREE.MathUtils.damp(node.model.scale.x, targetScale, 8, delta);
        node.model.scale.setScalar(nextScale);
      });

      if (stateRef.current.transitionActive) {
        _camGoalPos.copy(stateRef.current.goalPos);
        _camGoalTarget.copy(stateRef.current.goalTarget);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoalPos.x, 4.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoalPos.y, 4.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoalPos.z, 4.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _camGoalTarget.x, 4.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _camGoalTarget.y, 4.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _camGoalTarget.z, 4.5, delta);

        if (camera.position.distanceTo(_camGoalPos) < 0.04) {
          stateRef.current.transitionActive = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', cancelTransition);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      starField.dispose();
      blackHole.dispose();
      bookModel.dispose();
      ingredientField.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      id="hero-3d"
      className="w-full bg-[#04070a] border-b border-white/10"
    >
      {/* 1. Full-Width 3D Black Hole & Centered Book Stage Seen First */}
      <div className="relative w-full h-[580px] sm:h-[650px] lg:h-[700px] bg-[#04070a] overflow-hidden border-b border-white/10">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* Subtle Top-Left Edition Header (clear of the centered book & vortex) */}
        <div
          className={`pointer-events-none absolute top-5 left-5 sm:top-7 sm:left-8 z-20 max-w-xs sm:max-w-md transition-opacity ${
            selectedIngredient ? 'opacity-0 sm:opacity-100' : 'opacity-100'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-medium tracking-wider uppercase text-emerald-400">
            <span>30-Day Keto Guide</span>
            <span aria-hidden="true">·</span>
            <span className="font-arabic normal-case">كيتو لايف البحرين</span>
          </div>
          <p className="font-display text-xl sm:text-2xl font-semibold text-white mt-0.5 tracking-tight">
            KetoLife Bahrain Edition
          </p>
        </div>

        {webglError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#060d11] p-8 text-center">
            <div className="max-w-md space-y-4">
              <h2 className="font-display text-3xl text-white">KetoLife Bahrain — 30-Day Guide</h2>
              <p className="text-sm text-stone-300">
                Interactive 3D view is unavailable on this browser context. You can preview the
                bilingual guide and purchase below.
              </p>
              <button
                onClick={onBuyClick}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-sm font-semibold rounded-lg cursor-pointer"
              >
                Buy Now · {priceLabel}
              </button>
            </div>
          </div>
        )}

        {/* Selected 3D Ingredient Detail Card (Top-Right corner, never blocks center book) */}
        {selectedIngredient && (
          <div className="pointer-events-auto absolute top-5 right-5 sm:top-7 sm:right-8 z-20 w-[min(320px,calc(100%-2.5rem))] bg-[#0a1118]/95 border border-emerald-500/40 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span>{selectedIngredient.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-arabic">{selectedIngredient.nameAr}</span>
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  {selectedIngredient.nameEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIngredient(null)}
                className="text-xs text-stone-400 hover:text-white px-2 py-1 rounded bg-white/5 cursor-pointer"
              >
                Close
              </button>
            </div>
            <p className="font-mono text-xs text-amber-300 mt-1.5 tabular-nums">
              {selectedIngredient.macros}
            </p>
            <p className="text-xs text-stone-200 mt-2 leading-relaxed">
              {selectedIngredient.roleInGuide}
            </p>
          </div>
        )}

        {/* Buy Now, Open Book & Preview PDF Bar Settled Directly Below the 3D Book */}
        <div
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2.5 transition-all duration-200 w-max max-w-[92%] ${
            dockOpen ? 'bottom-[114px]' : 'bottom-14'
          }`}
        >
          <button
            onClick={onBuyClick}
            className="pointer-events-auto inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs sm:text-sm font-semibold rounded-xl shadow-2xl transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy Now · {priceLabel}</span>
            <span className="line-through opacity-70 text-[11px] font-medium">
              {originalPriceLabel}
            </span>
          </button>
          <button
            onClick={() => setIsBookOpen((prev) => !prev)}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0a1017]/95 hover:bg-[#13202d] border border-white/20 text-stone-100 text-xs sm:text-sm font-medium rounded-xl shadow-2xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>{isBookOpen ? 'Close Book' : 'Open Book'}</span>
          </button>
          <button
            onClick={onPreviewPdfClick}
            className="pointer-events-auto hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0a1017]/95 hover:bg-[#13202d] border border-white/20 text-stone-100 text-xs sm:text-sm font-medium rounded-xl shadow-2xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Preview PDF</span>
          </button>
        </div>

        {/* Collapsible Bottom 3D Control Dock */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-[min(760px,95%)]">
          <button
            onClick={() => setDockOpen((prev) => !prev)}
            className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#0b1219]/95 border border-white/15 rounded-md text-xs font-medium text-stone-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {dockOpen ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show 3D Controls</span>
              </>
            )}
          </button>

          {dockOpen && (
            <div className="pointer-events-auto w-full bg-[#0a1017]/95 border border-white/15 rounded-xl px-3 py-2 shadow-2xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg">
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activePreset === preset.id
                        ? 'bg-emerald-500 text-stone-950 font-semibold'
                        : 'text-stone-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setIsBookOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isBookOpen
                      ? 'bg-amber-400/20 border-amber-400/60 text-amber-200'
                      : 'bg-white/5 border-white/10 text-stone-200 hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isBookOpen ? 'Close Cover' : 'Open Book'}</span>
                </button>

                <button
                  onClick={() => setOrbitPaused((prev) => !prev)}
                  aria-label={orbitPaused ? 'Resume 3D orbit' : 'Pause 3D orbit'}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-stone-200 hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  {orbitPaused ? (
                    <Play className="w-3.5 h-3.5" />
                  ) : (
                    <Pause className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    const idx = selectedIngredient
                      ? (ORBIT_INGREDIENTS.findIndex((i) => i.id === selectedIngredient.id) + 1) %
                        ORBIT_INGREDIENTS.length
                      : 0;
                    setSelectedIngredient(ORBIT_INGREDIENTS[idx]);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-emerald-300 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ingredients</span>
                </button>

                <button
                  onClick={() => {
                    stateRef.current.zoomStep = -1.1;
                  }}
                  aria-label="Zoom in"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    stateRef.current.zoomStep = 1.1;
                  }}
                  aria-label="Zoom out"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setIsBookOpen(false);
                    setSelectedIngredient(null);
                    applyPreset(CAMERA_PRESETS[0]);
                  }}
                  aria-label="Reset camera"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Architectural Problem-Solving Overview Band Directly Beneath the 3D Stage */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-emerald-400">
            <span>30-Day Weight Loss Plan</span>
            <span aria-hidden="true">·</span>
            <span>Bahrain &amp; Worldwide</span>
            <span aria-hidden="true">·</span>
            <span className="font-arabic">حل عملي لخسارة الوزن في ٣٠ يوماً</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
            Solve Stubborn Weight Gain in 30 Days
          </h1>

          <p className="text-base text-stone-200 leading-relaxed max-w-2xl">
            Built to eliminate the three biggest reasons people quit keto: confusing carb math,
            exhausting daily cooking, and hidden sugars when ordering out in Bahrain or abroad.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#0b131b] border border-white/10 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>Simple Daily Fuel</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Structured nutrition topics &amp; quick meal ideas unlocked inside the full PDF.
              </p>
            </div>
            <div className="bg-[#0b131b] border border-white/10 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>Bahrain Pantry &amp; Dining</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Bilingual English &amp; Arabic supermarket checklist plus restaurant swaps.
              </p>
            </div>
            <div className="bg-[#0b131b] border border-white/10 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>30-Day Fitness Topics</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Dedicated men and women conditioning topics unlocked inside the 24-page eBook.
              </p>
            </div>
          </div>
        </div>

        {/* Executive Digital Edition & Instant Delivery Summary Card */}
        <div className="lg:col-span-5 bg-[#091017] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/35 rounded-xl px-4 py-2.5 text-xs">
            <span className="font-semibold text-amber-300">25% OFF Limited Offer</span>
            <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-white tabular-nums">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Ends in {countdownFormatted}</span>
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-medium text-emerald-400">Official Digital eBook</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-1">
                KetoLife Bahrain Guide
              </h2>
              <div className="inline-flex items-center gap-1 mt-2 p-0.5 bg-black/50 border border-white/10 rounded-md">
                <button
                  type="button"
                  onClick={() => onChangeCurrency('BHD')}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                    currency === 'BHD'
                      ? 'bg-emerald-500 text-stone-950 font-semibold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  BHD
                </button>
                <button
                  type="button"
                  onClick={() => onChangeCurrency('USD')}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                    currency === 'USD'
                      ? 'bg-emerald-500 text-stone-950 font-semibold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="block font-mono text-xs text-stone-400 line-through tabular-nums">
                {originalPriceLabel}
              </span>
              <span className="font-mono text-2xl font-semibold text-amber-300 tabular-nums">
                {priceLabel}
              </span>
              {currency !== 'USD' && (
                <p className="font-mono text-xs text-emerald-300 mt-0.5 tabular-nums">
                  {usdPriceLabel}
                </p>
              )}
              <p className="text-[11px] text-stone-400 mt-0.5">Instant Download</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[#060b10] border border-white/10 rounded-lg p-3">
              <dt className="text-stone-400">Format &amp; Length</dt>
              <dd className="text-sm font-semibold text-white mt-1">24-Page Bilingual PDF</dd>
            </div>
            <div className="bg-[#060b10] border border-white/10 rounded-lg p-3">
              <dt className="text-stone-400">Languages</dt>
              <dd className="text-sm font-semibold text-white mt-1">English &amp; العربية</dd>
            </div>
            <div className="bg-[#060b10] border border-white/10 rounded-lg p-3">
              <dt className="text-stone-400">Bahrain Scan &amp; Pay</dt>
              <dd className="text-sm font-semibold text-white mt-1">BenefitPay QR · BisB</dd>
            </div>
            <div className="bg-[#060b10] border border-white/10 rounded-lg p-3">
              <dt className="text-stone-400">Foreign Countries</dt>
              <dd className="text-sm font-semibold text-white mt-1">USD · Wise · SWIFT QR</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBuyClick}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer tabular-nums"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Now · {priceLabel}</span>
            </button>

            <button
              onClick={onPreviewPdfClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0f1924] hover:bg-[#162433] border border-white/15 text-stone-100 text-sm font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Book Topics</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
