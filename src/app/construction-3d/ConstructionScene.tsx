'use client';

/**
 * ConstructionScene — WebGL «цифровой двойник» стройки WAG.
 *
 * Scroll-driven timeline (progressRef ∈ [0,1]) разворачивает сцену по этапам:
 * проектирование → земляные работы → автодорога → ж/д путь → переезд →
 * инженерные сети → промышленные объекты → документы для ГосЭкспертизы.
 *
 * Все анимации читают progressRef внутри useFrame — React-стейт не трогаем,
 * перерендеров на скролл нет. Тени отключены намеренно: стиль «голографический
 * чертёж» держится на emissive-акцентах и тумане.
 */

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { PHASES, clamp01, ease, phaseProgress, sub, xrayOpacity } from './phases';

const GOLD  = '#D4A843';
const GOLD_DARK = '#7A6428';
const TEAL  = '#00C4A7';
const BLUE  = '#4F84FF';
const RED   = '#FF5050';
const DARK  = '#04060C';

type ProgressRef = { current: number };

/* ── Layout constants (1 unit ≈ 1 m) ────────────────────────────────────── */
const RAIL_X   = 2.2;               // ось ж/д пути
const GAUGE    = 1.52 / 2;          // половина колеи 1520 мм
const RAIL_LEN = 32;
const ROAD_LEN = 24;
const RAIL_EMB_H = 0.52;
const ROAD_EMB_H = 0.5;
const BALLAST_TOP  = RAIL_EMB_H + 0.2;      // 0.72
const SLEEPER_TOP  = BALLAST_TOP + 0.15;    // 0.87
const RAIL_H       = 0.17;
const RAIL_TOP     = SLEEPER_TOP + RAIL_H;  // 1.04 — головка рельса
const ASPHALT_TOP  = ROAD_EMB_H + 0.15 + 0.1; // 0.75
const DECK_TOP     = 1.0;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ══════════════════════════════════════════════════════════════════════════
   CAMERA RIG — 9 ключевых кадров, интерполяция по прогрессу + лёгкий дрейф
   ══════════════════════════════════════════════════════════════════════════ */
const CAM_KEYS = [
  { p: 0.00,  pos: [-20, 13.5, -20],  tgt: [0, 0, 0]        },
  { p: 0.16,  pos: [-14, 9.5, -15],   tgt: [0, 0.3, 0]      },
  { p: 0.30,  pos: [-12, 7, -11.5],   tgt: [-1, 0.5, 0]     },
  { p: 0.44,  pos: [-5.5, 4.5, 9],    tgt: [2.2, 0.7, -3]   },
  { p: 0.56,  pos: [-11.5, 3, 0.7],   tgt: [2.2, 0.9, 0]    },
  { p: 0.66,  pos: [11.5, 6.5, 10],   tgt: [0.5, -0.4, -0.5]},
  { p: 0.80,  pos: [-1.5, 6, -16.5],  tgt: [9.5, 1.5, -7]   },
  { p: 0.90,  pos: [0.3, 4.6, 6.2],   tgt: [0.2, 4.3, 1.0]  },
  { p: 1.00,  pos: [-16, 11.5, -16],  tgt: [0, 0.8, 0]      },
] as const;

function CameraRig({ progressRef }: { progressRef: ProgressRef }) {
  const { camera, pointer, size } = useThree();

  // Портретные экраны — шире FOV, иначе в кадр ничего не попадает
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = size.width < size.height ? 62 : 42;
    cam.updateProjectionMatrix();
  }, [camera, size]);

  const vecs = useMemo(
    () => CAM_KEYS.map(k => ({
      p: k.p,
      pos: new THREE.Vector3(...(k.pos as unknown as [number, number, number])),
      tgt: new THREE.Vector3(...(k.tgt as unknown as [number, number, number])),
    })),
    [],
  );
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const p = clamp01(progressRef.current);
    let i = 0;
    while (i < vecs.length - 2 && p > vecs[i + 1].p) i++;
    const a = vecs[i];
    const b = vecs[i + 1];
    const t = ease(clamp01((p - a.p) / (b.p - a.p || 1)));
    pos.lerpVectors(a.pos, b.pos, t);
    tgt.lerpVectors(a.tgt, b.tgt, t);

    const time = clock.elapsedTime;
    pos.x += Math.sin(time * 0.14) * 0.35 + pointer.x * 0.9;
    pos.y += Math.sin(time * 0.10) * 0.20 + pointer.y * 0.45;
    camera.position.copy(pos);
    camera.lookAt(tgt);
  });
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

/** Линия, «прорисовывающая» себя по мере фазы (drawRange). */
function DrawnPath({
  points,
  color,
  drawPhase,
  fadePhase,
  progressRef,
}: {
  points: THREE.Vector3[];
  color: string;
  drawPhase: number;   // индекс фазы прорисовки
  fadePhase?: number;  // индекс фазы растворения
  progressRef: ProgressRef;
}) {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const m = new THREE.LineBasicMaterial({ color, transparent: true, toneMapped: false });
    const l = new THREE.Line(g, m);
    l.frustumCulled = false;
    return l;
  }, [points, color]);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, drawPhase);
    const n = Math.max(0, Math.floor(points.length * q));
    line.geometry.setDrawRange(0, n);
    const mat = line.material as THREE.LineBasicMaterial;
    mat.opacity = fadePhase != null ? 1 - phaseProgress(p, fadePhase) : 1;
    line.visible = mat.opacity > 0.02 && n > 1;
  });

  return <primitive object={line} />;
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 0 — ПРОЕКТИРОВАНИЕ: сетка, оси трасс, геодезические пункты
   ══════════════════════════════════════════════════════════════════════════ */
