'use client';

/* Стадии стройки. Принципы:
   — конструкции растут ВДОЛЬ трассы (за техникой), а не «из-под земли»;
   — переезд — это система: сигнализация и шлагбаумы реагируют на поезд
     (в финале — автоматически, по фактической позиции состава);
   — фаза сетей — разрез: полотно просвечивает, коммуникации живут
     пульсами потоков;
   — финал: модель складывается в проштампованный комплект ПСД.

   Все анимации — через progressRef/timeRef в useFrame, без setState. */

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import {
  ProgressRef, TimeRef, phaseProgress, sub, subAbs, lerp, clamp01, ease, cutaway,
  ROAD_LEN, ROAD_W, ROAD_EMB_H, ASPHALT_TOP,
  RAIL_X, RAIL_LEN, GAUGE, RAIL_EMB_H, SLEEPER_TOP, RAIL_H, RAIL_TOP,
  SPUR_Z, LEP_Z, CINE, ALIVE_FROM,
  GOLD, GOLD_LIGHT, GOLD_DARK, TEAL, BLUE, RED, STEEL, CONCRETE,
} from './phases';
import { GlowSprite } from './fx';
import { asphaltProgress, trainZ } from './Vehicles';

const S = (v: number) => Math.max(0.001, v);

/* ── Общий помощник: линия с прорисовкой drawRange ──────────────────── */
function DrawnLine({
  points,
  color,
  opacity = 1,
  progress,
}: {
  points: THREE.Vector3[];
  color: string;
  opacity?: number;
  /** (p, t) → доля прорисовки 0..1; отриц. значение скрывает линию */
  progress: (p: number, t: number) => number;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, toneMapped: false });
    const l = new THREE.Line(g, m);
    l.frustumCulled = false;
    l.visible = false;
    return l;
  }, [points, color, opacity]);

  useFrame(() => {
    const l = lineRef.current;
    if (!l) return;
    const q = progress(sharedRefs.p.current, sharedRefs.t.current);
    const n = Math.max(0, Math.floor(points.length * clamp01(q)));
    l.geometry.setDrawRange(0, n);
    l.visible = q > 0.005 && n > 1;
  });

  return <primitive object={line} ref={lineRef} />;
}

/* Общие refs, инициализируются из SceneRoot до первого кадра */
export const sharedRefs: { p: ProgressRef; t: TimeRef } = {
  p: { current: 0 },
  t: { current: 0 },
};

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 0 — ИЗЫСКАНИЯ: сканирующие кольца, тахеометр, реперы, горизонтали
   ══════════════════════════════════════════════════════════════════════ */
