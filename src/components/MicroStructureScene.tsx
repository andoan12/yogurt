import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  BacteriaOption,
  MilkOption,
  SimulationMetrics,
  StageId,
} from '../types/fermentation';
import { Eye, RotateCcw } from 'lucide-react';

interface MicroStructureSceneProps {
  milk: MilkOption;
  bacteria: BacteriaOption;
  metrics: SimulationMetrics;
  temperatureC: number;
  timeHours: number;
  stage: StageId;
}

export const MicroStructureScene: React.FC<MicroStructureSceneProps> = ({
  milk,
  bacteria,
  metrics,
  temperatureC,
  timeHours,
  stage,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [highlightMode, setHighlightMode] = useState<'all' | 'bacteria' | 'protein'>('all');

  const stateRef = useRef({
    milk,
    bacteria,
    metrics,
    temperatureC,
    timeHours,
    stage,
    highlightMode,
  });

  useEffect(() => {
    stateRef.current = {
      milk,
      bacteria,
      metrics,
      temperatureC,
      timeHours,
      stage,
      highlightMode,
    };
  }, [milk, bacteria, metrics, temperatureC, timeHours, stage, highlightMode]);

  const orbitRef = useRef({
    theta: -0.4,
    phi: 1.35,
    radius: 7.5,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070b14');
    scene.fog = new THREE.FogExp2('#070b14', 0.042);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Microscope Lighting
    const ambientLight = new THREE.AmbientLight('#e2e8f0', 0.95);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#ffffff', 2.0);
    mainLight.position.set(5, 8, 6);
    scene.add(mainLight);

    const bioLight1 = new THREE.PointLight('#38bdf8', 2.2, 14);
    bioLight1.position.set(-4, 3, 4);
    scene.add(bioLight1);

    const bioLight2 = new THREE.PointLight('#f43f5e', 1.8, 14);
    bioLight2.position.set(4, -3, -3);
    scene.add(bioLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // --- 1. CASEIN MICELLES (Protein Sữa) & 3D GEL MATRIX BRIDGES ---
    // Create a 3x3x3 3D lattice (27 nodes) for the final coagulated 3D gel matrix,
    // plus random free-floating initial positions when milk is liquid!
    const caseinNodes: {
      group: THREE.Group;
      coreMesh: THREE.Mesh;
      chargeRing: THREE.Mesh;
      freePos: THREE.Vector3;
      gelPos: THREE.Vector3;
      phaseOffset: number;
    }[] = [];

    const caseinCoreMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.3,
      metalness: 0.1,
    });

    const chargeRingMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.75,
    });

    const coreGeo = new THREE.IcosahedronGeometry(0.27, 2);
    const ringGeo = new THREE.TorusGeometry(0.39, 0.022, 12, 32);

    const spacing = 1.45;
    let idx = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const nodeGroup = new THREE.Group();
          const coreMesh = new THREE.Mesh(coreGeo, caseinCoreMat);
          nodeGroup.add(coreMesh);

          // Negative kappa-casein electrostatic halo (visible at high pH)
          const chargeRing = new THREE.Mesh(ringGeo, chargeRingMat);
          nodeGroup.add(chargeRing);

          // Gel lattice position (slightly organic jitter)
          const jx = (Math.sin(idx * 7.1) * 0.18);
          const jy = (Math.cos(idx * 13.3) * 0.18);
          const jz = (Math.sin(idx * 3.7) * 0.18);
          const gelPos = new THREE.Vector3(x * spacing + jx, y * spacing + jy, z * spacing + jz);

          // Dispersed liquid milk position
          const freePos = new THREE.Vector3(
            (Math.random() - 0.5) * 5.2,
            (Math.random() - 0.5) * 4.4,
            (Math.random() - 0.5) * 4.8
          );

          nodeGroup.position.copy(freePos);
          rootGroup.add(nodeGroup);

          caseinNodes.push({
            group: nodeGroup,
            coreMesh,
            chargeRing,
            freePos,
            gelPos,
            phaseOffset: idx * 0.7,
          });
          idx++;
        }
      }
    }

    // Create 3D Cross-link Bridges between neighboring Casein nodes in the 3D lattice
    const bridges: {
      mesh: THREE.Mesh;
      nodeA: number;
      nodeB: number;
    }[] = [];

    const bridgeMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      emissive: '#38bdf8',
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0,
      roughness: 0.35,
    });

    const unitCylinderGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 10);
    unitCylinderGeo.rotateX(Math.PI / 2); // Align along Z-axis so lookAt works directly

    for (let i = 0; i < caseinNodes.length; i++) {
      for (let j = i + 1; j < caseinNodes.length; j++) {
        const dist = caseinNodes[i].gelPos.distanceTo(caseinNodes[j].gelPos);
        if (dist < spacing * 1.32) {
          const bridgeMesh = new THREE.Mesh(unitCylinderGeo, bridgeMat);
          rootGroup.add(bridgeMesh);
          bridges.push({ mesh: bridgeMesh, nodeA: i, nodeB: j });
        }
      }
    }

    // --- 2. BACTERIA MODELS (L. bulgaricus Rods & S. thermophilus Cocci Chains) ---
    const bacteriaGroup = new THREE.Group();
    rootGroup.add(bacteriaGroup);

    // 2A. Lactobacillus bulgaricus (Pink/Magenta Rod Bacilli)
    const rodMat = new THREE.MeshStandardMaterial({
      color: '#ec4899',
      emissive: '#be185d',
      emissiveIntensity: 0.45,
      roughness: 0.25,
    });
    const rodGeo = new THREE.CapsuleGeometry(0.14, 0.58, 12, 24);
    const rods: { mesh: THREE.Mesh; basePos: THREE.Vector3; rotSpeed: THREE.Vector3; phase: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(rodGeo, rodMat);
      const basePos = new THREE.Vector3(
        (Math.random() - 0.5) * 4.4,
        (Math.random() - 0.5) * 3.8,
        (Math.random() - 0.5) * 4.2
      );
      mesh.position.copy(basePos);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      bacteriaGroup.add(mesh);
      rods.push({
        mesh,
        basePos,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2
        ),
        phase: i * 1.1,
      });
    }

    // 2B. Streptococcus thermophilus (Cyan/Emerald Chains of 4 Cocci Spheres)
    const cocciMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#047857',
      emissiveIntensity: 0.45,
      roughness: 0.22,
    });
    const coccusGeo = new THREE.SphereGeometry(0.135, 16, 16);
    const cocciChains: {
      chainGroup: THREE.Group;
      spheres: THREE.Mesh[];
      basePos: THREE.Vector3;
      phase: number;
    }[] = [];

    for (let i = 0; i < 12; i++) {
      const chainGroup = new THREE.Group();
      const spheres: THREE.Mesh[] = [];
      for (let s = 0; s < 4; s++) {
        const sp = new THREE.Mesh(coccusGeo, cocciMat);
        sp.position.x = (s - 1.5) * 0.24;
        chainGroup.add(sp);
        spheres.push(sp);
      }
      const basePos = new THREE.Vector3(
        (Math.random() - 0.5) * 4.4,
        (Math.random() - 0.5) * 3.8,
        (Math.random() - 0.5) * 4.2
      );
      chainGroup.position.copy(basePos);
      chainGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      bacteriaGroup.add(chainGroup);
      cocciChains.push({ chainGroup, spheres, basePos, phase: i * 0.9 });
    }

    // --- 3. LACTOSE DISACCHARIDE MOLECULES (Golden Double-Rings) ---
    const lactoseMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#d97706',
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });
    const hexRingGeo = new THREE.TorusGeometry(0.085, 0.032, 8, 6);
    const lactoseMolecules: { group: THREE.Group; pos: THREE.Vector3; phase: number }[] = [];

    for (let i = 0; i < 24; i++) {
      const g = new THREE.Group();
      const ring1 = new THREE.Mesh(hexRingGeo, lactoseMat);
      ring1.position.x = -0.08;
      const ring2 = new THREE.Mesh(hexRingGeo, lactoseMat);
      ring2.position.x = 0.08;
      ring2.rotation.x = 0.5;
      g.add(ring1, ring2);

      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 4.8,
        (Math.random() - 0.5) * 4.2,
        (Math.random() - 0.5) * 4.8
      );
      g.position.copy(pos);
      rootGroup.add(g);
      lactoseMolecules.push({ group: g, pos, phase: i * 0.5 });
    }

    // --- 4. LACTIC ACID & H+ IONS (Glowing Lime/Rose Spheres produced as pH drops) ---
    const acidMat = new THREE.MeshStandardMaterial({
      color: '#a3e635',
      emissive: '#65a30d',
      emissiveIntensity: 0.85,
      roughness: 0.15,
    });
    const acidGeo = new THREE.OctahedronGeometry(0.08, 1);
    const acidParticles: { mesh: THREE.Mesh; pos: THREE.Vector3; phase: number }[] = [];

    for (let i = 0; i < 42; i++) {
      const mesh = new THREE.Mesh(acidGeo, acidMat);
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 4.8,
        (Math.random() - 0.5) * 4.2,
        (Math.random() - 0.5) * 4.8
      );
      mesh.position.copy(pos);
      rootGroup.add(mesh);
      acidParticles.push({ mesh, pos, phase: i * 0.4 });
    }

    // --- 5. MILK FAT GLOBULES (Lipid droplets trapped in the gel network) ---
    const fatMat = new THREE.MeshPhysicalMaterial({
      color: '#fde68a',
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
    });
    const fatGeo = new THREE.SphereGeometry(0.21, 20, 20);
    const fatGlobules: { mesh: THREE.Mesh; pos: THREE.Vector3 }[] = [];
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(fatGeo, fatMat);
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 3.4,
        (Math.random() - 0.5) * 3.2,
        (Math.random() - 0.5) * 3.4
      );
      mesh.position.copy(pos);
      rootGroup.add(mesh);
      fatGlobules.push({ mesh, pos });
    }

    // Pointer / Wheel Orbit Handlers
    const onPointerDown = (e: PointerEvent) => {
      orbitRef.current.isDragging = true;
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!orbitRef.current.isDragging) return;
      const dx = e.clientX - orbitRef.current.lastX;
      const dy = e.clientY - orbitRef.current.lastY;
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
      orbitRef.current.theta -= dx * 0.008;
      orbitRef.current.phi = Math.max(0.35, Math.min(2.75, orbitRef.current.phi - dy * 0.006));
    };
    const onPointerUp = () => {
      orbitRef.current.isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(4.0, Math.min(11.5, orbitRef.current.radius + e.deltaY * 0.004));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    let animId = 0;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const {
        milk: curMilk,
        bacteria: curBacteria,
        metrics: curMetrics,
        highlightMode: curHighlight,
      } = stateRef.current;

      const gel = curMetrics.gelProgress;
      const activity = curMetrics.bacteriaActivity;
      const pHDropRatio = Math.min(1, Math.max(0, (6.65 - curMetrics.pH) / 2.45));

      // Highlight mode dimming
      const showProtein = curHighlight === 'all' || curHighlight === 'protein';
      const showBacteria = curHighlight === 'all' || curHighlight === 'bacteria';

      // 1. Update Casein Micelles (from Brownian free repulsion -> 3D Gel Lattice)
      const brownianAmp = (1 - gel * 0.88) * 0.38;
      // If syneresis (overheated/overacidified), lattice contracts tightly
      const syneresisShrink = curMetrics.caseinChargeState === 'syneresis' ? 0.78 : 1.0;

      caseinNodes.forEach((node) => {
        node.group.visible = showProtein;
        // Interpolate between free liquid position and 3D gel lattice position
        tempVec.lerpVectors(
          node.freePos,
          node.gelPos.clone().multiplyScalar(syneresisShrink),
          gel
        );
        // Add thermal / Brownian motion
        node.group.position.set(
          tempVec.x + Math.sin(elapsed * 2.1 + node.phaseOffset) * brownianAmp,
          tempVec.y + Math.cos(elapsed * 1.8 + node.phaseOffset) * brownianAmp,
          tempVec.z + Math.sin(elapsed * 1.5 + node.phaseOffset * 1.3) * brownianAmp
        );

        // Charge ring faces camera and fades out as H+ neutralizes negative surface charge
        node.chargeRing.lookAt(camera.position);
        node.chargeRing.scale.setScalar(1 - gel * 0.55);
      });
      chargeRingMat.opacity = Math.max(0.05, (1 - gel) * 0.75);

      // 2. Update 3D Gel Matrix Cross-link Bridges
      if (gel > 0.08 && showProtein) {
        bridgeMat.opacity = Math.min(0.92, (gel - 0.08) * 1.1);
        bridges.forEach((b) => {
          b.mesh.visible = true;
          const posA = caseinNodes[b.nodeA].group.position;
          const posB = caseinNodes[b.nodeB].group.position;
          b.mesh.position.lerpVectors(posA, posB, 0.5);
          b.mesh.lookAt(posB);
          const d = posA.distanceTo(posB);
          b.mesh.scale.set(0.6 + gel * 0.6, 0.6 + gel * 0.6, d);
        });
      } else {
        bridges.forEach((b) => {
          b.mesh.visible = false;
        });
      }

      // 3. Update Bacteria (Rods vs Cocci visibility based on selected starter culture)
      const activeRodCount = Math.round(rods.length * curBacteria.rodRatio);
      const activeCocciCount = Math.round(cocciChains.length * (1 - curBacteria.rodRatio));

      const swimSpeed = 0.4 + activity * 2.4;
      rods.forEach((r, idx) => {
        r.mesh.visible = showBacteria && idx < activeRodCount;
        if (!r.mesh.visible) return;
        r.mesh.position.set(
          r.basePos.x + Math.sin(elapsed * swimSpeed + r.phase) * 0.35,
          r.basePos.y + Math.cos(elapsed * swimSpeed * 0.8 + r.phase) * 0.35,
          r.basePos.z + Math.sin(elapsed * swimSpeed * 0.6 + r.phase) * 0.35
        );
        r.mesh.rotation.x += r.rotSpeed.x * 0.015 * swimSpeed;
        r.mesh.rotation.y += r.rotSpeed.y * 0.015 * swimSpeed;
      });

      cocciChains.forEach((c, idx) => {
        c.chainGroup.visible = showBacteria && idx < activeCocciCount;
        if (!c.chainGroup.visible) return;
        c.chainGroup.position.set(
          c.basePos.x + Math.cos(elapsed * swimSpeed + c.phase) * 0.32,
          c.basePos.y + Math.sin(elapsed * swimSpeed * 0.9 + c.phase) * 0.32,
          c.basePos.z + Math.cos(elapsed * swimSpeed * 0.7 + c.phase) * 0.32
        );
        // Wiggle individual cocci spheres in the chain
        c.spheres.forEach((sp, sIdx) => {
          sp.position.y = Math.sin(elapsed * 4.5 + c.phase + sIdx * 0.8) * 0.06 * activity;
        });
      });

      // 4. Update Lactose Molecules (consumed as pH drops)
      const visibleLactose = Math.max(
        4,
        Math.round(lactoseMolecules.length * (1 - pHDropRatio * 0.65))
      );
      lactoseMolecules.forEach((lac, i) => {
        lac.group.visible = showBacteria && i < visibleLactose;
        if (lac.group.visible) {
          lac.group.rotation.x = elapsed * 1.4 + lac.phase;
          lac.group.rotation.y = elapsed * 1.8 + lac.phase;
          lac.group.position.y = lac.pos.y + Math.sin(elapsed * 2 + lac.phase) * 0.18;
        }
      });

      // 5. Update Lactic Acid & H+ Ions (appear as lactose is fermented)
      const visibleAcid = Math.max(2, Math.round(acidParticles.length * pHDropRatio));
      acidParticles.forEach((ap, i) => {
        ap.mesh.visible = i < visibleAcid;
        if (ap.mesh.visible) {
          ap.mesh.rotation.y = elapsed * 3 + ap.phase;
          ap.mesh.position.y = ap.pos.y + Math.cos(elapsed * 3.2 + ap.phase) * 0.22;
        }
      });

      // 6. Fat Globules visibility based on milk fat %
      const visibleFat = curMilk.id === 'skim_milk' ? 1 : fatGlobules.length;
      fatGlobules.forEach((fg, i) => {
        fg.mesh.visible = showProtein && i < visibleFat;
      });

      // 7. Camera Orbit
      if (!orbitRef.current.isDragging) {
        orbitRef.current.theta += 0.0022;
      }
      const { theta, phi, radius } = orbitRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-2xl flex flex-col">
      {/* Top Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Góc nhìn Vi mô (Micro 3D — 10.000x)
            </span>
          </div>
          <p className="text-sm md:text-base font-bold text-white mt-0.5">
            Vi Khuẩn Lactic &amp; Mạng Lưới Gel Protein Casein
          </p>
        </div>

        {/* Filter Mode Pills (Pointer-events enabled) */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => setHighlightMode('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              highlightMode === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setHighlightMode('bacteria')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              highlightMode === 'bacteria'
                ? 'bg-pink-500 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Vi khuẩn &amp; Đường
          </button>
          <button
            type="button"
            onClick={() => setHighlightMode('protein')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              highlightMode === 'protein'
                ? 'bg-sky-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mạng Gel Protein
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Bottom Interactive Legend & Charge Status */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col gap-2 pointer-events-none">
        {/* Live Electrostatic / Gelation Status Banner */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl">
          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-cyan-200">
            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{metrics.caseinChargeLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              orbitRef.current.theta = -0.4;
              orbitRef.current.phi = 1.35;
              orbitRef.current.radius = 7.5;
            }}
            title="Đặt lại góc nhìn Vi mô"
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors pointer-events-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color-Coded 3D Legend for Students */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border-2 border-sky-400 inline-block" />
            Micelle Casein (Protein)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-2 rounded-full bg-pink-500 inline-block" />
            Trực khuẩn (L. bulgaricus)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            Cầu khuẩn (S. thermophilus)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
            Đường Lactose
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-lime-400 inline-block" />
            Axit Lactic &amp; Ion H⁺
          </span>
        </div>
      </div>
    </div>
  );
};