function BlueprintStage({ progressRef }: { progressRef: ProgressRef }) {
  const geoRef = useRef<THREE.Group>(null);

  const roadLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = -ROAD_LEN / 2 + (ROAD_LEN * i) / 120;
      pts.push(new THREE.Vector3(x, 0.06, 0));
    }
    return pts;
  }, []);

  const railLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const z = -RAIL_LEN / 2 + (RAIL_LEN * i) / 120;
      pts.push(new THREE.Vector3(RAIL_X, 0.06, z));
    }
    return pts;
  }, []);

  const geoPoints = useMemo(() => {
    const pts: { x: number; z: number }[] = [];
    for (let i = 0; i < 5; i++) pts.push({ x: -10 + i * 5, z: 0 });
    for (let i = 0; i < 4; i++) pts.push({ x: RAIL_X, z: -12 + i * 8 });
    return pts;
  }, []);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const q0 = phaseProgress(p, 0);
    const fade = 1 - phaseProgress(p, 1);
    if (geoRef.current) {
      geoRef.current.visible = fade > 0.02 && q0 > 0.1;
      const time = clock.elapsedTime;
      geoRef.current.children.forEach((child, i) => {
        const s = (0.8 + 0.35 * Math.sin(time * 3 + i * 1.7)) * sub(q0, 0.3 + i * 0.05, 0.55 + i * 0.05);
        child.scale.setScalar(Math.max(0.001, s));
        child.position.y = 0.25 + Math.sin(time * 1.4 + i) * 0.06;
      });
    }
  });

  return (
    <>
      <DrawnPath points={roadLine} color={GOLD} drawPhase={0} fadePhase={1} progressRef={progressRef} />
      <DrawnPath points={railLine} color={TEAL} drawPhase={0} fadePhase={1} progressRef={progressRef} />
      <group ref={geoRef}>
        {geoPoints.map((pt, i) => (
          <mesh key={i} position={[pt.x, 0.25, pt.z]}>
            <octahedronGeometry args={[0.16]} />
            <meshBasicMaterial color={i % 2 ? GOLD : TEAL} transparent opacity={0.9} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 1 — ЗЕМЛЯНЫЕ РАБОТЫ: площадка + насыпи
   ══════════════════════════════════════════════════════════════════════════ */
function Terrain({ progressRef }: { progressRef: ProgressRef }) {
  const slabMat = useRef<THREE.MeshStandardMaterial>(null);
  const railEmb = useRef<THREE.Mesh>(null);
  const roadEmb = useRef<THREE.Mesh>(null);

  const railEmbGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(4.4, RAIL_EMB_H, RAIL_LEN);
    g.translate(0, RAIL_EMB_H / 2, 0);
    return g;
  }, []);
  const roadEmbGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(ROAD_LEN, ROAD_EMB_H, 8.6);
    g.translate(0, ROAD_EMB_H / 2, 0);
    return g;
  }, []);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 1);
    const xr = xrayOpacity(p);

    if (slabMat.current) {
      // появление → просвечивание в фазе сетей → частичное восстановление
      let o = sub(q, 0, 0.4);
      o = o - 0.88 * phaseProgress(p, 4) + 0.34 * phaseProgress(p, 5) + 0.3 * phaseProgress(p, 6);
      slabMat.current.opacity = clamp01(o);
    }
    if (railEmb.current) {
      railEmb.current.scale.y = Math.max(0.001, sub(q, 0.1, 0.55));
      (railEmb.current.material as THREE.MeshStandardMaterial).opacity = xr;
    }
    if (roadEmb.current) {
      roadEmb.current.scale.y = Math.max(0.001, sub(q, 0.35, 0.85));
      (roadEmb.current.material as THREE.MeshStandardMaterial).opacity = xr;
    }
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[46, 46]} />
        <meshStandardMaterial ref={slabMat} color="#0D1220" roughness={1} transparent opacity={0} />
      </mesh>

      <mesh ref={railEmb} geometry={railEmbGeo} position={[RAIL_X, 0, 0]}>
        <meshStandardMaterial color="#262B36" roughness={0.95} transparent />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>

      <mesh ref={roadEmb} geometry={roadEmbGeo} position={[0, 0, 0]}>
        <meshStandardMaterial color="#282D38" roughness={0.95} transparent />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 2 — АВТОДОРОГА: основание, асфальт, разметка
   ══════════════════════════════════════════════════════════════════════════ */
