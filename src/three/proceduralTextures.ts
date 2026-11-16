import * as THREE from 'three';
import { BOOK_COVER_IMAGE_URL } from '../data/ebookContent';

function finalizeColorTexture(canvas: HTMLCanvasElement, maxAnisotropy: number): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function finalizeDataTexture(canvas: HTMLCanvasElement, maxAnisotropy: number): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/** Deterministic pseudo-random helper so organic textures look crisp & repeatable */
function seededNoise(x: number, y: number, seed = 13.37): number {
  const v = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return v - Math.floor(v);
}

export function createFrontCoverTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d')!;

  // Immediate fallback hardcover backdrop while exact PDF cover image finishes decoding
  const bg = ctx.createLinearGradient(0, 0, 0, 1440);
  bg.addColorStop(0, '#093823');
  bg.addColorStop(0.5, '#0e4f31');
  bg.addColorStop(1, '#062416');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1440);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 92px sans-serif';
  ctx.fillText('KetoLife', 512, 620);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 46px sans-serif';
  ctx.fillText('B A H R A I N', 512, 690);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('30 DAYS LOSS WEIGHT KETO DIET', 512, 770);

  const tex = finalizeColorTexture(canvas, maxAnisotropy);

  // Load exact attached PDF Page 1 cover image and composite cleanly onto the hardcover canvas
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // Rich emerald leatherette outer border frame
    ctx.fillStyle = '#0c4327';
    ctx.fillRect(0, 0, 1024, 1440);

    // Subtle top/bottom gold foil lines
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 984, 1400);

    // Crop out the pale mint top/bottom PDF margin (the cover artwork circle sits centrally)
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const cropY = Math.round(srcH * 0.14);
    const cropH = Math.round(srcH * 0.72);

    // Paint clean white-emerald card mat for the full circular emblem cover
    ctx.fillStyle = '#f7fbf7';
    ctx.fillRect(36, 130, 952, 1180);

    // Draw the exact PDF cover artwork centered cleanly
    const targetSize = 952;
    ctx.drawImage(img, 0, cropY, srcW, cropH, 36, 244, targetSize, targetSize);

    // Top & bottom Bahrain edition typography bands so the book cover fills 100% of the hardcover
    ctx.fillStyle = '#093823';
    ctx.fillRect(36, 36, 952, 140);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('30-DAY WEIGHT LOSS & FITNESS EDITION', 512, 98);
    ctx.fillStyle = '#bbf7d0';
    ctx.font = '600 24px sans-serif';
    ctx.fillText('دليل كيتو لايف البحرين · نسخة ثنائية اللغة', 512, 142);

    ctx.fillStyle = '#093823';
    ctx.fillRect(36, 1264, 952, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('MEAL PLAN · RECIPES · BAHRAIN SHOPPING · WORKOUTS', 512, 1322);
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('OFFICIAL BILINGUAL EDITION  ·  BAHRAIN', 512, 1368);

    tex.needsUpdate = true;
  };
  img.src = BOOK_COVER_IMAGE_URL;

  return tex;
}

