'use client';

/* Корень WebGL-сцены «цифрового полигона» WAG.
   Камера идёт по 11 ключевым кадрам (скролл = время), ландшафт — тёмная
   долина с холмами по периметру, атмосфера — золотая пыль + туман.
   Аннотации — HTML-выноски, привязанные к 3D-точкам (drei Html),
   прозрачность анимируется напрямую через style, без setState. */

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  ProgressRef, clamp01, ease, subAbs, cutaway,
  RAIL_X, DARK, GOLD,
} from './phases';
import {
  Survey, DesignGhosts, Earthworks, RoadWorks, RailwayWorks,
  CrossingWorks, NetworkWorks, IndustrialWorks, ExpertiseDocs, sharedRefs,
} from './Stages';
import { Excavator, DumpTruck, Paver, Roller, Train, Car } from './Vehicles';
import styles from './claude3d.module.css';

/* ── Камера: ключевые кадры по прогрессу ─────────────────────────────── */
/* Пары ключей на фазу: кадр «въезжает» и ДЕРЖИТСЯ до конца фазы,
   перелёт к следующему ракурсу происходит на границе фаз.
   Дистанции увеличены — сцена смотрится общими планами. */
const CAM_KEYS = [
  { p: 0.0, pos: [-27, 18, -27], tgt: [0, 0, 0] },              // интро: вся долина
  { p: 0.095, pos: [-19, 12, -20], tgt: [0, 0.4, 0] },          // изыскания
  { p: 0.11, pos: [-17, 11, -18], tgt: [0, 0.6, 0] },           // проектирование
  { p: 0.185, pos: [-15.5, 10.5, -16.5], tgt: [0, 0.7, 0] },    // держим чертёж
  { p: 0.21, pos: [2.6, 6.3, 11], tgt: [0.6, 5.05, 0.2] },      // ГосЭкспертиза: листы
  { p: 0.275, pos: [2.6, 6.3, 10.4], tgt: [0.6, 5.05, 0.2] },   // держим штамп
  { p: 0.3, pos: [-16, 8.5, -12], tgt: [-4, 0.5, 1] },          // земляные работы
  { p: 0.39, pos: [-15, 8, -11], tgt: [-3.5, 0.5, 0.5] },       // держим кадр
  { p: 0.41, pos: [-14, 8, 12.5], tgt: [-2, 0.6, 0] },          // дорога: три четверти
  { p: 0.485, pos: [0, 7.5, 13.5], tgt: [1, 0.7, -0.5] },       // дорога: держим
  { p: 0.5, pos: [10, 7, 14], tgt: [RAIL_X, 0.8, -3] },         // ж/д путь
  { p: 0.62, pos: [-9.5, 4.6, 11], tgt: [RAIL_X, 1.1, 0] },     // переезд: к событию
  { p: 0.695, pos: [-9, 4.4, 10.5], tgt: [RAIL_X, 1.1, 0] },    // держим проезд поезда
  { p: 0.71, pos: [11.5, 6.5, 12], tgt: [-1, -0.8, -0.5] },     // сети: рентген
  { p: 0.795, pos: [8.5, 7, 14], tgt: [-2, -0.5, 0] },          // сети: держим
  { p: 0.815, pos: [30, 12, -26], tgt: [10, 1, -8] },           // промка: широко
  { p: 0.895, pos: [26, 10, -22], tgt: [9.5, 1.3, -8] },        // промка: push-in
  { p: 0.93, pos: [-21, 14, -21], tgt: [0, 1.2, 0] },           // сдача: полигон живёт
  { p: 1.0, pos: [-25, 16, -25], tgt: [0, 1.2, 0] },            // медленный отъезд
] as const;