function Road({ progressRef }: { progressRef: ProgressRef }) {
  const base = useRef<THREE.Mesh>(null);
  const asphalt = useRef<THREE.Mesh>(null);
  const edgeL = useRef<THREE.Mesh>(null);
  const edgeR = useRef<THREE.Mesh>(null);
  const dashesRef = useRef<THREE.InstancedMesh>(null!);

  const DASHES = useMemo(() => {
    const xs: number[] = [];
    for (let x = -11; x <= 11; x += 2.6) {
      if (x > -1.2 && x < 5.6) continue; // не рисуем по переезду
      xs.push(x);
    }
    return xs;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const baseGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(ROAD_LEN, 0.15, 7.9);
    g.translate(0, 0.075, 0);
    return g;
  }, []);
  const asphaltGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(ROAD_LEN, 0.1, 7.4);
    g.translate(0, 0.05, 0);
    return g;
  }, []);

  useLayoutEffect(() => {
    for (let i = 0; i < DASHES.length; i++) {
      dummy.position.set(DASHES[i], ASPHALT_TOP + 0.006, 0);
      dummy.scale.set(1, 1, 0.001);
      dummy.updateMatrix();
      dashesRef.current.setMatrixAt(i, dummy.matrix);
    }
  }, [DASHES, dummy]);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 2);
    const xr = xrayOpacity(p);
    if (base.current) {
      base.current.scale.y = Math.max(0.001, sub(q, 0, 0.35));
      (base.current.material as THREE.MeshStandardMaterial).opacity = xr;
    }
    if (asphalt.current) {
      asphalt.current.scale.y = Math.max(0.001, sub(q, 0.3, 0.65));
      (asphalt.current.material as THREE.MeshStandardMaterial).opacity = xr;
    }
    const edgeO = sub(q, 0.65, 0.85);
    if (edgeL.current) (edgeL.current.material as THREE.MeshBasicMaterial).opacity = edgeO;
    if (edgeR.current) (edgeR.current.material as THREE.MeshBasicMaterial).opacity = edgeO;

    // разметка появляется каскадом
    const m = sub(q, 0.75, 1);
    for (let i = 0; i < DASHES.length; i++) {
      const local = clamp01(m * 1.6 - (i / DASHES.length) * 0.6);
      dummy.position.set(DASHES[i], ASPHALT_TOP + 0.006, 0);
      dummy.scale.set(1, 1, Math.max(0.001, local));
      dummy.updateMatrix();
      dashesRef.current.setMatrixAt(i, dummy.matrix);
    }
    dashesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={base} geometry={baseGeo} position={[0, ROAD_EMB_H, 0]}>
        <meshStandardMaterial color="#353B48" roughness={0.95} transparent />
      </mesh>
      <mesh ref={asphalt} geometry={asphaltGeo} position={[0, ROAD_EMB_H + 0.15, 0]}>
        <meshStandardMaterial color="#1C1F27" roughness={0.98} transparent />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>

      <mesh ref={edgeL} position={[0, ASPHALT_TOP + 0.006, 3.45]}>
        <boxGeometry args={[ROAD_LEN, 0.012, 0.12]} />
        <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh ref={edgeR} position={[0, ASPHALT_TOP + 0.006, -3.45]}>
        <boxGeometry args={[ROAD_LEN, 0.012, 0.12]} />
        <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
      </mesh>

      <instancedMesh ref={dashesRef} args={[undefined, undefined, DASHES.length]} frustumCulled={false}>
        <boxGeometry args={[1.3, 0.012, 0.14]} />
        <meshBasicMaterial color="#F0C85A" toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 3 — Ж/Д ПУТЬ: балласт, шпалы (instanced), рельсы
   ══════════════════════════════════════════════════════════════════════════ */