export function createBackCoverTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#072b1b';
  ctx.fillRect(0, 0, 1024, 1440);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, 928, 1344);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 46px sans-serif';
  ctx.fillText('KETOLIFE BAHRAIN', 512, 175);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('30-DAY PROBLEM-SOLVING KETO', 512, 232);

  ctx.fillStyle = '#d4af37';
  ctx.fillRect(362, 270, 300, 3);

  const highlights = [
    '7-Day Complete Keto Meal Plan',
    '4 Step-by-Step Bilingual Recipes',
    'Bahrain Supermarket Shopping List',
    '60-Minute Meal Prep Blueprint',
    'Eating Out in Bahrain Guide',
    'Men & Women 30-Day Workouts',
  ];

  ctx.textAlign = 'left';
  ctx.font = '500 32px sans-serif';
  highlights.forEach((line, idx) => {
    const y = 390 + idx * 88;
    ctx.fillStyle = '#4ade80';
    ctx.fillText('0' + (idx + 1) + '.', 140, y);
    ctx.fillStyle = '#f5f5f4';
    ctx.fillText(line, 210, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#bbf7d0';
  ctx.font = '600 36px sans-serif';
  ctx.fillText('دليل عملي ثنائي اللغة — البحرين', 512, 1030);

  ctx.fillStyle = '#a8a29e';
  ctx.font = '400 24px sans-serif';
  ctx.fillText('Practical 30-Day Guide · Manama, Kingdom of Bahrain', 512, 1110);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(382, 1180, 260, 110);
  ctx.fillStyle = '#0a0a0a';
  for (let x = 402; x < 622; x += 7) {
    const w = (x % 3) + 2;
    ctx.fillRect(x, 1196, w, 68);
  }
  ctx.font = '18px monospace';
  ctx.fillText('BHN-2026-KETO-30D', 512, 1282);

  return finalizeColorTexture(canvas, maxAnisotropy);
}

export function createSpineTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#072e1d';
  ctx.fillRect(0, 0, 256, 1440);

  ctx.fillStyle = '#d4af37';
  ctx.fillRect(0, 72, 256, 6);
  ctx.fillRect(0, 1362, 256, 6);

  ctx.save();
  ctx.translate(128, 720);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('KETOLIFE BAHRAIN  ·  30-DAY KETO', 0, 0);
  ctx.restore();

  return finalizeColorTexture(canvas, maxAnisotropy);
}

export function createPageEdgeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f3efe6';
  ctx.fillRect(0, 0, 256, 512);

  for (let x = 0; x < 256; x += 3) {
    ctx.fillStyle = x % 6 === 0 ? 'rgba(180, 170, 150, 0.35)' : 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(x, 0, 1, 512);
  }

  return finalizeColorTexture(canvas, maxAnisotropy);
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke: string,
  lineWidth = 3,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

export function createInnerSpreadTextures(maxAnisotropy: number): {
  leftPage: THREE.CanvasTexture;
  rightPage: THREE.CanvasTexture;
} {
  const paintPaperBase = (ctx: CanvasRenderingContext2D, side: 'left' | 'right') => {
    // Realistic warm uncoated book paper (avoids pure-white glare under studio lights)
    ctx.fillStyle = '#e7e2d4';
    ctx.fillRect(0, 0, 1024, 1440);

    // Subtle organic paper fiber grain
    for (let i = 0; i < 4500; i++) {
      const px = seededNoise(i, 1, side === 'left' ? 1.3 : 2.9) * 1024;
      const py = seededNoise(i, 2, side === 'left' ? 4.7 : 6.1) * 1440;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 252, 244, 0.25)' : 'rgba(120, 110, 90, 0.06)';
      ctx.fillRect(px, py, 2, 2);
    }

    // Subtle outer page edge darkening + realistic inner binding crease gradient
    if (side === 'left') {
      const outer = ctx.createLinearGradient(0, 0, 32, 0);
      outer.addColorStop(0, 'rgba(70, 62, 48, 0.16)');
      outer.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outer;
      ctx.fillRect(0, 0, 32, 1440);

      const gutter = ctx.createLinearGradient(910, 0, 1024, 0);
      gutter.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gutter.addColorStop(0.65, 'rgba(25, 20, 15, 0.14)');
      gutter.addColorStop(1, 'rgba(10, 10, 8, 0.42)');
      ctx.fillStyle = gutter;
      ctx.fillRect(910, 0, 114, 1440);
    } else {
      const outer = ctx.createLinearGradient(992, 0, 1024, 0);
      outer.addColorStop(0, 'rgba(0, 0, 0, 0)');
      outer.addColorStop(1, 'rgba(70, 62, 48, 0.16)');
      ctx.fillStyle = outer;
      ctx.fillRect(992, 0, 32, 1440);

      const gutter = ctx.createLinearGradient(0, 0, 114, 0);
      gutter.addColorStop(0, 'rgba(10, 10, 8, 0.42)');
      gutter.addColorStop(0.35, 'rgba(25, 20, 15, 0.14)');
      gutter.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gutter;
      ctx.fillRect(0, 0, 114, 1440);
    }
  };

  // === LEFT PAGE (PAGE 02: Welcome & How to Use) ===
  const cL = document.createElement('canvas');
  cL.width = 1024;
  cL.height = 1440;
  const ctxL = cL.getContext('2d')!;

  const drawPage2 = (coverImg?: HTMLImageElement) => {
    paintPaperBase(ctxL, 'left');

    // Running book header
    ctxL.fillStyle = '#44403c';
    ctxL.font = 'bold 21px sans-serif';
    ctxL.textAlign = 'left';
    ctxL.fillText('02   KETOLIFE BAHRAIN', 74, 72);
    ctxL.textAlign = 'right';
    ctxL.fillText('30-DAY BILINGUAL GUIDE', 936, 72);
    ctxL.fillStyle = '#0f5132';
    ctxL.fillRect(74, 88, 862, 3);

    // Chapter Heading
    ctxL.textAlign = 'left';
    ctxL.fillStyle = '#064e3b';
    ctxL.font = 'bold 52px sans-serif';
    ctxL.fillText('Welcome & How to Use', 74, 162);
    ctxL.fillStyle = '#0a0a0a';
    ctxL.font = 'bold 34px sans-serif';
    ctxL.textAlign = 'right';
    ctxL.fillText('مرحباً بك وكيف تستخدم الدليل', 936, 212);

    // Subtle rule
    ctxL.fillStyle = 'rgba(15, 81, 50, 0.25)';
    ctxL.fillRect(74, 238, 862, 2);

    // Section 1: Bold Black Editorial Copy
    ctxL.textAlign = 'left';
    ctxL.fillStyle = '#064e3b';
    ctxL.font = 'bold 32px sans-serif';
    ctxL.fillText('WELCOME TO KETOLIFE BAHRAIN', 74, 294);

    ctxL.fillStyle = '#050505';
    ctxL.font = 'bold 29px sans-serif';
    const introLines = wrapTextLines(
      ctxL,
      'A practical 30-day bilingual guide combining low-carb meals, simple recipes, weekly prep, and beginner workouts.',
      850,
    );
    introLines.forEach((line, i) => {
      ctxL.fillText(line, 74, 348 + i * 42);
    });

    ctxL.textAlign = 'right';
    ctxL.fillStyle = '#050505';
    ctxL.font = 'bold 28px sans-serif';
    ctxL.fillText('دليل عملي لمدة ٣٠ يوماً للوجبات منخفضة الكربوهيدرات', 936, 514);
    ctxL.fillText('والوصفات السهلة وتحضير الطعام وتمارين المبتدئين.', 936, 554);

    // Center Printed Book Plate Illustration (Authentic Cover Artwork)
    ctxL.strokeStyle = 'rgba(15, 81, 50, 0.32)';
    ctxL.lineWidth = 2;
    ctxL.fillStyle = '#f2efe6';
    ctxL.fillRect(190, 594, 630, 444);
    ctxL.strokeRect(190, 594, 630, 444);
    if (coverImg) {
      const srcW = coverImg.naturalWidth;
      const srcH = coverImg.naturalHeight;
      ctxL.drawImage(
        coverImg,
        0,
        Math.round(srcH * 0.14),
        srcW,
        Math.round(srcH * 0.72),
        295,
        608,
        420,
        420,
      );
    } else {
      ctxL.textAlign = 'center';
      ctxL.fillStyle = '#064e3b';
      ctxL.font = 'bold 42px sans-serif';
      ctxL.fillText('KETOLIFE BAHRAIN', 505, 825);
    }

    // Bottom Important Editorial Note
    ctxL.fillStyle = 'rgba(15, 81, 50, 0.25)';
    ctxL.fillRect(74, 1074, 862, 2);

    ctxL.textAlign = 'left';
    ctxL.fillStyle = '#064e3b';
    ctxL.font = 'bold 30px sans-serif';
    ctxL.fillText('IMPORTANT · مهم', 74, 1126);

    ctxL.fillStyle = '#050505';
    ctxL.font = 'bold 27px sans-serif';
    ctxL.fillText('Use this guide as general education. Daily calorie', 74, 1176);
    ctxL.fillText('needs and progress vary for every individual.', 74, 1216);

    ctxL.textAlign = 'right';
    ctxL.fillStyle = '#050505';
    ctxL.font = 'bold 27px sans-serif';
    ctxL.fillText('استخدم الدليل للتثقيف العام · النتائج تختلف من شخص لآخر.', 936, 1272);

    // Page Folio Footer
    ctxL.fillStyle = 'rgba(15, 81, 50, 0.25)';
    ctxL.fillRect(74, 1344, 862, 2);
    ctxL.textAlign = 'left';
    ctxL.fillStyle = '#1c1917';
    ctxL.font = 'bold 22px sans-serif';
    ctxL.fillText('02', 74, 1384);
    ctxL.textAlign = 'right';
    ctxL.fillText('Practical Guide · Not Medical Advice', 936, 1384);
  };

  drawPage2();
  const leftPage = finalizeColorTexture(cL, maxAnisotropy);

  const imgCover = new Image();
  imgCover.crossOrigin = 'anonymous';
  imgCover.onload = () => {
    drawPage2(imgCover);
    leftPage.needsUpdate = true;
  };
  imgCover.src = BOOK_COVER_IMAGE_URL;

  // === RIGHT PAGE (PAGE 03: What Is Keto?) ===
  const cR = document.createElement('canvas');
  cR.width = 1024;
  cR.height = 1440;
  const ctxR = cR.getContext('2d')!;

  paintPaperBase(ctxR, 'right');

  // Running book header
  ctxR.fillStyle = '#44403c';
  ctxR.font = 'bold 21px sans-serif';
  ctxR.textAlign = 'left';
  ctxR.fillText('WHAT IS KETO?', 88, 72);
  ctxR.textAlign = 'right';
  ctxR.fillText('03', 950, 72);
  ctxR.fillStyle = '#0f5132';
  ctxR.fillRect(88, 88, 862, 3);

  // Chapter Heading
  ctxR.textAlign = 'left';
  ctxR.fillStyle = '#064e3b';
  ctxR.font = 'bold 54px sans-serif';
  ctxR.fillText('What Is Keto?', 88, 162);
  ctxR.textAlign = 'right';
  ctxR.fillStyle = '#0a0a0a';
  ctxR.font = 'bold 38px sans-serif';
  ctxR.fillText('ما هو الكيتو؟', 950, 212);

  ctxR.fillStyle = 'rgba(15, 81, 50, 0.25)';
  ctxR.fillRect(88, 238, 862, 2);

  // 4 Core Keto Principles in Clean Editorial Book Layout
  const pillars: [string, string, string, string][] = [
    ['01', 'Lower Carbohydrate Intake', 'Cut refined sugar, bread & rice', 'تقليل تناول الكربوهيدرات'],
    ['02', 'Adequate Daily Protein', 'Clean fish, poultry & whole eggs', 'كمية مناسبة من البروتين'],
    ['03', 'Healthy Natural Fats', 'Olive oil, avocado & roasted nuts', 'اختيار الدهون الصحية'],
    ['04', 'Non-Starchy Vegetables', 'Leafy greens, broccoli & cucumber', 'الإكثار من الخضروات غير النشوية'],
  ];

  pillars.forEach(([num, en, sub, ar], idx) => {
    const y = 278 + idx * 158;

    // Emerald numeral accent
    ctxR.textAlign = 'left';
    ctxR.fillStyle = '#064e3b';
    ctxR.font = 'bold 42px sans-serif';
    ctxR.fillText(`${num}.`, 88, y + 40);

    // Bold black primary keyword heading
    ctxR.fillStyle = '#050505';
    ctxR.font = 'bold 34px sans-serif';
    ctxR.fillText(en, 168, y + 36);

    // Concise subtext
    ctxR.fillStyle = '#1c1917';
    ctxR.font = 'bold 24px sans-serif';
    ctxR.fillText(sub, 168, y + 74);

    // Arabic right-aligned keyword
    ctxR.textAlign = 'right';
    ctxR.fillStyle = '#064e3b';
    ctxR.font = 'bold 28px sans-serif';
    ctxR.fillText(ar, 950, y + 114);

    if (idx < pillars.length - 1) {
      ctxR.fillStyle = 'rgba(15, 81, 50, 0.2)';
      ctxR.fillRect(88, y + 134, 862, 2);
    }
  });

  // Clean Editorial Formula Highlight Strip
  ctxR.fillStyle = '#d8e3d2';
  ctxR.fillRect(88, 934, 862, 260);
  ctxR.fillStyle = '#064e3b';
  ctxR.fillRect(88, 934, 10, 260);

  ctxR.textAlign = 'left';
  ctxR.fillStyle = '#064e3b';
  ctxR.font = 'bold 34px sans-serif';
  ctxR.fillText('SIMPLE PLATE FORMULA', 124, 992);
  ctxR.textAlign = 'right';
  ctxR.font = 'bold 32px sans-serif';
  ctxR.fillText('قاعدة الطبق البسيط', 922, 992);

  ctxR.textAlign = 'left';
  ctxR.fillStyle = '#050505';
  ctxR.font = 'bold 32px sans-serif';
  ctxR.fillText('Protein + Non-Starchy Greens', 124, 1058);
  ctxR.fillText('+ Sensible Portion of Healthy Fat', 124, 1102);

  ctxR.textAlign = 'right';
  ctxR.fillStyle = '#050505';
  ctxR.font = 'bold 29px sans-serif';
  ctxR.fillText('البروتين + خضروات غير نشوية + كمية مناسبة من الدهون الصحية', 922, 1164);

  // Pull Quote Line
  ctxR.textAlign = 'center';
  ctxR.fillStyle = '#050505';
  ctxR.font = 'bold 30px sans-serif';
  ctxR.fillText('FAT ADAPTATION  ·  STEADY ENERGY  ·  ZERO SUGAR', 519, 1262);
  ctxR.fillStyle = '#064e3b';
  ctxR.font = 'bold 28px sans-serif';
  ctxR.fillText('طاقة مستقرة  ·  شبع طبيعي  ·  بدون سكر', 519, 1308);

  // Page Folio Footer
  ctxR.fillStyle = 'rgba(15, 81, 50, 0.25)';
  ctxR.fillRect(88, 1344, 862, 2);
  ctxR.textAlign = 'left';
  ctxR.fillStyle = '#1c1917';
  ctxR.font = 'bold 22px sans-serif';
  ctxR.fillText('30-Day Keto Guide · Bahrain', 88, 1384);
  ctxR.textAlign = 'right';
  ctxR.fillText('03', 950, 1384);

  const rightPage = finalizeColorTexture(cR, maxAnisotropy);

  return { leftPage, rightPage };
}