export function Survey({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Group>(null);
  const markers = useRef<THREE.Group>(null);
  const theo = useRef<THREE.Group>(null);

  const contourPts = useMemo(() => {
    // три «горизонтали» — неровные замкнутые петли вокруг площадки
    const mk = (r: number, wob: number, seed: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const rr = r + Math.sin(a * 3 + seed) * wob + Math.cos(a * 5 + seed * 2) * wob * 0.6;
        pts.push(new THREE.Vector3(Math.cos(a) * rr, 0.04, Math.sin(a) * rr * 0.82));
      }
      return pts;
    };
    return [mk(9, 0.8, 1), mk(13, 1.2, 3), mk(17, 1.6, 5)];
  }, []);

  const MARKERS = useMemo(
    () => [
      [-9, -6], [-3, 5], [4, -10], [9, 3], [RAIL_X, -14], [RAIL_X, 12], [-11, 8],
    ] as const,
    [],
  );

  useFrame(() => {
    const p = progressRef.current;
    const t = timeRef.current;
    const q = phaseProgress(p, 0);
    const fade = 1 - phaseProgress(p, 3); // держим до земляных работ

    const pulse = (m: THREE.Mesh | null, off: number) => {
      if (!m) return;
      const k = ((t * 0.28 + off) % 1);
      m.visible = q > 0.08 && fade > 0.02;
      m.scale.setScalar(S(lerp(1.5, 21, k)));
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.4 * fade * sub(q, 0.05, 0.3);
    };
    pulse(ringA.current, 0);
    pulse(ringB.current, 0.5);

    if (theo.current) {
      theo.current.visible = fade > 0.02;
      theo.current.scale.setScalar(S(sub(q, 0.05, 0.25) * fade));
    }
    if (beam.current) {
      beam.current.rotation.y = t * 0.7;
      beam.current.visible = q > 0.25 && fade > 0.02;
    }
    if (markers.current) {
      markers.current.visible = fade > 0.02;
      markers.current.children.forEach((c, i) => {
        const local = sub(q, 0.25 + i * 0.06, 0.45 + i * 0.06);
        c.scale.setScalar(S(local * fade * (0.85 + Math.sin(t * 2.5 + i * 1.9) * 0.18)));
        c.position.y = 0.3 + Math.sin(t * 1.3 + i) * 0.05;
      });
    }
  });

  return (
    <>
      {/* Сканирующие кольца */}
      <mesh ref={ringA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} visible={false}>
        <ringGeometry args={[0.96, 1, 64]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} visible={false}>
        <ringGeometry args={[0.96, 1, 64]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Горизонтали рельефа */}
      {contourPts.map((pts, i) => (
        <DrawnLine
          key={i}
          points={pts}
          color={i === 1 ? GOLD_DARK : '#274058'}
          opacity={0.75}
          progress={p => sub(phaseProgress(p, 0), 0.15 + i * 0.1, 0.65 + i * 0.1) * (1 - phaseProgress(p, 3))}
        />
      ))}

      {/* Тахеометр на треноге + вращающийся визирный луч */}
      <group ref={theo} position={[-6.5, 0, -7]} visible={false}>
        {[0, 2.1, 4.2].map(a => (
          <mesh key={a} position={[Math.sin(a) * 0.4, 0.55, Math.cos(a) * 0.4]} rotation={[0.32 * Math.cos(a), 0, -0.32 * Math.sin(a)]}>
            <cylinderGeometry args={[0.03, 0.045, 1.15, 6]} />
            <meshStandardMaterial color="#2A2F3A" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 1.22, 0]}>
          <boxGeometry args={[0.3, 0.26, 0.34]} />
          <meshStandardMaterial color={GOLD} roughness={0.5} emissive={GOLD} emissiveIntensity={0.25} />
        </mesh>
        <group ref={beam} position={[0, 1.22, 0]}>
          <mesh position={[0, 0, 5.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.05, 11, 6, 1, true]} />
            <meshBasicMaterial color={TEAL} transparent opacity={0.35} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <GlowSprite color={TEAL} size={0.6} position={[0, 0, 0]} opacity={0.8} />
        </group>
      </group>

      {/* Съёмочные реперы */}
      <group ref={markers} visible={false}>
        {MARKERS.map(([x, z], i) => (
          <group key={i} position={[x, 0.3, z]}>
            <mesh>
              <octahedronGeometry args={[0.15]} />
              <meshBasicMaterial color={i % 2 ? GOLD : TEAL} transparent opacity={0.95} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.22, 0.26, 24]} />
              <meshBasicMaterial color={i % 2 ? GOLD : TEAL} transparent opacity={0.4} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 1 — ПРОЕКТИРОВАНИЕ: оси, габариты будущих сооружений (голограммы)
   ══════════════════════════════════════════════════════════════════════ */
export function DesignGhosts({ progressRef }: { progressRef: ProgressRef }) {
  const ghosts = useRef<THREE.Group>(null);

  const roadAxis = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) pts.push(new THREE.Vector3(-ROAD_LEN / 2 + (ROAD_LEN * i) / 100, 0.08, 0));
    return pts;
  }, []);
  const railAxis = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) pts.push(new THREE.Vector3(RAIL_X, 0.08, -RAIL_LEN / 2 + (RAIL_LEN * i) / 100));
    return pts;
  }, []);
  const spurAxis = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) pts.push(new THREE.Vector3(4.5 + (11.5 * i) / 60, 0.08, SPUR_Z));
    return pts;
  }, []);

  const GHOSTS: { pos: [number, number, number]; size: [number, number, number] }[] = useMemo(
    () => [
      { pos: [0, ROAD_EMB_H / 2 + 0.15, 0], size: [ROAD_LEN, ROAD_EMB_H + 0.3, ROAD_W + 1.2] },      // дорога
      { pos: [RAIL_X, 0.55, 0], size: [4.4, 1.1, RAIL_LEN] },                                        // ж/д призма
      { pos: [11.5, 1.6, -11], size: [6, 3.2, 5] },                                                  // цех
      { pos: [15, 1.4, -4.5], size: [3.2, 2.8, 3.2] },                                               // резервуар
    ],
    [],
  );

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 1);
    // голограммы живут через фазу ГосЭкспертизы (штамп ставится «над чертежом»)
    const fade = 1 - phaseProgress(p, 3);
    if (!ghosts.current) return;
    ghosts.current.visible = q > 0.15 && fade > 0.02;
    ghosts.current.children.forEach((c, i) => {
      const local = sub(q, 0.2 + i * 0.12, 0.5 + i * 0.12) * fade;
      c.scale.y = S(local);
      const fill = c.children[0] as THREE.Mesh;
      const wire = c.children[1] as THREE.Mesh;
      (fill.material as THREE.MeshBasicMaterial).opacity = 0.05 * local;
      (wire.material as THREE.MeshBasicMaterial).opacity = 0.3 * local;
    });
  });

  const axisDraw = (delay: number) => (p: number) =>
    sub(phaseProgress(p, 1), delay, delay + 0.35) * (1 - phaseProgress(p, 3));

  return (
    <>
      <DrawnLine points={roadAxis} color={GOLD} progress={axisDraw(0)} />
      <DrawnLine points={railAxis} color={TEAL} progress={axisDraw(0.1)} />
      <DrawnLine points={spurAxis} color={BLUE} progress={axisDraw(0.22)} />

      <group ref={ghosts} visible={false}>
        {GHOSTS.map((g, i) => (
          <group key={i} position={g.pos}>
            <mesh>
              <boxGeometry args={g.size} />
              <meshBasicMaterial color={GOLD} transparent opacity={0} toneMapped={false} depthWrite={false} />
            </mesh>
            <mesh>
              <boxGeometry args={g.size} />
              <meshBasicMaterial color={GOLD_LIGHT} wireframe transparent opacity={0.3} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 2 — ЗЕМЛЯНЫЕ РАБОТЫ: площадка и насыпи растут вдоль трасс
   (за техникой), в фазе сетей полотно просвечивает (разрез)
   ══════════════════════════════════════════════════════════════════════ */
export function Earthworks({ progressRef }: { progressRef: ProgressRef }) {
  const gate = useRef<THREE.Group>(null);
  const slabMat = useRef<THREE.MeshStandardMaterial>(null);
  const roadEmb = useRef<THREE.Mesh>(null);
  const railEmb = useRef<THREE.Mesh>(null);
  const roadEmbMat = useRef<THREE.MeshStandardMaterial>(null);
  const railEmbMat = useRef<THREE.MeshStandardMaterial>(null);

  // якорь у начала: насыпь растёт по длине, как её реально отсыпают
  const roadEmbGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(ROAD_LEN, ROAD_EMB_H, ROAD_W + 1.2);
    g.translate(ROAD_LEN / 2, ROAD_EMB_H / 2, 0);
    return g;
  }, []);
  const railEmbGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(4.4, RAIL_EMB_H, RAIL_LEN);
    g.translate(0, RAIL_EMB_H / 2, RAIL_LEN / 2);
    return g;
  }, []);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 3);
    const cut = cutaway(p);

    if (gate.current) gate.current.visible = q > 0.01;
    if (slabMat.current) {
      slabMat.current.opacity = clamp01(sub(q, 0, 0.3)) * (1 - cut * 0.92);
    }
    if (roadEmb.current) roadEmb.current.scale.x = S(sub(q, 0.15, 0.7));
    if (railEmb.current) railEmb.current.scale.z = S(sub(q, 0.45, 0.95));
    if (roadEmbMat.current) roadEmbMat.current.opacity = 1 - cut * 0.95;
    if (railEmbMat.current) railEmbMat.current.opacity = 1 - cut * 0.75;
  });

  return (
    <group ref={gate} visible={false}>
      {/* Спланированная площадка */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[48, 46]} />
        <meshStandardMaterial ref={slabMat} color="#0C1120" roughness={1} transparent opacity={0} />
      </mesh>

      <mesh ref={roadEmb} geometry={roadEmbGeo} position={[-ROAD_LEN / 2, 0, 0]}>
        <meshStandardMaterial ref={roadEmbMat} color="#2B303B" roughness={0.95} transparent />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>
      <mesh ref={railEmb} geometry={railEmbGeo} position={[RAIL_X, 0, -RAIL_LEN / 2]}>
        <meshStandardMaterial ref={railEmbMat} color="#282D38" roughness={0.95} transparent />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 3 — АВТОДОРОГА: основание, асфальт ЗА укладчиком, кромки, разметка
   ══════════════════════════════════════════════════════════════════════ */
export function RoadWorks({ progressRef }: { progressRef: ProgressRef }) {
  const gate = useRef<THREE.Group>(null);
  const base = useRef<THREE.Mesh>(null);
  const asphalt = useRef<THREE.Mesh>(null);
  const baseMat = useRef<THREE.MeshStandardMaterial>(null);
  const asphaltMat = useRef<THREE.MeshStandardMaterial>(null);
  const edgeL = useRef<THREE.Mesh>(null);
  const edgeR = useRef<THREE.Mesh>(null);
  const dashes = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const DASH_X = useMemo(() => {
    const xs: number[] = [];
    for (let x = -11.5; x <= 11.5; x += 2.4) {
      if (x > -1.6 && x < 7.6) continue; // разрыв на переезде
      xs.push(x);
    }
    return xs;
  }, []);

  const baseGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(ROAD_LEN, 0.15, ROAD_W + 0.5);
    g.translate(ROAD_LEN / 2, 0.075, 0);
    return g;
  }, []);
  const asphaltGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(ROAD_LEN, 0.1, ROAD_W);
    g.translate(ROAD_LEN / 2, 0.05, 0);
    return g;
  }, []);

  useLayoutEffect(() => {
    for (let i = 0; i < DASH_X.length; i++) {
      dummy.position.set(DASH_X[i], ASPHALT_TOP + 0.007, 0);
      dummy.scale.set(0.001, 1, 1);
      dummy.updateMatrix();
      dashes.current.setMatrixAt(i, dummy.matrix);
    }
  }, [DASH_X, dummy]);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 4);
    const cut = cutaway(p);

    if (gate.current) gate.current.visible = q > 0.01;
    if (base.current) base.current.scale.x = S(sub(q, 0, 0.22));
    if (asphalt.current) asphalt.current.scale.x = S(asphaltProgress(p));
    if (baseMat.current) baseMat.current.opacity = 1 - cut * 0.95;
    if (asphaltMat.current) asphaltMat.current.opacity = 1 - cut * 0.88;

    const eo = sub(q, 0.82, 0.92);
    if (edgeL.current) (edgeL.current.material as THREE.MeshBasicMaterial).opacity = eo;
    if (edgeR.current) (edgeR.current.material as THREE.MeshBasicMaterial).opacity = eo;

    const m = sub(q, 0.86, 1);
    for (let i = 0; i < DASH_X.length; i++) {
      const local = clamp01(m * 1.7 - (i / DASH_X.length) * 0.7);
      dummy.position.set(DASH_X[i], ASPHALT_TOP + 0.007, 0);
      dummy.scale.set(S(ease(local)), 1, 1);
      dummy.updateMatrix();
      dashes.current.setMatrixAt(i, dummy.matrix);
    }
    dashes.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={gate} visible={false}>
      <mesh ref={base} geometry={baseGeo} position={[-ROAD_LEN / 2, ROAD_EMB_H, 0]}>
        <meshStandardMaterial ref={baseMat} color="#3E4552" roughness={0.95} transparent />
      </mesh>
      <mesh ref={asphalt} geometry={asphaltGeo} position={[-ROAD_LEN / 2, ROAD_EMB_H + 0.15, 0]}>
        <meshStandardMaterial ref={asphaltMat} color="#232833" roughness={0.98} transparent />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>

      <mesh ref={edgeL} position={[0, ASPHALT_TOP + 0.007, ROAD_W / 2 - 0.25]}>
        <boxGeometry args={[ROAD_LEN - 1, 0.012, 0.12]} />
        <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh ref={edgeR} position={[0, ASPHALT_TOP + 0.007, -ROAD_W / 2 + 0.25]}>
        <boxGeometry args={[ROAD_LEN - 1, 0.012, 0.12]} />
        <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
      </mesh>

      <instancedMesh ref={dashes} args={[undefined, undefined, DASH_X.length]} frustumCulled={false}>
        <boxGeometry args={[1.25, 0.012, 0.15]} />
        <meshBasicMaterial color={GOLD_LIGHT} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 4 — Ж/Д ПУТЬ: призма вдоль, шпалы падают каскадом, плети растут
   со светящимся «фронтом укладки»
   ══════════════════════════════════════════════════════════════════════ */