function Railway({ progressRef }: { progressRef: ProgressRef }) {
  const ballast = useRef<THREE.Group>(null);
  const sleepersRef = useRef<THREE.InstancedMesh>(null!);
  const railL = useRef<THREE.Mesh>(null);
  const railR = useRef<THREE.Mesh>(null);

  const SLEEPERS = 44;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const railGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.07, RAIL_H, RAIL_LEN);
    g.translate(0, 0, RAIL_LEN / 2); // рост от z=-16 к +16
    return g;
  }, []);

  useLayoutEffect(() => {
    for (let i = 0; i < SLEEPERS; i++) {
      dummy.position.set(RAIL_X, BALLAST_TOP + 0.075, -15 + i * (30 / (SLEEPERS - 1)));
      dummy.scale.set(0.001, 0.001, 0.001);
      dummy.updateMatrix();
      sleepersRef.current.setMatrixAt(i, dummy.matrix);
    }
  }, [dummy]);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 3);
    if (ballast.current) {
      ballast.current.scale.y = Math.max(0.001, sub(q, 0, 0.3));
      const xr = xrayOpacity(p);
      ballast.current.children.forEach(c => {
        ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = xr;
      });
    }

    const m = sub(q, 0.15, 0.7);
    for (let i = 0; i < SLEEPERS; i++) {
      const local = ease(clamp01(m * 1.5 - (i / SLEEPERS) * 0.5));
      dummy.position.set(RAIL_X, BALLAST_TOP + 0.075, -15 + i * (30 / (SLEEPERS - 1)));
      dummy.scale.set(Math.max(0.001, local), Math.max(0.001, local), Math.max(0.001, local));
      dummy.updateMatrix();
      sleepersRef.current.setMatrixAt(i, dummy.matrix);
    }
    sleepersRef.current.instanceMatrix.needsUpdate = true;

    const rq = sub(q, 0.65, 1);
    if (railL.current) railL.current.scale.z = Math.max(0.001, rq);
    if (railR.current) railR.current.scale.z = Math.max(0.001, rq);
  });

  return (
    <>
      {/* Балластная призма */}
      <group ref={ballast} position={[RAIL_X, RAIL_EMB_H, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[3.2, 0.2, RAIL_LEN]} />
          <meshStandardMaterial color="#2E3340" roughness={1} transparent />
        </mesh>
        <mesh position={[-1.85, 0.07, 0]} rotation={[0, 0, 0.45]}>
          <boxGeometry args={[1.1, 0.14, RAIL_LEN]} />
          <meshStandardMaterial color="#272B35" roughness={1} transparent />
        </mesh>
        <mesh position={[1.85, 0.07, 0]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[1.1, 0.14, RAIL_LEN]} />
          <meshStandardMaterial color="#272B35" roughness={1} transparent />
        </mesh>
      </group>

      {/* Шпалы */}
      <instancedMesh ref={sleepersRef} args={[undefined, undefined, SLEEPERS]} frustumCulled={false}>
        <boxGeometry args={[2.5, 0.15, 0.24]} />
        <meshStandardMaterial color="#4A4232" roughness={0.9} />
      </instancedMesh>

      {/* Рельсы */}
      <mesh ref={railL} geometry={railGeo} position={[RAIL_X - GAUGE, SLEEPER_TOP + RAIL_H / 2, -RAIL_LEN / 2]}>
        <meshStandardMaterial color="#C7CBD4" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh ref={railR} geometry={railGeo} position={[RAIL_X + GAUGE, SLEEPER_TOP + RAIL_H / 2, -RAIL_LEN / 2]}>
        <meshStandardMaterial color="#C7CBD4" metalness={0.9} roughness={0.3} />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 4 — ПЕРЕЕЗД: настил, пандусы, шлагбаумы, сигналы
   ══════════════════════════════════════════════════════════════════════════ */
function Barrier({
  position,
  mirror,
  progressRef,
}: {
  position: [number, number, number];
  mirror?: boolean;
  progressRef: ProgressRef;
}) {
  const arm = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 3);
    if (root.current) root.current.scale.setScalar(Math.max(0.001, sub(q, 0.58, 0.72)));
    if (arm.current) {
      arm.current.rotation.x = lerp(-1.45, 0, sub(q, 0.66, 0.92));
    }
  });

  return (
    <group position={position} ref={root}>
      {/* Стойка */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.22, 1.1, 0.22]} />
        <meshStandardMaterial color="#353B48" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <boxGeometry args={[0.3, 0.14, 0.3]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      {/* Стрела — поднимается/опускается вокруг X */}
      <group ref={arm} position={[0, 1.15, 0]}>
        <mesh position={[0, 0, mirror ? -2.1 : 2.1]}>
          <boxGeometry args={[0.1, 0.1, 4.2]} />
          <meshStandardMaterial color="#E8EAF0" roughness={0.6} />
        </mesh>
        {[0.9, 2.1, 3.3].map(z => (
          <mesh key={z} position={[0, 0, mirror ? -z : z]}>
            <boxGeometry args={[0.11, 0.11, 0.75]} />
            <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.35} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CrossingSignal({
  position,
  rotationY,
  progressRef,
  phase,
}: {
  position: [number, number, number];
  rotationY: number;
  progressRef: ProgressRef;
  phase: number; // фаза мигания (0 или π)
}) {
  const lightA = useRef<THREE.MeshStandardMaterial>(null);
  const lightB = useRef<THREE.MeshStandardMaterial>(null);
  const root = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const q = phaseProgress(p, 3);
    if (root.current) root.current.scale.setScalar(Math.max(0.001, sub(q, 0.72, 0.82)));
    const on = sub(q, 0.8, 0.92);
    const blink = Math.sin(clock.elapsedTime * 5 + phase) > 0 ? 1 : 0.12;
    if (lightA.current) lightA.current.emissiveIntensity = 0.05 + on * 4 * blink;
    if (lightB.current) lightB.current.emissiveIntensity = 0.05 + on * 4 * (1.12 - blink);
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]} ref={root}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 2.6, 8]} />
        <meshStandardMaterial color="#353B48" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.5, 0.1]}>
        <boxGeometry args={[0.34, 0.62, 0.18]} />
        <meshStandardMaterial color="#16181E" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.64, 0.2]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial ref={lightA} color={RED} emissive={RED} emissiveIntensity={0.05} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.38, 0.2]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial ref={lightB} color={RED} emissive={RED} emissiveIntensity={0.05} toneMapped={false} />
      </mesh>
      {/* Крест «крест-накрест» */}
      <group position={[0, 3.0, 0.05]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.7, 0.09, 0.03]} />
          <meshStandardMaterial color="#E8EAF0" roughness={0.6} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.7, 0.09, 0.03]} />
          <meshStandardMaterial color="#E8EAF0" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Crossing({ progressRef }: { progressRef: ProgressRef }) {
  const deck = useRef<THREE.Mesh>(null);
  const rampA = useRef<THREE.Mesh>(null);
  const rampB = useRef<THREE.Mesh>(null);
  const stripes = useRef<THREE.Group>(null);

  const deckGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(5.2, DECK_TOP - 0.82, 8.4);
    g.translate(0, (DECK_TOP - 0.82) / 2, 0);
    return g;
  }, []);

  const rampAngle = Math.atan((DECK_TOP - ASPHALT_TOP) / 2.2);

  useFrame(() => {
    const p = progressRef.current;
    // переезд достраивается во второй половине фазы «Ж/д пути»
    const q = phaseProgress(p, 3);
    const xr = xrayOpacity(p);
    if (deck.current) {
      deck.current.scale.y = Math.max(0.001, sub(q, 0.5, 0.62));
      (deck.current.material as THREE.MeshStandardMaterial).opacity = xr;
    }
    const ro = sub(q, 0.56, 0.7) * xr;
    if (rampA.current) (rampA.current.material as THREE.MeshStandardMaterial).opacity = ro;
    if (rampB.current) (rampB.current.material as THREE.MeshStandardMaterial).opacity = ro;
    if (stripes.current) {
      const so = sub(q, 0.6, 0.75);
      stripes.current.children.forEach(c => {
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = so;
      });
    }
  });

  return (
    <>
      <mesh ref={deck} geometry={deckGeo} position={[RAIL_X, 0.82, 0]}>
        <meshStandardMaterial color="#242833" roughness={0.95} transparent />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>

      {/* Разметка на настиле и стоп-линия перед переездом */}
      <group ref={stripes}>
        <mesh position={[RAIL_X, DECK_TOP + 0.006, 3.45]}>
          <boxGeometry args={[5.2, 0.012, 0.14]} />
          <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
        </mesh>
        <mesh position={[RAIL_X, DECK_TOP + 0.006, -3.45]}>
          <boxGeometry args={[5.2, 0.012, 0.14]} />
          <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
        </mesh>
        <mesh position={[RAIL_X - 3.5, ASPHALT_TOP + 0.006, 0]}>
          <boxGeometry args={[0.45, 0.012, 7.2]} />
          <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>

      {/* Пандусы дороги на настил */}
      <mesh
        ref={rampA}
        position={[RAIL_X - 3.7, ASPHALT_TOP + (DECK_TOP - ASPHALT_TOP) / 2, 0]}
        rotation={[0, 0, -rampAngle]}
      >
        <boxGeometry args={[2.4, 0.05, 7.4]} />
        <meshStandardMaterial color="#242833" roughness={0.95} transparent opacity={0} />
      </mesh>
      <mesh
        ref={rampB}
        position={[RAIL_X + 3.7, ASPHALT_TOP + (DECK_TOP - ASPHALT_TOP) / 2, 0]}
        rotation={[0, 0, rampAngle]}
      >
        <boxGeometry args={[2.4, 0.05, 7.4]} />
        <meshStandardMaterial color="#242833" roughness={0.95} transparent opacity={0} />
      </mesh>

      {/* Шлагбаумы по обе стороны переезда */}
      <Barrier position={[RAIL_X - 3.4, ASPHALT_TOP, -3.9]} progressRef={progressRef} />
      <Barrier position={[RAIL_X + 3.4, ASPHALT_TOP, 3.9]} mirror progressRef={progressRef} />

      {/* Сигналы */}
      <CrossingSignal position={[RAIL_X - 3.1, ASPHALT_TOP, 4.1]} rotationY={Math.PI} progressRef={progressRef} phase={0} />
      <CrossingSignal position={[RAIL_X + 3.1, ASPHALT_TOP, -4.1]} rotationY={0} progressRef={progressRef} phase={Math.PI} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 5 — ИНЖЕНЕРНЫЕ СЕТИ: трубы, кабель, ЛЭП
   ══════════════════════════════════════════════════════════════════════════ */
function FlowPulse({
  axis,
  fixed,
  range,
  color,
  offset,
  progressRef,
}: {
  axis: 'x' | 'z';
  fixed: [number, number]; // [y, другая ось]
  range: [number, number];
  color: string;
  offset: number;
  progressRef: ProgressRef;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const p = progressRef.current;
    const vis = sub(phaseProgress(p, 4), 0.2, 0.5);
    const t = (clock.elapsedTime * 0.22 + offset) % 1;
    const v = lerp(range[0], range[1], t);
    if (ref.current) {
      ref.current.visible = vis > 0.02;
      ref.current.scale.setScalar(Math.max(0.001, vis));
      if (axis === 'x') ref.current.position.set(v, fixed[0], fixed[1]);
      else ref.current.position.set(fixed[1], fixed[0], v);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.17, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Networks({ progressRef }: { progressRef: ProgressRef }) {
  const group = useRef<THREE.Group>(null);
  const wires = useRef<THREE.Group>(null);
  const poles = useRef<THREE.Group>(null);

  const POLES = useMemo(() => [-11, -6.6, -2.2, 2.2, 6.6, 11], []);

  const wirePts = useMemo(() => {
    const mk = (zOff: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < POLES.length - 1; i++) {
        for (let s = 0; s <= 8; s++) {
          const t = s / 8;
          const x = lerp(POLES[i], POLES[i + 1], t);
          const sag = Math.sin(t * Math.PI) * 0.14;
          pts.push(new THREE.Vector3(x, 3.85 - sag, 5.2 + zOff));
        }
      }
      return pts;
    };
    return [mk(-0.65), mk(0.65)];
  }, [POLES]);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 4);
    const vis = sub(q, 0.1, 0.45);
    if (group.current) {
      group.current.traverse(o => {
        const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
        if (m) m.opacity = vis;
      });
    }
    if (poles.current) {
      poles.current.children.forEach((pole, i) => {
        const local = sub(q, 0.3 + i * 0.08, 0.55 + i * 0.08);
        pole.scale.y = Math.max(0.001, local);
      });
    }
    if (wires.current) {
      wires.current.children.forEach(w => {
        ((w as THREE.Line).material as THREE.LineBasicMaterial).opacity = sub(q, 0.6, 0.9);
      });
    }
  });

  return (
    <>
      <group ref={group}>
        {/* Водоснабжение (teal) — несветящийся «схематичный» глоу */}
        <mesh position={[0, -0.9, -1.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, ROAD_LEN, 14]} />
          <meshBasicMaterial color="#00E5C4" transparent opacity={0} toneMapped={false} />
        </mesh>
        {/* Теплотрасса (gold) */}
        <mesh position={[0, -1.2, -2.85]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, ROAD_LEN, 14]} />
          <meshBasicMaterial color="#F0C85A" transparent opacity={0} toneMapped={false} />
        </mesh>
        {/* Кабель связи (blue) */}
        <mesh position={[0, -0.55, 2.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, ROAD_LEN, 8]} />
          <meshBasicMaterial color="#6FA0FF" transparent opacity={0} toneMapped={false} />
        </mesh>
        {/* Смотровые колодцы со светящимися горловинами */}
        {[-8, 0, 8].map(x => (
          <group key={x} position={[x, 0, -1.8]}>
            <mesh position={[0, -0.45, 0]}>
              <cylinderGeometry args={[0.42, 0.42, 0.9, 12]} />
              <meshBasicMaterial color="#0E4A40" transparent opacity={0} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.45, 0.06, 8, 20]} />
              <meshBasicMaterial color="#00E5C4" transparent opacity={0} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Потоки внутри сетей */}
      {[0, 0.33, 0.66].map(o => (
        <FlowPulse key={`w${o}`} axis="x" fixed={[-0.9, -1.8]} range={[-12, 12]} color="#7DF9E8" offset={o} progressRef={progressRef} />
      ))}
      {[0.15, 0.6].map(o => (
        <FlowPulse key={`h${o}`} axis="x" fixed={[-1.2, -2.85]} range={[-12, 12]} color="#FAE08A" offset={o} progressRef={progressRef} />
      ))}
      {[0.3, 0.8].map(o => (
        <FlowPulse key={`c${o}`} axis="x" fixed={[-0.55, 2.1]} range={[-12, 12]} color="#9BBBFF" offset={o} progressRef={progressRef} />
      ))}

      {/* Опоры ЛЭП */}
      <group ref={poles}>
        {POLES.map(x => (
          <group key={x} position={[x, 0, 5.2]}>
            <mesh position={[0, 2.1, 0]}>
              <boxGeometry args={[0.18, 4.2, 0.18]} />
              <meshStandardMaterial color="#353B48" roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.85, 0]}>
              <boxGeometry args={[0.12, 0.12, 1.5]} />
              <meshStandardMaterial color="#353B48" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Провода */}
      <group ref={wires}>
        {wirePts.map((pts, i) => (
          <DrawnWire key={i} points={pts} />
        ))}
      </group>
    </>
  );
}