function CameraRig({ progressRef, allowMotion }: { progressRef: ProgressRef; allowMotion: boolean }) {
  const { camera, pointer } = useThree();
  const keys = useMemo(
    () =>
      CAM_KEYS.map(k => ({
        p: k.p,
        pos: new THREE.Vector3(...(k.pos as unknown as [number, number, number])),
        tgt: new THREE.Vector3(...(k.tgt as unknown as [number, number, number])),
      })),
    [],
  );
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p = clamp01(progressRef.current);
    const t = sharedRefs.t.current;
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].p) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const k = ease(clamp01((p - a.p) / (b.p - a.p || 1)));
    pos.lerpVectors(a.pos, b.pos, k);
    tgt.lerpVectors(a.tgt, b.tgt, k);

    // лёгкий дрейф + параллакс от указателя (без мутации самих ключей)
    const dx = allowMotion ? Math.sin(t * 0.13) * 0.3 + pointer.x * 0.8 : 0;
    const dy = allowMotion ? Math.sin(t * 0.09) * 0.18 + pointer.y * 0.4 : 0;
    camera.position.set(pos.x + dx, pos.y + dy, pos.z);
    camera.lookAt(tgt);
  });
  return null;
}

/* ── Ландшафт: тёмная долина, холмы по периметру.
     В фазе сетей уходит в «рентген», открывая подземные коммуникации. ── */
function Terrain({ progressRef }: { progressRef: ProgressRef }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(110, 96, 72, 60);
    const posAttr = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i); // до поворота: y плоскости → мировая -Z
      const d = Math.sqrt(x * x + y * y * 1.25);
      const k = ease(clamp01((d - 20) / 18));
      const h =
        Math.max(0, Math.sin(x * 0.31) * Math.cos(y * 0.24) * 1.7 + Math.sin(x * 0.11 + y * 0.17) * 2.3) * k;
      posAttr.setZ(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame(() => {
    if (mat.current) mat.current.opacity = 1 - cutaway(progressRef.current) * 0.92;
  });

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
      <meshStandardMaterial ref={mat} color="#060A14" roughness={1} transparent />
    </mesh>
  );
}

/* ── Золотая пыль ────────────────────────────────────────────────────── */
function makeDustGeometry(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const N = 160;
  const arr = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 46;
    arr[i * 3 + 1] = Math.random() * 10;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 46;
  }
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  return g;
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => makeDustGeometry(), []);

  useFrame(() => {
    const t = sharedRefs.t.current;
    if (ref.current) {
      ref.current.rotation.y = t * 0.008;
      ref.current.position.y = Math.sin(t * 0.22) * 0.18;
    }
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={GOLD} size={0.055} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

/* ── HTML-выноска, привязанная к 3D-точке ────────────────────────────── */
interface AnnoDef {
  pos: [number, number, number];
  kicker: string;
  text: string;
  window: [number, number]; // абсолютный p
}

const ANNOS: AnnoDef[] = [
  { pos: [-6.5, 2.3, -7], kicker: 'ИГДИ', text: 'Тахеометрическая съёмка · опорная сеть', window: [0.03, 0.09] },
  { pos: [RAIL_X, 1.9, 9], kicker: 'ПСД', text: 'Оси трасс · генплан М 1:500', window: [0.12, 0.18] },
  { pos: [-1.35, 4.6, -0.15], kicker: 'РГП ГЭ', text: 'Положительное заключение', window: [0.24, 0.27] },
  { pos: [-7.5, 2.4, 4.8], kicker: 'СМР', text: 'Насыпь h=0,5 м · Kу ≥ 0,98', window: [0.31, 0.39] },
  { pos: [-3, 2.0, 3.2], kicker: 'ВСП-а/д', text: 'Асфальтобетон · 2 слоя по щебню', window: [0.44, 0.49] },
  { pos: [RAIL_X, 2.4, -8], kicker: 'ВСП-ж/д', text: 'Р65 · колея 1520 мм · ЖБ шпалы', window: [0.54, 0.6] },
  { pos: [RAIL_X - 5.5, 2.3, 4.6], kicker: 'АПС', text: 'Шлагбаумы-автоматы + светофоры', window: [0.63, 0.695] },
  { pos: [-6, 1.7, -2.6], kicker: 'Сети', text: 'Водовод ПЭ Ø315 · теплосеть · ВОЛС', window: [0.715, 0.79] },
  { pos: [7, 5.0, 6.4], kicker: 'ЛЭП', text: 'ВЛ 10 кВ вдоль трассы', window: [0.752, 0.795] },
  { pos: [11.5, 4.4, -11.6], kicker: 'ПТО', text: 'Цех · РВС-2000 · кран 12,5 т', window: [0.83, 0.895] },
];

function Annotation({ def }: { def: AnnoDef }) {
  const el = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const p = sharedRefs.p.current;
    const inW = subAbs(p, def.window[0], def.window[0] + 0.012);
    const outW = 1 - subAbs(p, def.window[1], def.window[1] + 0.012);
    const o = Math.min(inW, outW);
    if (el.current) {
      el.current.style.opacity = o.toFixed(3);
      el.current.style.transform = `translateY(${((1 - o) * 10).toFixed(1)}px)`;
    }
  });

  return (
    <group position={def.pos}>
      <Html center distanceFactor={13} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={el} className={styles.anno} style={{ opacity: 0 }}>
          <span className={styles.annoKicker}>{def.kicker}</span>
          <span className={styles.annoText}>{def.text}</span>
        </div>
      </Html>
    </group>
  );
}