export function createAvocadoTextures(maxAnisotropy: number): {
  skinMap: THREE.CanvasTexture;
  skinBump: THREE.CanvasTexture;
  fleshMap: THREE.CanvasTexture;
  pitMap: THREE.CanvasTexture;
} {
  // 1. Pebbled Hass Avocado Skin
  const cSkin = document.createElement('canvas');
  cSkin.width = 512;
  cSkin.height = 512;
  const ctxS = cSkin.getContext('2d')!;
  const cSkinBump = document.createElement('canvas');
  cSkinBump.width = 512;
  cSkinBump.height = 512;
  const ctxSB = cSkinBump.getContext('2d')!;

  ctxS.fillStyle = '#142611';
  ctxS.fillRect(0, 0, 512, 512);
  ctxSB.fillStyle = '#404040';
  ctxSB.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 3200; i++) {
    const x = seededNoise(i, 1, 2.1) * 512;
    const y = seededNoise(i, 2, 3.4) * 512;
    const r = 2.0 + seededNoise(i, 3, 5.2) * 4.5;
    const shade = seededNoise(i, 4, 8.9);

    ctxS.fillStyle =
      shade > 0.65 ? '#24411b' : shade > 0.3 ? '#172b13' : '#0d1a0b';
    ctxS.beginPath();
    ctxS.arc(x, y, r, 0, Math.PI * 2);
    ctxS.fill();

    const g = ctxSB.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, '#f0f0f0');
    g.addColorStop(1, '#303030');
    ctxSB.fillStyle = g;
    ctxSB.beginPath();
    ctxSB.arc(x, y, r, 0, Math.PI * 2);
    ctxSB.fill();
  }

  // 2. Creamy Avocado Cut Flesh (Outer dark green rim -> bright lime -> buttery yellow center)
  const cFlesh = document.createElement('canvas');
  cFlesh.width = 512;
  cFlesh.height = 512;
  const ctxF = cFlesh.getContext('2d')!;
  const fleshGrad = ctxF.createRadialGradient(256, 266, 36, 256, 256, 240);
  fleshGrad.addColorStop(0.0, '#fef08a');
  fleshGrad.addColorStop(0.32, '#e8f584');
  fleshGrad.addColorStop(0.72, '#a3e635');
  fleshGrad.addColorStop(0.92, '#4d7c0f');
  fleshGrad.addColorStop(1.0, '#1e3a15');
  ctxF.fillStyle = fleshGrad;
  ctxF.fillRect(0, 0, 512, 512);

  // Subtle natural flesh texture fibers
  ctxF.fillStyle = 'rgba(255, 255, 255, 0.06)';
  for (let i = 0; i < 400; i++) {
    const px = seededNoise(i, 10, 1.7) * 512;
    const py = seededNoise(i, 20, 4.9) * 512;
    ctxF.fillRect(px, py, 3, 2);
  }

  // 3. Fibrous Mahogany Avocado Pit
  const cPit = document.createElement('canvas');
  cPit.width = 256;
  cPit.height = 256;
  const ctxP = cPit.getContext('2d')!;
  const pitGrad = ctxP.createLinearGradient(0, 0, 256, 256);
  pitGrad.addColorStop(0, '#6e3b1b');
  pitGrad.addColorStop(0.5, '#4c250d');
  pitGrad.addColorStop(1, '#341606');
  ctxP.fillStyle = pitGrad;
  ctxP.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 240; i++) {
    const x = seededNoise(i, 5, 9.2) * 256;
    const y = seededNoise(i, 6, 3.3) * 256;
    ctxP.strokeStyle = 'rgba(180, 120, 75, 0.16)';
    ctxP.lineWidth = 1.5;
    ctxP.beginPath();
    ctxP.moveTo(x, y);
    ctxP.lineTo(x + 12, y + 24);
    ctxP.stroke();
  }

  return {
    skinMap: finalizeColorTexture(cSkin, maxAnisotropy),
    skinBump: finalizeDataTexture(cSkinBump, maxAnisotropy),
    fleshMap: finalizeColorTexture(cFlesh, maxAnisotropy),
    pitMap: finalizeColorTexture(cPit, maxAnisotropy),
  };
}