export function RailwayWorks({ progressRef }: { progressRef: ProgressRef }) {
  const gate = useRef<THREE.Group>(null);
  const ballast = useRef<THREE.Mesh>(null);
  const sleepers = useRef<THREE.InstancedMesh>(null!);
  const railL = useRef<THREE.Mesh>(null);
  const railR = useRef<THREE.Mesh>(null);
  const tip = useRef<THREE.Sprite>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const N_SLEEPERS = 46;
  const ballastGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(3.4, 0.2, RAIL_LEN);
    g.translate(0, 0.1, RAIL_LEN / 2);
    return g;
  }, []);
  const railGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.07, RAIL_H, RAIL_LEN);
    g.translate(0, 0, RAIL_LEN / 2);
    return g;
  }, []);

  useLayoutEffect(() => {
    for (let i = 0; i < N_SLEEPERS; i++) {
      dummy.position.set(RAIL_X, SLEEPER_TOP + 4, -16.6 + i * (33.2 / (N_SLEEPERS - 1)));
      dummy.scale.setScalar(0.001);
      dummy.updateMatrix();
      sleepers.current.setMatrixAt(i, dummy.matrix);
    }
  }, [dummy]);

  useFrame(() => {
    const p = progressRef.current;
    // фаза 5 «Ж/д путь и переезд»: путь строится в первой половине окна
    const q = phaseProgress(p, 5);

    if (gate.current) gate.current.visible = q > 0.01;
    if (ballast.current) ballast.current.scale.z = S(sub(q, 0, 0.22));

    // шпалы «опускаются с крана» каскадом вдоль пути
    const m = sub(q, 0.08, 0.42);
    for (let i = 0; i < N_SLEEPERS; i++) {
      const local = ease(clamp01(m * 1.6 - (i / N_SLEEPERS) * 0.6));
      const drop = 1 - local;
      dummy.position.set(RAIL_X, SLEEPER_TOP - 0.075 + drop * 2.4, -16.6 + i * (33.2 / (N_SLEEPERS - 1)));
      dummy.scale.setScalar(S(local));
      dummy.updateMatrix();
      sleepers.current.setMatrixAt(i, dummy.matrix);
    }
    sleepers.current.instanceMatrix.needsUpdate = true;

    const rq = sub(q, 0.32, 0.58);
    if (railL.current) railL.current.scale.z = S(rq);
    if (railR.current) railR.current.scale.z = S(rq);
    if (tip.current) {
      tip.current.visible = rq > 0.01 && rq < 0.995;
      tip.current.position.set(RAIL_X, SLEEPER_TOP + RAIL_H, -RAIL_LEN / 2 + RAIL_LEN * rq);
      tip.current.material.opacity = 0.9;
    }
  });

  return (
    <group ref={gate} visible={false}>
      <mesh ref={ballast} geometry={ballastGeo} position={[RAIL_X, RAIL_EMB_H, -RAIL_LEN / 2]}>
        <meshStandardMaterial color="#2E3340" roughness={1} />
      </mesh>

      <instancedMesh ref={sleepers} args={[undefined, undefined, N_SLEEPERS]} frustumCulled={false}>
        <boxGeometry args={[2.5, 0.15, 0.24]} />
        <meshStandardMaterial color="#494235" roughness={0.9} />
      </instancedMesh>

      <mesh ref={railL} geometry={railGeo} position={[RAIL_X - GAUGE, SLEEPER_TOP + RAIL_H / 2, -RAIL_LEN / 2]}>
        <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh ref={railR} geometry={railGeo} position={[RAIL_X + GAUGE, SLEEPER_TOP + RAIL_H / 2, -RAIL_LEN / 2]}>
        <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.3} />
      </mesh>
      <GlowSprite spriteRef={tip} color={GOLD_LIGHT} size={1.6} opacity={0.9} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 5 — ПЕРЕЕЗД: настил + АПС. Шлагбаумы и светофоры реагируют
   на поезд; в финале — автоматика по фактической позиции состава.
   ══════════════════════════════════════════════════════════════════════ */