/* ── Композиция ──────────────────────────────────────────────────────── */
function SceneRoot({ progressRef, allowMotion }: { progressRef: ProgressRef; allowMotion: boolean }) {
  // ambient-время: замирает при prefers-reduced-motion
  useFrame((_, delta) => {
    if (allowMotion) sharedRefs.t.current += Math.min(delta, 0.05);
  });

  return (
    <>
      <CameraRig progressRef={progressRef} allowMotion={allowMotion} />

      <hemisphereLight args={['#3A465E', '#10141E', 1.05]} />
      <directionalLight position={[8, 13, 5]} intensity={1.9} color={GOLD} />
      <directionalLight position={[-9, 7, -7]} intensity={0.85} color="#00C4A7" />
      {/* Заполняющий свет со стороны «дорожных» ракурсов (+Z) */}
      <directionalLight position={[2, 6, 16]} intensity={0.5} color="#7E90B8" />

      <fog attach="fog" args={[DARK, 26, 82]} />

      <Terrain progressRef={progressRef} />
      <Grid
        position={[0, -0.01, 0]}
        infiniteGrid
        cellSize={1}
        sectionSize={5}
        cellColor="#16202F"
        sectionColor="#263650"
        fadeDistance={48}
        fadeStrength={1.3}
      />

      {/* Стадии */}
      <Survey progressRef={progressRef} timeRef={sharedRefs.t} />
      <DesignGhosts progressRef={progressRef} />
      <Earthworks progressRef={progressRef} />
      <RoadWorks progressRef={progressRef} />
      <RailwayWorks progressRef={progressRef} />
      <CrossingWorks progressRef={progressRef} timeRef={sharedRefs.t} />
      <NetworkWorks progressRef={progressRef} timeRef={sharedRefs.t} />
      <IndustrialWorks progressRef={progressRef} timeRef={sharedRefs.t} />
      <ExpertiseDocs progressRef={progressRef} timeRef={sharedRefs.t} />

      {/* Техника и подвижной состав */}
      <Excavator progressRef={progressRef} timeRef={sharedRefs.t} />
      <DumpTruck progressRef={progressRef} />
      <Paver progressRef={progressRef} timeRef={sharedRefs.t} />
      <Roller progressRef={progressRef} timeRef={sharedRefs.t} />
      <Train progressRef={progressRef} timeRef={sharedRefs.t} />
      <Car progressRef={progressRef} timeRef={sharedRefs.t} />

      {/* Выноски */}
      {ANNOS.map((a, i) => (
        <Annotation key={i} def={a} />
      ))}

      <Dust />
    </>
  );
}

export default function Scene({
  progressRef,
  active,
  allowMotion,
}: {
  progressRef: ProgressRef;
  active: boolean;
  allowMotion: boolean;
}) {
  // единый канал прогресса для DrawnLine/аннотаций
  useEffect(() => {
    sharedRefs.p = progressRef;
  }, [progressRef]);

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [-21, 15, -21], fov: 40, near: 0.1, far: 240 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={[DARK]} />
      <SceneRoot progressRef={progressRef} allowMotion={allowMotion} />
    </Canvas>
  );
}