export function createSalmonTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cBump = document.createElement('canvas');
  cBump.width = 512;
  cBump.height = 512;
  const ctxB = cBump.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#fb7152');
  grad.addColorStop(0.45, '#f45e3e');
  grad.addColorStop(1, '#d9482b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctxB.fillStyle = '#909090';
  ctxB.fillRect(0, 0, 512, 512);

  // Authentic curved salmon myomere fat striations + subtle muscle depth
  for (let i = -220; i < 740; i += 28) {
    ctx.strokeStyle = 'rgba(255, 240, 228, 0.85)';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + 44, 170, i - 34, 340, i + 26, 512);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(180, 45, 20, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(i + 8, 0);
    ctx.bezierCurveTo(i + 52, 170, i - 26, 340, i + 34, 512);
    ctx.stroke();

    ctxB.strokeStyle = '#404040';
    ctxB.lineWidth = 5;
    ctxB.beginPath();
    ctxB.moveTo(i, 0);
    ctxB.bezierCurveTo(i + 44, 170, i - 34, 340, i + 26, 512);
    ctxB.stroke();
  }

  // Cracked black pepper & sea salt crystals on seared fillet
  for (let i = 0; i < 95; i++) {
    const px = seededNoise(i, 1, 7.7) * 512;
    const py = seededNoise(i, 2, 8.8) * 512;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(28,25,23,0.75)';
    ctx.fillRect(px, py, 3.5, 3.5);
  }

  return {
    map: finalizeColorTexture(canvas, maxAnisotropy),
    bumpMap: finalizeDataTexture(cBump, maxAnisotropy),
  };
}