function barrierClosedAmount(p: number, current: number): number {
  if (p >= ALIVE_FROM) {
    const target = Math.abs(trainZ.current) < 9.5 ? 1 : 0;
    return lerp(current, target, 0.06); // плавный сервопривод
  }
  return subAbs(p, CINE.barriersDown[0], CINE.barriersDown[1]) * (1 - subAbs(p, CINE.barriersUp[0], CINE.barriersUp[1]));
}

/* Шлагбаум стоит на обочине СПРАВА от своей полосы движения ПЕРЕД
   переездом; стрела перекрывает проезжую часть поперёк дороги и
   поднимается ВЕРТИКАЛЬНО вверх при открытии (как настоящий ПАШ). */
function CrossingBarrier({
  position,
  armSign,
  progressRef,
}: {
  position: [number, number, number];
  /** +1 — стрела уходит в +Z, −1 — в −Z (к оси дороги) */
  armSign: 1 | -1;
  progressRef: ProgressRef;
}) {
  const root = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const closedRef = useRef(0);
  const openAngle = armSign * -1.45; // стрела задирается вверх над своей стойкой

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 5);
    if (root.current) root.current.scale.setScalar(S(sub(q, 0.56, 0.66)));
    closedRef.current = clamp01(barrierClosedAmount(p, closedRef.current));
    if (arm.current) arm.current.rotation.x = lerp(openAngle, 0, ease(closedRef.current));
  });

  return (
    <group position={position} ref={root}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.22, 1.1, 0.22]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <boxGeometry args={[0.3, 0.14, 0.3]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      <group ref={arm} position={[0, 1.15, 0]} rotation={[openAngle, 0, 0]}>
        <mesh position={[0, 0, armSign * 1.95]}>
          <boxGeometry args={[0.09, 0.09, 3.9]} />
          <meshStandardMaterial color="#E8EAF0" roughness={0.6} />
        </mesh>
        {[0.8, 1.9, 3.0].map(z => (
          <mesh key={z} position={[0, 0, armSign * z]}>
            <boxGeometry args={[0.1, 0.1, 0.7]} />
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
  blinkPhase,
  progressRef,
  timeRef,
}: {
  position: [number, number, number];
  rotationY: number;
  blinkPhase: number;
  progressRef: ProgressRef;
  timeRef: TimeRef;
}) {
  const root = useRef<THREE.Group>(null);
  const lampA = useRef<THREE.Sprite>(null);
  const lampB = useRef<THREE.Sprite>(null);
  const closedRef = useRef(0);

  useFrame(() => {
    const p = progressRef.current;
    const t = timeRef.current;
    const q = phaseProgress(p, 5);
    if (root.current) root.current.scale.setScalar(S(sub(q, 0.6, 0.7)));
    closedRef.current = clamp01(barrierClosedAmount(p, closedRef.current));
    const active = closedRef.current > 0.4 ? 1 : 0;
    const blink = Math.sin(t * 6 + blinkPhase) > 0 ? 1 : 0.06;
    if (lampA.current) lampA.current.material.opacity = 0.06 + active * blink * 0.9;
    if (lampB.current) lampB.current.material.opacity = 0.06 + active * (1.06 - blink) * 0.9;
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]} ref={root}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.05, 0.065, 2.6, 8]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.48, 0.08]}>
        <boxGeometry args={[0.56, 0.34, 0.16]} />
        <meshStandardMaterial color="#12151C" roughness={0.6} />
      </mesh>
      {[[-0.14, 0], [0.14, Math.PI]].map(([ox], i) => (
        <mesh key={i} position={[ox as number, 2.48, 0.17]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.3} toneMapped={false} />
        </mesh>
      ))}
      <GlowSprite spriteRef={lampA} color={RED} size={0.85} position={[-0.14, 2.48, 0.22]} opacity={0.06} />
      <GlowSprite spriteRef={lampB} color={RED} size={0.85} position={[0.14, 2.48, 0.22]} opacity={0.06} />
      {/* Крестовой знак */}
      <group position={[0, 2.95, 0.02]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.66, 0.08, 0.03]} />
          <meshStandardMaterial color="#E8EAF0" roughness={0.6} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.66, 0.08, 0.03]} />
          <meshStandardMaterial color="#E8EAF0" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export function CrossingWorks({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const gate = useRef<THREE.Group>(null);
  const deckBase = useRef<THREE.Mesh>(null);
  const panels = useRef<THREE.Group>(null);
  const rampA = useRef<THREE.Mesh>(null);
  const rampB = useRef<THREE.Mesh>(null);
  const stopLine = useRef<THREE.Mesh>(null);

  /* Настил — единое целое с путём: плиты лежат МЕЖДУ рельсами и снаружи
     от них, верх на 3 см ниже головки рельса. Рельсы остаются видимыми
     и непрерывными, дорога поднимается к настилу пандусами. */
  const PANEL_TOP = RAIL_TOP - 0.03;
  const PANEL_H = 0.12;
  const rampAngle = Math.atan((PANEL_TOP - ASPHALT_TOP) / 2.4);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 5);
    if (gate.current) gate.current.visible = q > 0.5;
    if (deckBase.current) deckBase.current.scale.y = S(sub(q, 0.5, 0.58));
    if (panels.current) {
      panels.current.children.forEach((c, i) => {
        // плиты ложатся одна за другой, слегка «приземляясь» сверху
        const local = sub(q, 0.56 + i * 0.04, 0.64 + i * 0.04);
        c.scale.setScalar(S(local));
        c.position.y = PANEL_TOP - PANEL_H / 2 + (1 - local) * 0.9;
        c.visible = local > 0.01;
      });
    }
    const ro = sub(q, 0.62, 0.7);
    if (rampA.current) (rampA.current.material as THREE.MeshStandardMaterial).opacity = ro;
    if (rampB.current) (rampB.current.material as THREE.MeshStandardMaterial).opacity = ro;
    if (stopLine.current) (stopLine.current.material as THREE.MeshBasicMaterial).opacity = sub(q, 0.66, 0.74);
  });

  return (
    <group ref={gate} visible={false}>
      {/* Основание настила на балласте */}
      <mesh ref={deckBase} position={[RAIL_X, RAIL_EMB_H + 0.1, 0]}>
        <boxGeometry args={[4.2, 0.2, ROAD_W + 0.4]} />
        <meshStandardMaterial color="#20242E" roughness={0.95} />
      </mesh>

      {/* Плиты настила: междурельсовая + две наружные */}
      <group ref={panels}>
        <mesh position={[RAIL_X, PANEL_TOP - PANEL_H / 2, 0]} visible={false}>
          <boxGeometry args={[GAUGE * 2 - 0.22, PANEL_H, ROAD_W]} />
          <meshStandardMaterial color="#2A2F3A" roughness={0.9} />
          <Edges color={GOLD_DARK} threshold={20} />
        </mesh>
        <mesh position={[RAIL_X - GAUGE - 0.52, PANEL_TOP - PANEL_H / 2, 0]} visible={false}>
          <boxGeometry args={[0.9, PANEL_H, ROAD_W]} />
          <meshStandardMaterial color="#2A2F3A" roughness={0.9} />
          <Edges color={GOLD_DARK} threshold={20} />
        </mesh>
        <mesh position={[RAIL_X + GAUGE + 0.52, PANEL_TOP - PANEL_H / 2, 0]} visible={false}>
          <boxGeometry args={[0.9, PANEL_H, ROAD_W]} />
          <meshStandardMaterial color="#2A2F3A" roughness={0.9} />
          <Edges color={GOLD_DARK} threshold={20} />
        </mesh>
      </group>

      {/* Пандусы: дорога поднимается к настилу */}
      {[-1, 1].map(side => (
        <mesh
          key={side}
          ref={side < 0 ? rampA : rampB}
          position={[RAIL_X + side * (GAUGE + 0.97 + 1.2), ASPHALT_TOP + (PANEL_TOP - ASPHALT_TOP) / 2, 0]}
          rotation={[0, 0, side * rampAngle]}
        >
          <boxGeometry args={[2.55, 0.07, ROAD_W]} />
          <meshStandardMaterial color="#232833" roughness={0.95} transparent opacity={0} />
        </mesh>
      ))}

      {/* Стоп-линия на полосе движения перед шлагбаумом */}
      <mesh ref={stopLine} position={[RAIL_X - 5.4, ASPHALT_TOP + 0.008, 1.85]}>
        <boxGeometry args={[0.35, 0.012, ROAD_W / 2 - 0.4]} />
        <meshBasicMaterial color="#E8EAF0" transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* Шлагбаумы: стойка на правой обочине своей полосы, стрела
          перекрывает проезжую часть (armSign — к оси дороги) */}
      <CrossingBarrier position={[RAIL_X - 4.6, ASPHALT_TOP, 3.3]} armSign={-1} progressRef={progressRef} />
      <CrossingBarrier position={[RAIL_X + 4.6, ASPHALT_TOP, -3.3]} armSign={1} progressRef={progressRef} />

      {/* Светофоры АПС лицом к своему потоку */}
      <CrossingSignal position={[RAIL_X - 5.3, ASPHALT_TOP, 4.0]} rotationY={-Math.PI / 2} blinkPhase={0} progressRef={progressRef} timeRef={timeRef} />
      <CrossingSignal position={[RAIL_X + 5.3, ASPHALT_TOP, -4.0]} rotationY={Math.PI / 2} blinkPhase={Math.PI} progressRef={progressRef} timeRef={timeRef} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 6 — ИНЖЕНЕРНЫЕ СЕТИ: разрез, коммуникации, пульсы потоков, ЛЭП
   ══════════════════════════════════════════════════════════════════════ */