function DrawnWire({ points }: { points: THREE.Vector3[] }) {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const m = new THREE.LineBasicMaterial({ color: '#8A93A8', transparent: true, opacity: 0 });
    const l = new THREE.Line(g, m);
    l.frustumCulled = false;
    return l;
  }, [points]);
  return <primitive object={line} />;
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 6 — ПРОМЫШЛЕННЫЕ ОБЪЕКТЫ: цех, резервуары, козловой кран, тупик
   ══════════════════════════════════════════════════════════════════════════ */
function Industrial({ progressRef }: { progressRef: ProgressRef }) {
  const spur = useRef<THREE.Group>(null);
  const shop = useRef<THREE.Group>(null);
  const tank = useRef<THREE.Group>(null);
  const silos = useRef<THREE.Group>(null);
  const crane = useRef<THREE.Group>(null);
  const windows = useRef<THREE.Group>(null);

  const shopGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(5.5, 3.0, 8);
    g.translate(0, 1.5, 0);
    return g;
  }, []);
  const tankGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.5, 1.5, 2.6, 20);
    g.translate(0, 1.3, 0);
    return g;
  }, []);
  const siloGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 14);
    g.translate(0, 1.1, 0);
    return g;
  }, []);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const q = phaseProgress(p, 5);
    const rise = (ref: React.RefObject<THREE.Group | null>, a: number, b: number) => {
      if (ref.current) ref.current.scale.y = Math.max(0.001, sub(q, a, b));
    };
    rise(spur, 0, 0.3);
    rise(shop, 0.15, 0.5);
    rise(tank, 0.35, 0.62);
    rise(silos, 0.5, 0.72);
    rise(crane, 0.65, 0.95);
    if (windows.current) {
      const w = sub(q, 0.5, 0.75);
      windows.current.children.forEach(c => {
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = w;
      });
    }
    if (crane.current) {
      // лёгкое качание крюка после появления
      const sway = sub(q, 0.9, 1) * Math.sin(clock.elapsedTime * 1.6) * 0.12;
      crane.current.rotation.z = sway * 0.05;
    }
  });

  return (
    <>
      {/* Подъездной тупик */}
      <group ref={spur} position={[5.9, 0, -7.5]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[2.6, 0.16, 10]} />
          <meshStandardMaterial color="#2E3340" roughness={1} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[0, 0.23, -4.5 + i * 0.82]}>
            <boxGeometry args={[2.1, 0.12, 0.2]} />
            <meshStandardMaterial color="#4A4232" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[-GAUGE, 0.36, 0]}>
          <boxGeometry args={[0.07, 0.14, 10]} />
          <meshStandardMaterial color="#C7CBD4" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[GAUGE, 0.36, 0]}>
          <boxGeometry args={[0.07, 0.14, 10]} />
          <meshStandardMaterial color="#C7CBD4" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Цех */}
      <group ref={shop} position={[10.6, 0, -7.5]}>
        <mesh geometry={shopGeo}>
          <meshStandardMaterial color="#1C2432" roughness={0.85} />
          <Edges color={GOLD_DARK} threshold={20} />
        </mesh>
        <mesh position={[0, 3.12, 0]}>
          <boxGeometry args={[5.7, 0.25, 8.2]} />
          <meshStandardMaterial color="#252D3B" roughness={0.9} />
        </mesh>
        {/* окна со стороны пути */}
        <group ref={windows}>
          {[-10.2, -8.4, -6.6, -4.8].map(z => (
            <mesh key={z} position={[-2.76, 1.7, z + 7.5]}>
              <boxGeometry args={[0.03, 0.55, 1.0]} />
              <meshBasicMaterial color={TEAL} transparent opacity={0} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Резервуар */}
      <group ref={tank} position={[13.4, 0, -3.6]}>
        <mesh geometry={tankGeo}>
          <meshStandardMaterial color="#202A3A" roughness={0.7} metalness={0.3} />
          <Edges color={GOLD_DARK} threshold={25} />
        </mesh>
        <mesh position={[0, 2.7, 0]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[1.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1E2632" roughness={0.7} metalness={0.3} />
        </mesh>
      </group>

      {/* Силосы */}
      <group ref={silos}>
        <mesh geometry={siloGeo} position={[12.6, 0, -9.2]}>
          <meshStandardMaterial color="#202A3A" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh geometry={siloGeo} position={[13.9, 0, -10.1]}>
          <meshStandardMaterial color="#202A3A" roughness={0.7} metalness={0.3} />
        </mesh>
      </group>

      {/* Козловой кран над тупиком */}
      <group ref={crane} position={[5.9, 0, -7.5]}>
        <mesh position={[-1.6, 2.2, 0]}>
          <boxGeometry args={[0.25, 4.4, 0.25]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} roughness={0.6} />
        </mesh>
        <mesh position={[1.6, 2.2, 0]}>
          <boxGeometry args={[0.25, 4.4, 0.25]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} roughness={0.6} />
        </mesh>
        <mesh position={[0, 4.55, 0]}>
          <boxGeometry args={[4.6, 0.35, 0.4]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} roughness={0.6} />
        </mesh>
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#353B48" roughness={0.6} />
        </mesh>
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
          <meshStandardMaterial color="#8A93A8" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.9, 0]}>
          <boxGeometry args={[0.3, 0.25, 0.2]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.6} roughness={0.5} />
        </mesh>
      </group>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE 7 — ГОСЭКСПЕРТИЗА: листы ПСД, печать, отметка согласования
   ══════════════════════════════════════════════════════════════════════════ */
function DocSheet({
  index,
  progressRef,
  final,
}: {
  index: number;
  progressRef: ProgressRef;
  final: { pos: [number, number, number]; rot: [number, number, number] };
}) {
  const group = useRef<THREE.Group>(null);
  const seal = useRef<THREE.Group>(null);
  const checkA = useRef<THREE.Mesh>(null);
  const checkB = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const q = phaseProgress(p, 6);
    const rise = sub(q, index * 0.16, index * 0.16 + 0.45);
    if (group.current) {
      group.current.visible = rise > 0.01;
      const bob = rise >= 1 ? Math.sin(clock.elapsedTime * 1.1 + index * 2.2) * 0.08 : 0;
      group.current.position.set(
        lerp(final.pos[0], final.pos[0], rise),
        lerp(2.1, final.pos[1], rise) + bob,
        lerp(final.pos[2], final.pos[2], rise),
      );
      group.current.rotation.set(
        lerp(-0.9, final.rot[0], rise),
        lerp(0.7, final.rot[1], rise),
        lerp(0, final.rot[2], rise),
      );
      const s = lerp(0.6, 1, rise);
      group.current.scale.set(s, s, s);
    }
    const sealQ = index === 0 ? sub(q, 0.35, 0.6) : 0;
    if (seal.current) {
      seal.current.visible = sealQ > 0.01;
      const s = ease(sealQ) * (1 + 0.25 * (1 - sealQ));
      seal.current.scale.setScalar(Math.max(0.001, s));
    }
    if (index === 0) {
      const cq = sub(q, 0.75, 0.95);
      if (checkA.current) checkA.current.scale.x = Math.max(0.001, sub(q, 0.75, 0.85));
      if (checkB.current) checkB.current.scale.x = Math.max(0.001, sub(q, 0.85, 0.97));
      if (checkA.current) checkA.current.visible = cq > 0.01;
      if (checkB.current) checkB.current.visible = cq > 0.01;
    }
  });

  return (
    <group ref={group}>
      {/* Лист — лёгкая тёплая эмиссия, чтобы читался «бумагой», а не заливкой света сцены */}
      <mesh>
        <planeGeometry args={[1.3, 1.7]} />
        <meshStandardMaterial color="#F5F7FA" emissive="#FFF4E0" emissiveIntensity={0.28} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Рамка */}
      {[
        [0, 0.84, 1.3, 0.02],
        [0, -0.84, 1.3, 0.02],
        [-0.64, 0, 0.02, 1.7],
        [0.64, 0, 0.02, 1.7],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.005]}>
          <boxGeometry args={[w, h, 0.005]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
      ))}
      {/* Строки «текста» */}
      {[0.55, 0.4, 0.25, 0.1, -0.05, -0.2].map((y, i) => (
        <mesh key={i} position={[-0.05 + (i % 2) * 0.05, y, 0.005]}>
          <boxGeometry args={[1.0 - (i % 3) * 0.22, 0.035, 0.005]} />
          <meshBasicMaterial color="#9AA2B2" />
        </mesh>
      ))}

      {index === 0 && (
        <>
          {/* Печать */}
          <group ref={seal} position={[0.28, -0.5, 0.01]}>
            <mesh>
              <cylinderGeometry args={[0.19, 0.19, 0.015, 20]} />
              <meshBasicMaterial color={GOLD} toneMapped={false} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.26, 0.02, 8, 24]} />
              <meshBasicMaterial color={GOLD} transparent opacity={0.8} toneMapped={false} />
            </mesh>
          </group>
          {/* Отметка согласования (галка) */}
          <mesh ref={checkA} position={[-0.32, -0.52, 0.012]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.26, 0.055, 0.012]} />
            <meshBasicMaterial color={TEAL} toneMapped={false} />
          </mesh>
          <mesh ref={checkB} position={[-0.1, -0.44, 0.012]} rotation={[0, 0, Math.PI / 3.2]}>
            <boxGeometry args={[0.5, 0.055, 0.012]} />
            <meshBasicMaterial color={TEAL} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Documents({ progressRef }: { progressRef: ProgressRef }) {
  const sheets = [
    { pos: [0.2, 4.5, 1.4] as [number, number, number], rot: [-0.08, -0.05, 0.02] as [number, number, number] },
    { pos: [-1.3, 4.3, 0.3] as [number, number, number], rot: [-0.15, 0.4, -0.07] as [number, number, number] },
    { pos: [1.7, 4.2, 0.1] as [number, number, number], rot: [-0.12, -0.55, 0.09] as [number, number, number] },
  ];
  return (
    <>
      {sheets.map((s, i) => (
        <DocSheet key={i} index={i} final={s} progressRef={progressRef} />
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   АТМОСФЕРА — золотая пыль
   ══════════════════════════════════════════════════════════════════════════ */
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 140;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 42;
      arr[i * 3 + 1] = Math.random() * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 42;
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.008;
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.25) * 0.15;
    }
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={GOLD} size={0.06} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT
   ══════════════════════════════════════════════════════════════════════════ */
function SceneRoot({ progressRef }: { progressRef: ProgressRef }) {
  return (
    <>
      <CameraRig progressRef={progressRef} />

      <directionalLight position={[6, 10, 4]} intensity={2.0} color={GOLD} />
      <directionalLight position={[-8, 6, -6]} intensity={1.0} color={TEAL} />
      <ambientLight intensity={0.7} color="#4A5670" />

      <fog attach="fog" args={[DARK, 24, 72]} />

      <Grid
        position={[0, -0.02, 0]}
        infiniteGrid
        cellSize={1}
        sectionSize={5}
        cellColor="#1A2436"
        sectionColor="#2A3A52"
        fadeDistance={46}
        fadeStrength={1.2}
      />

      <BlueprintStage progressRef={progressRef} />
      <Terrain progressRef={progressRef} />
      <Road progressRef={progressRef} />
      <Railway progressRef={progressRef} />
      <Crossing progressRef={progressRef} />
      <Networks progressRef={progressRef} />
      <Industrial progressRef={progressRef} />
      <Documents progressRef={progressRef} />
      <Particles />
    </>
  );
}

export default function ConstructionScene({ progressRef }: { progressRef: ProgressRef }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [-20, 13.5, -20], fov: 42, near: 0.1, far: 220 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={[DARK]} />
      <SceneRoot progressRef={progressRef} />
    </Canvas>
  );
}