export function createChickenTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cBump = document.createElement('canvas');
  cBump.width = 512;
  cBump.height = 512;
  const ctxB = cBump.getContext('2d')!;

  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 290);
  grad.addColorStop(0, '#f3ca94');
  grad.addColorStop(0.55, '#dca162');
  grad.addColorStop(1, '#a8652c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctxB.fillStyle = '#a0a0a0';
  ctxB.fillRect(0, 0, 512, 512);

  // Subtle grilled poultry fiber grain
  for (let i = 0; i < 900; i++) {
    const x = seededNoise(i, 3, 2.2) * 512;
    const y = seededNoise(i, 4, 5.1) * 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 240, 215, 0.14)' : 'rgba(110, 52, 12, 0.14)';
    ctx.fillRect(x, y, 16, 2);
  }

  // Authentic diamond sear grill marks
  ctx.lineWidth = 14;
  ctxB.lineWidth = 14;
  for (let i = -280; i < 780; i += 76) {
    ctx.strokeStyle = 'rgba(62, 22, 4, 0.72)';
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 260, 512);
    ctx.stroke();

    ctxB.strokeStyle = '#252525';
    ctxB.beginPath();
    ctxB.moveTo(i, 0);
    ctxB.lineTo(i + 260, 512);
    ctxB.stroke();
  }

  // Fine dried oregano, rosemary & paprika seasoning specks
  for (let i = 0; i < 160; i++) {
    const x = seededNoise(i, 7, 1.4) * 512;
    const y = seededNoise(i, 8, 6.6) * 512;
    ctx.fillStyle = i % 3 === 0 ? '#14532d' : i % 3 === 1 ? '#b91c1c' : '#292524';
    ctx.fillRect(x, y, 4, 3);
  }

  return {
    map: finalizeColorTexture(canvas, maxAnisotropy),
    bumpMap: finalizeDataTexture(cBump, maxAnisotropy),
  };
}

