import * as THREE from 'three';
import {
  createBackCoverTexture,
  createFrontCoverTexture,
  createInnerSpreadTextures,
  createPageEdgeTexture,
  createSpineTexture,
} from './proceduralTextures';

export interface BookModel {
  group: THREE.Group;
  frontHinge: THREE.Group;
  hitProxy: THREE.Mesh;
  setOpenProgress: (t: number) => void;
  dispose: () => void;
}

export function createKetoBookModel(maxAnisotropy: number, isSoftwareGl: boolean): BookModel {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];

  const bookW = 2.15;
  const bookH = 3.0;
  const boardThick = 0.055;
  const pageBlockThick = 0.24;

  const frontTex = createFrontCoverTexture(maxAnisotropy);
  const backTex = createBackCoverTexture(maxAnisotropy);
  const spineTex = createSpineTexture(maxAnisotropy);
  const edgeTex = createPageEdgeTexture(maxAnisotropy);
  const { leftPage, rightPage } = createInnerSpreadTextures(maxAnisotropy);
  disposables.push(frontTex, backTex, spineTex, edgeTex, leftPage, rightPage);

  const clothMat = new THREE.MeshStandardMaterial({
    color: 0x093823,
    roughness: 0.65,
    metalness: 0.08,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.22,
    metalness: 0.92,
  });

  const frontCoverMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    roughness: 0.34,
    metalness: 0.08,
  });

  const backCoverMat = new THREE.MeshStandardMaterial({
    map: backTex,
    roughness: 0.38,
    metalness: 0.1,
  });

  const spineMat = new THREE.MeshStandardMaterial({
    map: spineTex,
    roughness: 0.42,
    metalness: 0.15,
  });

  const pageEdgeMat = new THREE.MeshStandardMaterial({
    map: edgeTex,
    roughness: 0.85,
    metalness: 0.0,
  });

  const leftPageMat = new THREE.MeshStandardMaterial({
    map: leftPage,
    color: 0xd6d0c4,
    roughness: 0.98,
    metalness: 0.0,
    envMapIntensity: 0.08,
  });

  const rightPageMat = new THREE.MeshStandardMaterial({
    map: rightPage,
    color: 0xd6d0c4,
    roughness: 0.98,
    metalness: 0.0,
    envMapIntensity: 0.08,
  });

  disposables.push(
    clothMat,
    goldTrimMat,
    frontCoverMat,
    backCoverMat,
    spineMat,
    pageEdgeMat,
    leftPageMat,
    rightPageMat,
  );

  // 1. Back Cover Board
  const backGeo = new THREE.BoxGeometry(bookW, bookH, boardThick);
  const backMesh = new THREE.Mesh(backGeo, [
    clothMat,
    clothMat,
    clothMat,
    clothMat,
    clothMat,
    backCoverMat,
  ]);
  backMesh.position.set(0, 0, -(pageBlockThick / 2 + boardThick / 2));
  backMesh.castShadow = !isSoftwareGl;
  backMesh.receiveShadow = !isSoftwareGl;
  group.add(backMesh);
  disposables.push(backGeo);

  // 2. Spine Strip
  const totalDepth = pageBlockThick + boardThick * 2;
  const spineGeo = new THREE.BoxGeometry(0.08, bookH, totalDepth);
  const spineMesh = new THREE.Mesh(spineGeo, [
    clothMat,
    spineMat,
    clothMat,
    clothMat,
    clothMat,
    clothMat,
  ]);
  spineMesh.position.set(-bookW / 2 - 0.02, 0, 0);
  spineMesh.castShadow = !isSoftwareGl;
  group.add(spineMesh);
  disposables.push(spineGeo);

  // 3. Page Block
  const pagesGeo = new THREE.BoxGeometry(bookW - 0.09, bookH - 0.12, pageBlockThick);
  const pagesMesh = new THREE.Mesh(pagesGeo, [
    pageEdgeMat,
    clothMat,
    pageEdgeMat,
    pageEdgeMat,
    rightPageMat,
    pageEdgeMat,
  ]);
  pagesMesh.position.set(0.015, 0, 0);
  pagesMesh.castShadow = !isSoftwareGl;
  pagesMesh.receiveShadow = !isSoftwareGl;
  group.add(pagesMesh);
  disposables.push(pagesGeo);

  // 4. Hinged Front Cover Group
  const frontHinge = new THREE.Group();
  frontHinge.position.set(-bookW / 2, 0, pageBlockThick / 2 + boardThick / 2);
  group.add(frontHinge);

  const frontGeo = new THREE.BoxGeometry(bookW, bookH, boardThick);
  const frontMesh = new THREE.Mesh(frontGeo, [
    clothMat,
    clothMat,
    clothMat,
    clothMat,
    frontCoverMat,
    clothMat,
  ]);
  frontMesh.position.set(bookW / 2, 0, 0);
  frontMesh.castShadow = !isSoftwareGl;
  frontMesh.receiveShadow = !isSoftwareGl;
  frontHinge.add(frontMesh);
  disposables.push(frontGeo);

  // 5. Inner Left Spread Page
  const innerLeftGeo = new THREE.PlaneGeometry(bookW - 0.14, bookH - 0.16);
  const innerLeftMesh = new THREE.Mesh(innerLeftGeo, leftPageMat);
  innerLeftMesh.position.set(bookW / 2 + 0.02, 0, -boardThick / 2 - 0.008);
  innerLeftMesh.rotation.y = Math.PI;
  frontHinge.add(innerLeftMesh);
  disposables.push(innerLeftGeo);

  // 6. Brushed Gold Corner Protectors
  const cornerGeo = new THREE.BoxGeometry(0.16, 0.16, boardThick + 0.016);
  const topCorner = new THREE.Mesh(cornerGeo, goldTrimMat);
  topCorner.position.set(bookW - 0.06, bookH / 2 - 0.06, 0);
  const botCorner = new THREE.Mesh(cornerGeo, goldTrimMat);
  botCorner.position.set(bookW - 0.06, -bookH / 2 + 0.06, 0);
  frontHinge.add(topCorner, botCorner);
  disposables.push(cornerGeo);

  // 7. Gold Spine Caps
  const capGeo = new THREE.BoxGeometry(0.1, 0.06, totalDepth + 0.015);
  const topCap = new THREE.Mesh(capGeo, goldTrimMat);
  topCap.position.set(-bookW / 2 - 0.02, bookH / 2 - 0.02, 0);
  const botCap = new THREE.Mesh(capGeo, goldTrimMat);
  botCap.position.set(-bookW / 2 - 0.02, -bookH / 2 + 0.02, 0);
  group.add(topCap, botCap);
  disposables.push(capGeo);

  // 8. Invisible Raycast Collider on Layer 1 so clicking the 3D book triggers interactive spread/buy
  const hitGeo = new THREE.BoxGeometry(bookW + 0.15, bookH + 0.15, totalDepth + 0.25);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitProxy = new THREE.Mesh(hitGeo, hitMat);
  hitProxy.layers.set(1);
  hitProxy.userData.isBook = true;
  group.add(hitProxy);
  disposables.push(hitGeo, hitMat);

  return {
    group,
    frontHinge,
    hitProxy,
    setOpenProgress(t: number) {
      const clamped = THREE.MathUtils.clamp(t, 0, 1);
      frontHinge.rotation.y = -clamped * Math.PI * 0.88;
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