function FlowPulse({
  y, z, color, offset, progressRef, timeRef,
}: {
  y: number; z: number; color: string; offset: number;
  progressRef: ProgressRef; timeRef: TimeRef;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const p = progressRef.current;
    const vis = sub(phaseProgress(p, 6), 0.35, 0.55) * (p >= ALIVE_FROM ? 1 : 1 - phaseProgress(p, 7) * 0.7);
    const t = (timeRef.current * 0.2 + offset) % 1;
    if (ref.current) {
      ref.current.visible = vis > 0.02;
      ref.current.scale.setScalar(S(vis));
      ref.current.position.set(lerp(-12, 12, t), y, z);
    }
  });
  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.16, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

export function NetworkWorks({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const gate = useRef<THREE.Group>(null);
  const pipes = useRef<THREE.Group>(null);
  const poles = useRef<THREE.Group>(null);

  const PIPES = useMemo(
    () => [
      { y: -0.85, z: -1.7, r: 0.3, color: '#0B3D36', em: TEAL, emI: 1.6 },  // водовод
      { y: -1.1, z: -2.7, r: 0.22, color: '#3D2F0B', em: GOLD, emI: 1.4 }, // теплосеть
      { y: -0.55, z: 2.3, r: 0.07, color: '#0B1E3D', em: BLUE, emI: 2.2 }, // ВОЛС
    ],
    [],
  );

  const pipeGeos = useMemo(
    () =>
      PIPES.map(pp => {
        const g = new THREE.CylinderGeometry(pp.r, pp.r, ROAD_LEN, 12);
        g.rotateZ(Math.PI / 2);
        g.translate(ROAD_LEN / 2, 0, 0);
        return g;
      }),
    [PIPES],
  );

  const POLE_X = useMemo(() => [-11, -6.5, -2, 2.5, 7, 11.5], []);
  const wirePts = useMemo(() => {
    const mk = (yTop: number, zOff: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < POLE_X.length - 1; i++) {
        for (let s = 0; s <= 8; s++) {
          const t = s / 8;
          const x = lerp(POLE_X[i], POLE_X[i + 1], t);
          const sag = Math.sin(t * Math.PI) * 0.16;
          pts.push(new THREE.Vector3(x, yTop - sag, LEP_Z + zOff));
        }
      }
      return pts;
    };
    return [mk(4.0, -0.55), mk(4.0, 0.55), mk(4.25, 0)];
  }, [POLE_X]);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 6);

    if (gate.current) gate.current.visible = q > 0.005;
    if (pipes.current) {
      pipes.current.children.forEach((c, i) => {
        c.scale.x = S(sub(q, 0.12 + i * 0.08, 0.4 + i * 0.08));
      });
    }
    if (poles.current) {
      poles.current.children.forEach((c, i) => {
        c.scale.y = S(sub(q, 0.35 + i * 0.06, 0.55 + i * 0.06));
      });
    }
  });

  return (
    <group ref={gate} visible={false}>
      {/* Подземные коммуникации (в разрезе) */}
      <group ref={pipes}>
        {PIPES.map((pp, i) => (
          <mesh key={i} geometry={pipeGeos[i]} position={[-ROAD_LEN / 2, pp.y, pp.z]}>
            <meshStandardMaterial color={pp.color} emissive={pp.em} emissiveIntensity={pp.emI} roughness={0.5} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Колодцы */}
      {[-8, 0.5, 9].map((x, i) => (
        <ManHole key={x} x={x} delay={i} progressRef={progressRef} />
      ))}

      {/* Пульсы потоков */}
      {[0, 0.35, 0.7].map(o => (
        <FlowPulse key={`w${o}`} y={-0.85} z={-1.7} color="#7DF9E8" offset={o} progressRef={progressRef} timeRef={timeRef} />
      ))}
      {[0.18, 0.62].map(o => (
        <FlowPulse key={`h${o}`} y={-1.1} z={-2.7} color="#FAE08A" offset={o} progressRef={progressRef} timeRef={timeRef} />
      ))}
      {[0.4, 0.85].map(o => (
        <FlowPulse key={`c${o}`} y={-0.55} z={2.3} color="#9BBBFF" offset={o} progressRef={progressRef} timeRef={timeRef} />
      ))}

      {/* Опоры ЛЭП */}
      <group ref={poles}>
        {POLE_X.map(x => (
          <group key={x} position={[x, 0, LEP_Z]}>
            <mesh position={[0, 2.1, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 4.2, 8]} />
              <meshStandardMaterial color={CONCRETE} roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.95, 0]}>
              <boxGeometry args={[0.12, 0.12, 1.5]} />
              <meshStandardMaterial color={CONCRETE} roughness={0.8} />
            </mesh>
            {[-0.55, 0.55].map(oz => (
              <mesh key={oz} position={[0, 4.03, oz]}>
                <cylinderGeometry args={[0.035, 0.05, 0.14, 6]} />
                <meshStandardMaterial color="#8AB8B0" roughness={0.4} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Провода — прорисовываются после подъёма опор */}
      {wirePts.map((pts, i) => (
        <DrawnLine
          key={i}
          points={pts}
          color="#8A93A8"
          opacity={0.8}
          progress={p => sub(phaseProgress(p, 6), 0.62 + i * 0.05, 0.9 + i * 0.05)}
        />
      ))}

      {/* Трансформаторная подстанция */}
      <Transformer progressRef={progressRef} timeRef={timeRef} />
    </group>
  );
}

function ManHole({ x, delay, progressRef }: { x: number; delay: number; progressRef: ProgressRef }) {
  const root = useRef<THREE.Group>(null);
  useFrame(() => {
    const q = phaseProgress(progressRef.current, 6);
    if (root.current) {
      const local = sub(q, 0.3 + delay * 0.06, 0.48 + delay * 0.06);
      root.current.visible = local > 0.01;
      root.current.scale.setScalar(S(local));
    }
  });
  return (
    <group ref={root} position={[x, 0, -1.7]} visible={false}>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.85, 12, 1, true]} />
        <meshStandardMaterial color="#2E3340" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, ROAD_EMB_H * 0 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.44, 20]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.7} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Transformer({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.Sprite>(null);
  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 6);
    if (root.current) root.current.scale.y = S(sub(q, 0.55, 0.75));
    if (lamp.current) lamp.current.material.opacity = sub(q, 0.8, 0.95) * (0.5 + 0.5 * Math.abs(Math.sin(timeRef.current * 2)));
  });
  return (
    <group ref={root} position={[13.2, 0, 5.2]}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.7, 1.6, 1.3]} />
        <meshStandardMaterial color="#1C2432" roughness={0.8} />
        <Edges color={BLUE} threshold={20} />
      </mesh>
      <mesh position={[0, 1.68, 0]}>
        <boxGeometry args={[1.8, 0.16, 1.4]} />
        <meshStandardMaterial color="#252D3B" roughness={0.9} />
      </mesh>
      <GlowSprite spriteRef={lamp} color={BLUE} size={0.8} position={[0.6, 1.5, 0.7]} opacity={0} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 7 — ПРОМПЛОЩАДКА: тупик, цех (каркас→панели→кровля), РВС,
   козловой кран грузит контейнер на платформу
   ══════════════════════════════════════════════════════════════════════ */