export function createLemonTextures(maxAnisotropy: number): {
  sliceMap: THREE.CanvasTexture;
  sliceBump: THREE.CanvasTexture;
  rindBump: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cBump = document.createElement('canvas');
  cBump.width = 512;
  cBump.height = 512;
  const ctxB = cBump.getContext('2d')!;

  ctx.fillStyle = '#fefce8';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(256, 256, 246, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fefce8';
  ctx.beginPath();
  ctx.arc(256, 256, 222, 0, Math.PI * 2);
  ctx.fill();

  ctxB.fillStyle = '#d0d0d0';
  ctxB.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 9; i++) {
    const start = (i * Math.PI * 2) / 9 + 0.045;
    const end = ((i + 1) * Math.PI * 2) / 9 - 0.045;
    const g = ctx.createRadialGradient(256, 256, 18, 256, 256, 202);
    g.addColorStop(0, '#fef08a');
    g.addColorStop(0.5, '#fde047');
    g.addColorStop(1, '#eab308');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.arc(256, 256, 200, start, end);
    ctx.closePath();
    ctx.fill();

    ctxB.fillStyle = '#757575';
    ctxB.beginPath();
    ctxB.moveTo(256, 256);
    ctxB.arc(256, 256, 198, start, end);
    ctxB.closePath();
    ctxB.fill();
  }

  // Juice vesicle cells texture inside citrus segments
  for (let i = 0; i < 600; i++) {
    const a = seededNoise(i, 1, 3.1) * Math.PI * 2;
    const r = 24 + seededNoise(i, 2, 4.2) * 168;
    const vx = 256 + Math.cos(a) * r;
    const vy = 256 + Math.sin(a) * r;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(vx, vy, 2.5, 2.5);
  }

  ctx.fillStyle = '#fefce8';
  ctx.beginPath();
  ctx.arc(256, 256, 18, 0, Math.PI * 2);
  ctx.fill();

  // Dimpled citrus peel bump map
  const cRind = document.createElement('canvas');
  cRind.width = 256;
  cRind.height = 256;
  const ctxR = cRind.getContext('2d')!;
  ctxR.fillStyle = '#a0a0a0';
  ctxR.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const x = seededNoise(i, 5, 9.1) * 256;
    const y = seededNoise(i, 6, 4.4) * 256;
    ctxR.fillStyle = '#383838';
    ctxR.beginPath();
    ctxR.arc(x, y, 2.1, 0, Math.PI * 2);
    ctxR.fill();
  }

  return {
    sliceMap: finalizeColorTexture(canvas, maxAnisotropy),
    sliceBump: finalizeDataTexture(cBump, maxAnisotropy),
    rindBump: finalizeDataTexture(cRind, maxAnisotropy),
  };
}

