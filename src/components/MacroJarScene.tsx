import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  BacteriaOption,
  MilkOption,
  SimulationMetrics,
  StageId,
} from '../types/fermentation';
import { RotateCcw, Sparkles, Utensils } from 'lucide-react';

interface MacroJarSceneProps {
  milk: MilkOption;
  bacteria: BacteriaOption;
  metrics: SimulationMetrics;
  temperatureC: number;
  timeHours: number;
  stage: StageId;
}

export const MacroJarScene: React.FC<MacroJarSceneProps> = ({
  milk,
  bacteria,
  metrics,
  temperatureC,
  timeHours,
  stage,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isTiltTesting, setIsTiltTesting] = useState(false);

  // Store latest props in a ref so the requestAnimationFrame loop always reads fresh state without re-creating the WebGL context
  const stateRef = useRef({
    milk,
    bacteria,
    metrics,
    temperatureC,
    timeHours,
    stage,
    isTiltTesting,
  });

  useEffect(() => {
    stateRef.current = {
      milk,
      bacteria,
      metrics,
      temperatureC,
      timeHours,
      stage,
      isTiltTesting,
    };
  }, [milk, bacteria, metrics, temperatureC, timeHours, stage, isTiltTesting]);

  // Camera orbit ref
  const orbitRef = useRef({
    theta: 0.35,
    phi: 1.18,
    radius: 6.4,
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
    scene.background = new THREE.Color('#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.045);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#dbeafe', 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fff7ed', 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 1.2);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const heaterGlowLight = new THREE.PointLight('#f59e0b', 1.8, 7);
    heaterGlowLight.position.set(0, -1.5, 0);
    scene.add(heaterGlowLight);

    // Root group for jar + contents (allows tilting test)
    const jarPivot = new THREE.Group();
    scene.add(jarPivot);

    // Incubator Thermal Base (Fixed platform below jar)
    const baseGroup = new THREE.Group();
    baseGroup.position.y = -2.05;
    scene.add(baseGroup);

    const basePlateGeo = new THREE.CylinderGeometry(1.95, 2.15, 0.36, 48);
    const basePlateMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.6,
      roughness: 0.35,
    });
    const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat);
    basePlate.receiveShadow = true;
    baseGroup.add(basePlate);

    // Glowing thermal ring on incubator
    const thermalRingGeo = new THREE.TorusGeometry(1.52, 0.065, 16, 64);
    thermalRingGeo.rotateX(Math.PI / 2);
    const thermalRingMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#f59e0b',
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });
    const thermalRing = new THREE.Mesh(thermalRingGeo, thermalRingMat);
    thermalRing.position.y = 0.18;
    baseGroup.add(thermalRing);

    // Subtle lab grid floor
    const gridHelper = new THREE.GridHelper(14, 14, '#1e293b', '#0f172a');
    gridHelper.position.y = -2.24;
    scene.add(gridHelper);

    // --- Yogurt Glass Jar ---
    const jarRadius = 1.28;
    const jarHeight = 3.1;

    // Outer glass body (open top cylinder + bottom rounded base)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#e0f2fe',
      transparent: true,
      opacity: 0.28,
      roughness: 0.08,
      metalness: 0.05,
      reflectivity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const jarBodyGeo = new THREE.CylinderGeometry(jarRadius, jarRadius * 0.94, jarHeight, 48, 1, true);
    const jarBody = new THREE.Mesh(jarBodyGeo, glassMat);
    jarBody.position.y = -0.25;
    jarPivot.add(jarBody);

    // Glass bottom disc
    const jarBottomGeo = new THREE.CylinderGeometry(jarRadius * 0.94, jarRadius * 0.9, 0.14, 48);
    const jarBottom = new THREE.Mesh(jarBottomGeo, glassMat);
    jarBottom.position.y = -1.8;
    jarPivot.add(jarBottom);

    // Glass neck rim
    const rimGeo = new THREE.TorusGeometry(jarRadius, 0.065, 16, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, glassMat);
    rimMesh.position.y = 1.3;
    jarPivot.add(rimMesh);

    // Measurement graduations on glass jar (100ml, 200ml, 300ml rings)
    const tickMat = new THREE.MeshBasicMaterial({
      color: '#94a3b8',
      transparent: true,
      opacity: 0.35,
    });
    [-1.1, -0.35, 0.4].forEach((yPos) => {
      const tickGeo = new THREE.TorusGeometry(jarRadius * 0.98, 0.01, 8, 48, Math.PI * 0.6);
      tickGeo.rotateX(Math.PI / 2);
      tickGeo.rotateY(-Math.PI * 0.3);
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.y = yPos;
      jarPivot.add(tick);
    });

    // --- Milk / Yogurt Interior Volume ---
    const milkHeight = 2.35;
    const milkRadiusTop = jarRadius * 0.92;
    const milkRadiusBottom = jarRadius * 0.88;

    // Cylinder wall of milk
    const milkBodyGeo = new THREE.CylinderGeometry(
      milkRadiusTop,
      milkRadiusBottom,
      milkHeight,
      48,
      16,
      false
    );
    const milkMat = new THREE.MeshStandardMaterial({
      color: '#fffdf7',
      roughness: 0.35,
      metalness: 0.02,
    });
    const milkMesh = new THREE.Mesh(milkBodyGeo, milkMat);
    milkMesh.position.y = -0.58;
    jarPivot.add(milkMesh);

    // Dynamic deformable top surface disc for waves (liquid) vs creamy peak (yogurt gel)
    const surfaceGeo = new THREE.CircleGeometry(milkRadiusTop, 48);
    surfaceGeo.rotateX(-Math.PI / 2);
    // Subdivide radial ring by using PlaneGeometry or Ring/Cylinder top
    const topCapGeo = new THREE.CylinderGeometry(milkRadiusTop, milkRadiusTop * 0.99, 0.08, 48, 8);
    const topPosAttr = topCapGeo.attributes.position;
    const originalTopY = new Float32Array(topPosAttr.count);
    for (let i = 0; i < topPosAttr.count; i++) {
      originalTopY[i] = topPosAttr.getY(i);
    }
    const topCapMesh = new THREE.Mesh(topCapGeo, milkMat);
    topCapMesh.position.y = 0.59;
    jarPivot.add(topCapMesh);

    // Translucent golden Whey layer (appears only when syneresis/overheated)
    const wheyGeo = new THREE.CylinderGeometry(milkRadiusTop * 0.995, milkRadiusTop * 0.99, 0.16, 48);
    const wheyMat = new THREE.MeshPhysicalMaterial({
      color: '#fde047',
      transparent: true,
      opacity: 0,
      roughness: 0.15,
    });
    const wheyMesh = new THREE.Mesh(wheyGeo, wheyMat);
    wheyMesh.position.y = 0.67;
    jarPivot.add(wheyMesh);

    // --- 3D Stainless Steel Tasting Spoon (dips into the jar to show viscosity) ---
    const spoonGroup = new THREE.Group();
    const spoonMetalMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.85,
      roughness: 0.18,
    });
    // Spoon handle
    const handleGeo = new THREE.BoxGeometry(0.11, 2.3, 0.03);
    const handleMesh = new THREE.Mesh(handleGeo, spoonMetalMat);
    handleMesh.position.y = 1.25;
    spoonGroup.add(handleMesh);

    // Spoon bowl
    const bowlGeo = new THREE.SphereGeometry(0.32, 24, 16);
    bowlGeo.scale(0.85, 1.15, 0.35);
    const bowlMesh = new THREE.Mesh(bowlGeo, spoonMetalMat);
    bowlMesh.position.y = 0.05;
    spoonGroup.add(bowlMesh);

    // Yogurt dollop clinging to the spoon (scales with gelProgress!)
    const dollopGeo = new THREE.SphereGeometry(0.29, 24, 16);
    dollopGeo.scale(0.85, 1.1, 0.65);
    const dollopMesh = new THREE.Mesh(dollopGeo, milkMat);
    dollopMesh.position.set(0, 0.05, 0.08);
    spoonGroup.add(dollopMesh);

    spoonGroup.position.set(0.25, 0.65, 0);
    spoonGroup.rotation.z = -0.22;
    jarPivot.add(spoonGroup);

    // --- Rising Heat / Aroma / Probiotic Glow Particles inside & around Jar ---
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (milkRadiusTop * 0.85);
      particlePositions[i * 3] = Math.cos(angle) * r;
      particlePositions[i * 3 + 1] = -1.6 + Math.random() * 2.1;
      particlePositions[i * 3 + 2] = Math.sin(angle) * r;
      particleSpeeds[i] = 0.2 + Math.random() * 0.45;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#fbbf24',
      size: 0.075,
      transparent: true,
      opacity: 0.7,
    });
    const activeParticles = new THREE.Points(particleGeo, particleMat);
    jarPivot.add(activeParticles);

    // Mouse / Touch handlers for Orbit
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
      orbitRef.current.phi = Math.max(0.45, Math.min(1.52, orbitRef.current.phi - dy * 0.006));
    };
    const onPointerUp = () => {
      orbitRef.current.isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(4.2, Math.min(9.5, orbitRef.current.radius + e.deltaY * 0.003));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // ResizeObserver
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

    // Animation loop
    let animId = 0;
    const clock = new THREE.Clock();
    const colorLiquid = new THREE.Color();
    const colorYogurt = new THREE.Color();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const { milk: curMilk, metrics: curMetrics, temperatureC: curTemp, isTiltTesting: tilt } =
        stateRef.current;

      // 1. Update milk -> yogurt color & surface roughness
      colorLiquid.set(curMilk.colorHex);
      colorYogurt.set(curMilk.yogurtColorHex);
      milkMat.color.lerpColors(colorLiquid, colorYogurt, curMetrics.gelProgress);
      // Liquid milk is shinier (lower roughness), set yogurt gel has soft matte velvety sheen
      milkMat.roughness = 0.18 + curMetrics.gelProgress * 0.42;

      // 2. Thermal ring color based on temperature
      let ringHex = '#10b981'; // Optimal emerald/amber
      if (curTemp < 28) ringHex = '#38bdf8'; // Cold sky blue
      else if (curTemp < 38) ringHex = '#facc15'; // Warm yellow
      else if (curTemp <= 46) ringHex = '#f59e0b'; // Optimal golden amber
      else ringHex = '#ef4444'; // Hot / danger red

      thermalRingMat.color.set(ringHex);
      thermalRingMat.emissive.set(ringHex);
      thermalRingMat.emissiveIntensity = 1.1 + Math.sin(elapsed * 3.5) * 0.35;
      heaterGlowLight.color.set(ringHex);

      // 3. Jar tilt & Spoon viscosity test animation
      const targetJarTilt = tilt ? 0.42 : 0;
      jarPivot.rotation.z += (targetJarTilt - jarPivot.rotation.z) * 0.08;

      // Spoon lifts up and down when testing viscosity, or gently hovers
      const spoonCycle = tilt ? Math.sin(elapsed * 3.2) * 0.55 + 0.45 : Math.sin(elapsed * 1.4) * 0.12;
      spoonGroup.position.y = 0.62 + spoonCycle;
      // Dollop on spoon is small/dripping when liquid, thick and full when gelProgress is high
      const dollopScale = 0.18 + curMetrics.gelProgress * 0.95;
      dollopMesh.scale.set(0.85 * dollopScale, 1.1 * dollopScale, 0.7 * dollopScale);

      // 4. Deform top surface of milk/yogurt
      // When liquid (gelProgress near 0): sloshing waves & level stays horizontal when jar tilts
      // When solid gel (gelProgress near 1): surface tilts WITH the jar and forms a creamy sculpted peak!
      const fluidity = 1 - curMetrics.gelProgress;
      const posAttr = topCapGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const y0 = originalTopY[i];
        if (y0 > 0) {
          const vx = posAttr.getX(i);
          const vz = posAttr.getZ(i);
          const distCenter = Math.sqrt(vx * vx + vz * vz);
          // Liquid wave sloshing
          const wave =
            Math.sin(vx * 3.5 + elapsed * 4.2) * 0.045 * fluidity +
            Math.cos(vz * 3.5 + elapsed * 3.4) * 0.035 * fluidity;
          // Gravity compensation when tilted & liquid
          const liquidGravitySlope = -vx * Math.sin(jarPivot.rotation.z) * 0.75 * fluidity;
          // Creamy yogurt dome peak in center when solidified
          const yogurtDome =
            Math.max(0, 1 - distCenter / milkRadiusTop) * 0.14 * curMetrics.gelProgress;

          posAttr.setY(i, y0 + wave + liquidGravitySlope + yogurtDome);
        }
      }
      posAttr.needsUpdate = true;
      topCapGeo.computeVertexNormals();

      // 5. Whey separation layer (Syneresis when overheated or hyper-acidic)
      const targetWheyOpacity = curMetrics.caseinChargeState === 'syneresis' ? 0.52 : 0;
      wheyMat.opacity += (targetWheyOpacity - wheyMat.opacity) * 0.08;

      // 6. Probiotic activity bubbles inside milk
      const pPos = activeParticles.geometry.attributes.position;
      const speedScale = curMetrics.bacteriaActivity * (1 - curMetrics.gelProgress * 0.75);
      for (let i = 0; i < particleCount; i++) {
        let py = pPos.getY(i) + particleSpeeds[i] * 0.015 * Math.max(0.08, speedScale);
        if (py > 0.55) py = -1.65;
        pPos.setY(i, py);
      }
      pPos.needsUpdate = true;
      particleMat.opacity = 0.25 + curMetrics.bacteriaActivity * 0.55;
      particleMat.color.set(curMetrics.pH < 5.0 ? '#34d399' : '#fbbf24');

      // 7. Update Camera Orbit
      if (!orbitRef.current.isDragging) {
        orbitRef.current.theta += 0.0018;
      }
      const { theta, phi, radius } = orbitRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, -0.25, 0);

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
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Góc nhìn Vĩ mô (Macro 3D)
            </span>
          </div>
          <p className="text-sm md:text-base font-bold text-white mt-0.5">
            Hũ Ủ Sữa Chua &amp; Độ Sánh Đặc
          </p>
        </div>

        {/* Live Texture & Temp Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl text-right shadow-lg">
          <div className="text-xs text-slate-400 font-medium">Trạng thái vật lý</div>
          <div className="text-sm font-bold text-emerald-300">
            Độ đông đặc Gel: {Math.round(metrics.gelProgress * 100)}%
          </div>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Bottom Interactive Controls on Macro Viewport */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsTiltTesting((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
            isTiltTesting
              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200'
              : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
          }`}
        >
          <Utensils className="w-4 h-4" />
          {isTiltTesting ? 'Đang nghiêng hũ & nhấc muỗng...' : 'Thử độ sánh (Nghiêng hũ & Muỗng)'}
        </button>

        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{metrics.textureLabel}</span>
          <button
            type="button"
            onClick={() => {
              orbitRef.current.theta = 0.35;
              orbitRef.current.phi = 1.18;
              orbitRef.current.radius = 6.4;
              setIsTiltTesting(false);
            }}
            title="Đặt lại góc nhìn 3D"
            className="ml-1 p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