export function IndustrialWorks({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const gate = useRef<THREE.Group>(null);
  const spur = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Group>(null);
  const panels = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Mesh>(null);
  const windowsMat = useRef<THREE.MeshBasicMaterial>(null);
  const tank = useRef<THREE.Group>(null);
  const silos = useRef<THREE.Group>(null);
  const crane = useRef<THREE.Group>(null);
  const container = useRef<THREE.Group>(null);
  const flatcar = useRef<THREE.Group>(null);

  const WH = { x: 11.5, z: -11.6, w: 6, d: 4.6, h: 3.1 };

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 7);
    const t = timeRef.current;

    if (gate.current) gate.current.visible = q > 0.005;
    const rise = (r: React.RefObject<THREE.Group | THREE.Mesh | null>, a: number, b: number) => {
      if (r.current) {
        const v = sub(q, a, b);
        r.current.scale.y = S(v);
        // скрываем до окна появления: сплющенный объект не должен «висеть плоскостью»
        r.current.visible = v > 0.01;
      }
    };
    rise(spur, 0, 0.2);
    rise(frame, 0.12, 0.35);
    rise(panels, 0.32, 0.55);
    rise(roof, 0.52, 0.66);
    rise(tank, 0.45, 0.68);
    rise(silos, 0.58, 0.74);
    rise(crane, 0.3, 0.55);
    rise(flatcar, 0.15, 0.3);

    if (windowsMat.current) windowsMat.current.opacity = sub(q, 0.62, 0.8);

    if (container.current) {
      // цикл крана: подъём → перенос → опускание на платформу
      const lift = sub(q, 0.62, 0.78);
      const drop = sub(q, 0.8, 0.95);
      const y = lerp(0.45, 2.5, lift) - lerp(0, 1.62, drop);
      const z = lerp(-10.1, SPUR_Z, lift);
      const sway = (lift > 0.05 && drop < 0.9 ? 1 : 0) * Math.sin(t * 1.8) * 0.05 * (1 - drop);
      container.current.visible = q > 0.05;
      container.current.position.set(8.3, y, z);
      container.current.rotation.z = sway;
    }
  });

  return (
    <group ref={gate} visible={false}>
      {/* Подъездной тупик вдоль X */}
      <group ref={spur} position={[10.2, 0, SPUR_Z]}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[12, 0.16, 2.6]} />
          <meshStandardMaterial color="#2E3340" roughness={1} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[-5.4 + i * 0.83, 0.2, 0]}>
            <boxGeometry args={[0.22, 0.12, 2.1]} />
            <meshStandardMaterial color="#494235" roughness={0.9} />
          </mesh>
        ))}
        {[-GAUGE, GAUGE].map(oz => (
          <mesh key={oz} position={[0, 0.32, oz]}>
            <boxGeometry args={[12, 0.14, 0.07]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Платформа под погрузку */}
      <group ref={flatcar} position={[8.3, 0.4, SPUR_Z]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[3.6, 0.22, 1.5]} />
          <meshStandardMaterial color="#20242E" roughness={0.8} />
        </mesh>
        {[-1.2, 1.2].map(ox => (
          <mesh key={ox} position={[ox, 0.05, 0]}>
            <boxGeometry args={[0.9, 0.24, 1.4]} />
            <meshStandardMaterial color="#12151C" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Цех: каркас → панели → кровля → свет в окнах */}
      <group ref={frame} position={[WH.x, 0, WH.z]}>
        {[-WH.w / 2, 0, WH.w / 2].map(ox =>
          [-WH.d / 2, WH.d / 2].map(oz => (
            <mesh key={`${ox}:${oz}`} position={[ox, WH.h / 2, oz]}>
              <boxGeometry args={[0.16, WH.h, 0.16]} />
              <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.2} roughness={0.6} />
            </mesh>
          )),
        )}
        {[-WH.w / 2, 0, WH.w / 2].map(ox => (
          <mesh key={ox} position={[ox, WH.h + 0.25, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.12, 0.5, WH.d + 0.3]} />
            <meshStandardMaterial color={GOLD_DARK} roughness={0.7} />
          </mesh>
        ))}
      </group>
      <group ref={panels} position={[WH.x, 0, WH.z]}>
        <mesh position={[0, WH.h / 2, 0]}>
          <boxGeometry args={[WH.w - 0.1, WH.h - 0.15, WH.d - 0.1]} />
          {/* Сэндвич-панели: светлее фона, с рёбрами — здание не должно сливаться с ночью */}
          <meshStandardMaterial color="#2E3846" roughness={0.8} />
        </mesh>
        <mesh position={[0, WH.h / 2, 0]}>
          <boxGeometry args={[WH.w - 0.08, WH.h - 0.13, WH.d - 0.08]} />
          <meshBasicMaterial color={GOLD_DARK} wireframe transparent opacity={0.22} toneMapped={false} />
        </mesh>
        {/* Ленточное остекление со стороны пути */}
        <mesh position={[0, 1.9, WH.d / 2 + 0.01]}>
          <boxGeometry args={[WH.w - 0.8, 0.6, 0.04]} />
          <meshBasicMaterial ref={windowsMat} color={TEAL} transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={roof} position={[WH.x, WH.h + 0.5, WH.z]}>
        <boxGeometry args={[WH.w + 0.4, 0.22, WH.d + 0.4]} />
        <meshStandardMaterial color="#252D3B" roughness={0.9} />
        <Edges color={GOLD_DARK} threshold={20} />
      </mesh>

      {/* Резервуар РВС + лестница */}
      <group ref={tank} position={[15.2, 0, -4.6]}>
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 2.6, 22]} />
          <meshStandardMaterial color="#202A3A" roughness={0.65} metalness={0.3} />
          <Edges color={GOLD_DARK} threshold={30} />
        </mesh>
        <mesh position={[0, 2.72, 0]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[1.5, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1E2632" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[-1.6, 1.3, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.1, 3.1, 0.5]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.8} />
        </mesh>
      </group>

      {/* Силосы */}
      <group ref={silos}>
        {[[13.2, -14.2], [14.6, -15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.1, z]}>
            <cylinderGeometry args={[0.7, 0.7, 2.2, 14]} />
            <meshStandardMaterial color="#202A3A" roughness={0.7} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Козловой кран над тупиком */}
      <group ref={crane} position={[8.3, 0, SPUR_Z]}>
        {[-2.4, 2.4].map(oz => (
          <mesh key={oz} position={[0, 2.3, oz]}>
            <boxGeometry args={[0.26, 4.6, 0.26]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 4.7, 0]}>
          <boxGeometry args={[0.4, 0.36, 5.6]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} roughness={0.6} />
        </mesh>
        <mesh position={[0, 4.35, -1.2]}>
          <boxGeometry args={[0.5, 0.4, 0.55]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.6} />
        </mesh>
        <GlowSprite color={TEAL} size={0.6} position={[0, 4.95, 2.6]} opacity={0.7} />
      </group>

      {/* Контейнер (груз крана) */}
      <group ref={container} visible={false}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[2.2, 0.9, 1.1]} />
          <meshStandardMaterial color="#7A3B2E" roughness={0.8} />
          <Edges color="#A85B48" threshold={20} />
        </mesh>
        {/* Трос */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.6, 4]} />
          <meshStandardMaterial color="#8A93A8" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ФАЗА 8 — ГОСЭКСПЕРТИЗА: комплект ПСД, мини-план объекта на листе,
   штамп с ударной волной, отметка «одобрено»
   ══════════════════════════════════════════════════════════════════════ */
function Sheet({ w = 2.1, h = 1.45 }: { w?: number; h?: number }) {
  return (
    <>
      {/* Бумага — unlit, чтобы лист читался чисто при любом ракурсе */}
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#DDE1EA" side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* Рамка + штамп-таблица в углу (как на реальном листе) */}
      {[
        [0, h / 2 - 0.03, w - 0.06, 0.018],
        [0, -h / 2 + 0.03, w - 0.06, 0.018],
        [-w / 2 + 0.03, 0, 0.018, h - 0.06],
        [w / 2 - 0.03, 0, 0.018, h - 0.06],
      ].map(([x, y, ww, hh], i) => (
        <mesh key={i} position={[x, y, 0.004]}>
          <boxGeometry args={[ww, hh, 0.004]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[w / 2 - 0.35, -h / 2 + 0.17, 0.004]}>
        <boxGeometry args={[0.62, 0.012, 0.004]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
    </>
  );
}

export function ExpertiseDocs({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const mainSheet = useRef<THREE.Group>(null);
  const sideA = useRef<THREE.Group>(null);
  const sideB = useRef<THREE.Group>(null);
  const plan = useRef<THREE.Group>(null);
  const stamp = useRef<THREE.Group>(null);
  const wave = useRef<THREE.Mesh>(null);
  const checkA = useRef<THREE.Mesh>(null);
  const checkB = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = progressRef.current;
    // фаза 2: экспертиза идёт сразу после проектирования
    const q = phaseProgress(p, 2);
    const t = timeRef.current;
    if (!root.current) return;

    const vis = sub(q, 0.02, 0.2);
    const out = subAbs(p, 0.262, 0.284); // растворяется перед выходом техники
    root.current.visible = vis > 0.01 && out < 0.99;

    const bob = Math.sin(t * 1.1) * 0.05;
    if (mainSheet.current) {
      mainSheet.current.position.set(0.6, lerp(3.0, 5.3, vis) + bob, 0.2);
      mainSheet.current.rotation.set(-0.14, -0.1, 0);
      mainSheet.current.scale.setScalar(S(lerp(0.6, 1, vis) * (1 - out)));
    }
    const sideVis = sub(q, 0.14, 0.32);
    if (sideA.current) {
      sideA.current.visible = sideVis > 0.01;
      sideA.current.position.set(-1.35, lerp(3.1, 5.05, sideVis) + bob * 0.8, -0.15);
      sideA.current.rotation.set(-0.2, 0.4, -0.06);
      sideA.current.scale.setScalar(S(sideVis * 0.82 * (1 - out)));
    }
    if (sideB.current) {
      sideB.current.visible = sideVis > 0.01;
      sideB.current.position.set(2.5, lerp(3.0, 4.95, sideVis) + bob * 1.15, -0.3);
      sideB.current.rotation.set(-0.16, -0.55, 0.08);
      sideB.current.scale.setScalar(S(sideVis * 0.78 * (1 - out)));
    }

    // мини-план чертится на листе
    if (plan.current) {
      const pl = sub(q, 0.25, 0.5);
      plan.current.children.forEach((c, i) => {
        const local = ease(clamp01(pl * (1.4 + i * 0.1) - i * 0.12));
        c.scale.x = S(local);
      });
    }

    // штамп: удар + затухающая волна-кольцо
    const st = sub(q, 0.55, 0.68);
    if (stamp.current) {
      stamp.current.visible = st > 0.01;
      stamp.current.scale.setScalar(S(ease(st) * (1 + (1 - st) * 0.6)));
    }
    if (wave.current) {
      const w = sub(q, 0.62, 0.85);
      wave.current.visible = w > 0.01 && w < 0.99;
      wave.current.scale.setScalar(S(0.2 + w * 1.6));
      (wave.current.material as THREE.MeshBasicMaterial).opacity = (1 - w) * 0.7;
    }
    if (checkA.current) checkA.current.scale.x = S(sub(q, 0.72, 0.8));
    if (checkB.current) checkB.current.scale.x = S(sub(q, 0.78, 0.9));
  });

  return (
    <group ref={root} visible={false}>
      {/* Главный лист — генплан */}
      <group ref={mainSheet}>
        <Sheet />
        {/* Мини-план: оси дороги и пути + контуры объектов */}
        <group ref={plan} position={[-0.12, 0.06, 0.006]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 0.02, 0.004]} />
            <meshBasicMaterial color={GOLD} toneMapped={false} />
          </mesh>
          <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[1.05, 0.02, 0.004]} />
            <meshBasicMaterial color={TEAL} toneMapped={false} />
          </mesh>
          <mesh position={[0.52, -0.32, 0]}>
            <boxGeometry args={[0.34, 0.016, 0.004]} />
            <meshBasicMaterial color={BLUE} toneMapped={false} />
          </mesh>
          {/* Контур цеха и РВС */}
          <mesh position={[0.45, 0.28, 0]}>
            <boxGeometry args={[0.3, 0.012, 0.004]} />
            <meshBasicMaterial color="#9AA2B2" toneMapped={false} />
          </mesh>
          <mesh position={[0.45, 0.18, 0]}>
            <boxGeometry args={[0.3, 0.012, 0.004]} />
            <meshBasicMaterial color="#9AA2B2" toneMapped={false} />
          </mesh>
        </group>

        {/* Штамп + волна + отметка */}
        <group ref={stamp} position={[0.62, -0.4, 0.01]} visible={false}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.012, 24]} />
            <meshBasicMaterial color={GOLD} toneMapped={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.24, 0.27, 28]} />
            <meshBasicMaterial color={GOLD} transparent opacity={0.85} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <mesh ref={wave} position={[0.62, -0.4, 0.012]} visible={false}>
          <ringGeometry args={[0.9, 0.96, 40]} />
          <meshBasicMaterial color={GOLD_LIGHT} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={checkA} position={[-0.68, -0.42, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.24, 0.05, 0.008]} />
          <meshBasicMaterial color={TEAL} toneMapped={false} />
        </mesh>
        <mesh ref={checkB} position={[-0.48, -0.35, 0.01]} rotation={[0, 0, Math.PI / 3.4]}>
          <boxGeometry args={[0.44, 0.05, 0.008]} />
          <meshBasicMaterial color={TEAL} toneMapped={false} />
        </mesh>
      </group>

      {/* Листы комплекта по бокам */}
      <group ref={sideA} visible={false}><Sheet w={1.5} h={2.05} /></group>
      <group ref={sideB} visible={false}><Sheet w={1.5} h={2.05} /></group>
    </group>
  );
}