export function createCucumberTextures(maxAnisotropy: number): {
  sliceMap: THREE.CanvasTexture;
  skinMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 0, 256, 256);

  const rim = ctx.createRadialGradient(128, 128, 42, 128, 128, 118);
  rim.addColorStop(0, '#ecfccb');
  rim.addColorStop(0.65, '#bbf7d0');
  rim.addColorStop(0.92, '#86efac');
  rim.addColorStop(1, '#15803d');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(128, 128, 116, 0, Math.PI * 2);
  ctx.fill();

  // Translucent tri-lobed wet seed core
  ctx.fillStyle = 'rgba(220, 252, 231, 0.85)';
  for (let k = 0; k < 3; k++) {
    const ka = (k * Math.PI * 2) / 3;
    ctx.save();
    ctx.translate(128 + Math.cos(ka) * 22, 128 + Math.sin(ka) * 22);
    ctx.rotate(ka);
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = '#fef9c3';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.save();
    ctx.translate(128 + Math.cos(a) * 38, 128 + Math.sin(a) * 38);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const cSkin = document.createElement('canvas');
  cSkin.width = 256;
  cSkin.height = 256;
  const ctxS = cSkin.getContext('2d')!;
  const cBump = document.createElement('canvas');
  cBump.width = 256;
  cBump.height = 256;
  const ctxB = cBump.getContext('2d')!;

  ctxS.fillStyle = '#15803d';
  ctxS.fillRect(0, 0, 256, 256);
  ctxB.fillStyle = '#808080';
  ctxB.fillRect(0, 0, 256, 256);

  for (let x = 0; x < 256; x += 12) {
    ctxS.fillStyle = 'rgba(10, 48, 22, 0.35)';
    ctxS.fillRect(x, 0, 4, 256);
    ctxB.fillStyle = '#404040';
    ctxB.fillRect(x, 0, 4, 256);
  }

  return {
    sliceMap: finalizeColorTexture(canvas, maxAnisotropy),
    skinMap: finalizeColorTexture(cSkin, maxAnisotropy),
    bumpMap: finalizeDataTexture(cBump, maxAnisotropy),
  };
}

export function createCheeseTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cBump = document.createElement('canvas');
  cBump.width = 512;
  cBump.height = 512;
  const ctxB = cBump.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.6, '#fde047');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctxB.fillStyle = '#c8c8c8';
  ctxB.fillRect(0, 0, 512, 512);

  // Subtle artisan Swiss/cheddar air eyes & crumbly dairy texture
  for (let i = 0; i < 26; i++) {
    const x = 35 + seededNoise(i, 1, 4.1) * 442;
    const y = 35 + seededNoise(i, 2, 7.3) * 442;
    const r = 8 + seededNoise(i, 3, 2.5) * 24;

    const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 2, x, y, r);
    g.addColorStop(0, '#d97706');
    g.addColorStop(0.7, '#eab308');
    g.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    const gb = ctxB.createRadialGradient(x, y, 2, x, y, r);
    gb.addColorStop(0, '#181818');
    gb.addColorStop(1, '#c8c8c8');
    ctxB.fillStyle = gb;
    ctxB.beginPath();
    ctxB.arc(x, y, r, 0, Math.PI * 2);
    ctxB.fill();
  }

  return {
    map: finalizeColorTexture(canvas, maxAnisotropy),
    bumpMap: finalizeDataTexture(cBump, maxAnisotropy),
  };
}

export function createAlmondTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cBump = document.createElement('canvas');
  cBump.width = 256;
  cBump.height = 256;
  const ctxB = cBump.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#78350f');
  grad.addColorStop(0.5, '#9a4c14');
  grad.addColorStop(1, '#682b08');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctxB.fillStyle = '#909090';
  ctxB.fillRect(0, 0, 256, 256);

  // Longitudinal grooved roasted almond hull texture
  for (let x = 0; x < 256; x += 6) {
    ctx.strokeStyle = x % 12 === 0 ? 'rgba(60, 24, 4, 0.45)' : 'rgba(217, 119, 6, 0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 8, 85, x - 8, 170, x, 256);
    ctx.stroke();

    ctxB.strokeStyle = x % 12 === 0 ? '#282828' : '#e0e0e0';
    ctxB.lineWidth = 2;
    ctxB.beginPath();
    ctxB.moveTo(x, 0);
    ctxB.bezierCurveTo(x + 8, 85, x - 8, 170, x, 256);
    ctxB.stroke();
  }

  return {
    map: finalizeColorTexture(canvas, maxAnisotropy),
    bumpMap: finalizeDataTexture(cBump, maxAnisotropy),
  };
}

export function createLeafTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cBump = document.createElement('canvas');
  cBump.width = 256;
  cBump.height = 256;
  const ctxB = cBump.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#15803d');
  grad.addColorStop(0.5, '#16a34a');
  grad.addColorStop(1, '#14532d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctxB.fillStyle = '#7a7a7a';
  ctxB.fillRect(0, 0, 256, 256);

  // Midrib + branching organic botanical veins
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 250);
  ctx.lineTo(128, 12);
  ctx.stroke();

  ctxB.strokeStyle = '#ffffff';
  ctxB.lineWidth = 5;
  ctxB.beginPath();
  ctxB.moveTo(128, 250);
  ctxB.lineTo(128, 12);
  ctxB.stroke();

  for (let y = 36; y < 225; y += 26) {
    ctx.strokeStyle = 'rgba(134, 239, 172, 0.52)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(78, y - 14, 34, y - 34);
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(178, y - 14, 222, y - 34);
    ctx.stroke();

    ctxB.strokeStyle = '#dcdcdc';
    ctxB.lineWidth = 2.5;
    ctxB.beginPath();
    ctxB.moveTo(128, y);
    ctxB.quadraticCurveTo(78, y - 14, 34, y - 34);
    ctxB.moveTo(128, y);
    ctxB.quadraticCurveTo(178, y - 14, 222, y - 34);
    ctxB.stroke();
  }

  return {
    map: finalizeColorTexture(canvas, maxAnisotropy),
    bumpMap: finalizeDataTexture(cBump, maxAnisotropy),
  };
}

export function createGarlicTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cBump = document.createElement('canvas');
  cBump.width = 256;
  cBump.height = 256;
  const ctxB = cBump.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#f3e8ff');
  grad.addColorStop(0.45, '#fafaf9');
  grad.addColorStop(1, '#e7d8f5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctxB.fillStyle = '#909090';
  ctxB.fillRect(0, 0, 256, 256);

  for (let x = 0; x < 256; x += 8) {
    ctx.strokeStyle = x % 24 === 0 ? 'rgba(147, 51, 234, 0.22)' : 'rgba(214, 211, 209, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();

    ctxB.strokeStyle = x % 16 === 0 ? '#505050' : '#d5d5d5';
    ctxB.lineWidth = 2;
    ctxB.beginPath();
    ctxB.moveTo(x, 0);
    ctxB.lineTo(x, 256);
    ctxB.stroke();
  }

  return {
    map: finalizeColorTexture(canvas, maxAnisotropy),
    bumpMap: finalizeDataTexture(cBump, maxAnisotropy),
  };
}

export function createFloretBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#505050';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 1600; i++) {
    const x = seededNoise(i, 1, 6.2) * 256;
    const y = seededNoise(i, 2, 1.9) * 256;
    const r = 2 + seededNoise(i, 3, 8.1) * 4;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#303030');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeDataTexture(canvas, maxAnisotropy);
}

export function createGlowSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(255, 235, 165, 0.9)');
  grad.addColorStop(0.6, 'rgba(52, 211, 153, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
