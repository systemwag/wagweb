'use client';

/* Корень WebGL-сцены «цифрового полигона» WAG.
   Камера идёт по 11 ключевым кадрам (скролл = время), ландшафт — тёмная
   долина с холмами по периметру, атмосфера — золотая пыль + туман.
   Аннотации — HTML-выноски, привязанные к 3D-точкам (drei Html),
   прозрачность анимируется напрямую через style, без setState. */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import {
  ProgressRef, PhaseId, PHASES, phaseIndex, clamp01, ease, cutaway, damp,
  RAIL_X, WH, DARK, GOLD, sceneRefs,
} from './phases';
import {
  Survey, DesignGhosts, Earthworks, RoadWorks, RailwayWorks,
  CrossingWorks, NetworkWorks, IndustrialWorks, ExpertiseDocs,
} from './Stages';
import { Excavator, DumpTruck, Paver, Roller, Train, Car } from './Vehicles';
import styles from './claude3d.module.css';

/* ── Камера: ключевые кадры ──────────────────────────────────────────
   Ключ задаётся ЭТАПОМ и долей внутри него, а не абсолютным p: доли
   шкалы теперь считаются из длительностей этапов, и абсолютные числа
   ломались бы при любой правке тайминга.

   Один непрерывный проезд, БЕЗ пар «въезд + удержание»: раньше камера
   стояла всю фазу и перепрыгивала на границе, скорость на стыках
   доходила до 2300 ед./прогресс при базовых ~160 — это и читалось как
   рывки. Между ключами — непрерывный по скорости сплайн (hermite). */
const RAW_KEYS: { at: [PhaseId, number]; pos: [number, number, number]; tgt: [number, number, number] }[] = [
  { at: ['survey', 0.0],     pos: [-30, 20, -30],   tgt: [0, 0.5, 0] },       // интро: вся долина
  { at: ['survey', 0.55],    pos: [-24, 15, -23],   tgt: [-2, 0.6, -2] },     // изыскания
  { at: ['survey', 1.0],     pos: [-22, 14, -20],   tgt: [-1, 0.7, -1] },
  { at: ['design', 0.55],    pos: [-19, 13, -17],   tgt: [0, 0.8, 0] },       // проект: оси и габариты
  { at: ['design', 1.0],     pos: [-13, 11, -10],   tgt: [0.3, 1.6, 0] },
  { at: ['expertise', 0.30], pos: [-6, 8.5, -1],    tgt: [0.4, 3.2, 0.2] },   // подлёт к комплекту ПСД
  { at: ['expertise', 0.62], pos: [1.2, 6.6, 8.5],  tgt: [0.6, 5.0, 0.2] },   // листы
  { at: ['expertise', 1.0],  pos: [2.4, 5.9, 6.0],  tgt: [0.8, 4.9, 0.2] },   // штамп крупно
  // Кадр держит ОБЕ машины: экскаватор у кромки (z≈5) и самосвал на
  // полотне (z≈−1.8) разнесены на 7 м поперёк, близкая точка теряла одну
  { at: ['earth', 0.35],     pos: [-16, 10.5, 15],  tgt: [-7.5, 1.1, -0.5] }, // спуск на площадку
  { at: ['earth', 0.70],     pos: [-19, 9.5, 13],   tgt: [-8, 1.0, -0.5] },   // отсыпка и корыто
  { at: ['earth', 1.0],      pos: [-20, 10, 14],    tgt: [-6.5, 0.9, -1.0] },
  // Дорога — СЛЕДЯЩИЙ план: укладчик проходит 25 м за семь секунд, и
  // камера, стоящая на одном участке, теряла его за краем кадра. Общий
  // план на всю трассу тоже не годится — полотно вырождается в полоску.
  { at: ['road', 0.09],      pos: [-14, 7, 16],     tgt: [-8, 0.9, 1] },      // укладчик пошёл
  { at: ['road', 0.20],      pos: [-4, 7.5, 17],    tgt: [2, 0.9, 1] },       // ведём за плитой
  { at: ['road', 0.31],      pos: [6, 8, 17],       tgt: [11, 1.0, 1] },      // кромки и разметка
  { at: ['road', 0.44],      pos: [11, 8, 14],      tgt: [RAIL_X, 1.0, -4] }, // укладка пути
  // Эпизод переезда снимаем ВДОЛЬ ПУТИ (взгляд в −Z), а не под 45°:
  // при косом ракурсе дорога уходила в перспективу, зазор между
  // остановившейся машиной и настилом схлопывался, а стрела шлагбаума
  // зрительно ложилась на капот. Теперь дорога идёт поперёк кадра —
  // «машина → шлагбаум → настил» читается слева направо, а состав
  // выходит из глубины прямо на зрителя.
  // ~25° от оси пути. Строго вдоль пути стрела шлагбаума (она идёт по Z)
  // вырождалась в короткий столбик и читалась как торчащая из машины
  // стойка; под 45° наоборот схлопывался зазор «машина → шлагбаум».
  // Угол подъёма поднят до ~26°: с низкой точки расстояние «машина →
  // шлагбаум» лежало вдоль луча зрения и схлопывалось перспективой,
  // сверху же оно читается как расстояние по земле.
  { at: ['road', 0.58],      pos: [1, 9, 15],       tgt: [1.5, 1.1, 0] },     // настил и АПС
  { at: ['road', 0.75],      pos: [-8.2, 9.5, 15],  tgt: [1.2, 1.1, 0] },     // проезд поезда
  { at: ['road', 1.0],       pos: [-8.7, 9.7, 15.5], tgt: [1.3, 1.1, 0] },
  // Разрез смотрим низкой близкой точкой ПЕРЕД створом ЛЭП (z = 6.4):
  // при съёмке издалека опоры вставали столбами в передний план
  // Сети: от разреза вплотную — через ВЛ — к ОБЩЕМУ ПЛАНУ, на котором к
  // концу этапа видно всё разом: трубы под просвечивающим полотном,
  // колодцы, линия ВЛ с анкерным переходом через путь и подстанция.
  // Опоры снимаем с противоположной от створа стороны (z < 0): рядом с
  // линией они встают столбами в передний план.
  { at: ['networks', 0.28],  pos: [4.5, 4.4, 5.4],  tgt: [-4, -0.7, -0.2] },  // рентген вплотную
  { at: ['networks', 0.50],  pos: [9, 5.5, -1],     tgt: [0, 1.5, 4] },       // выход из разреза
  { at: ['networks', 0.72],  pos: [11, 7.5, -10],   tgt: [2, 3.2, 6.4] },     // ВЛ и анкерный переход
  { at: ['networks', 1.0],   pos: [16, 12, -14],    tgt: [2, 1.2, 3] },       // общий план: всё сразу
  // Промку смотрим со стороны остекления (+Z): раньше камера стояла за
  // краном и он закрывал цех, а кровля читалась чёрной плитой
  { at: ['industrial', 0.40], pos: [20, 11, 2],     tgt: [11, 1.6, -6] },     // заход дугой
  { at: ['industrial', 1.0], pos: [15, 10, 6],      tgt: [11.5, 1.8, -10] },  // цех и погрузка
  // Финал — отход на общий план всей площадки: раньше облёт начинался
  // почти внутри геометрии тупика и первые секунды показывал шпалы в упор
  { at: ['handover', 0.30],  pos: [22, 14, 10],     tgt: [8, 1.5, -4] },      // отход от промки
  { at: ['handover', 0.68],  pos: [6, 17, 22],      tgt: [2, 1.2, 0] },       // облёт площадки
  { at: ['handover', 1.0],   pos: [-12, 17, 21],    tgt: [0, 1.2, 0] },       // общий план объекта
];

const CAM_KEYS = RAW_KEYS.map(k => {
  const ph = PHASES[phaseIndex(k.at[0])];
  return { p: ph.start + (ph.end - ph.start) * k.at[1], pos: k.pos, tgt: k.tgt };
});

/* Неравномерный кубический Эрмит (Catmull-Rom по узлам p).
   Обычный smoothstep внутри сегмента обнуляет скорость на КАЖДОМ ключе —
   19 остановок и разгонов подряд. Эрмит с касательными по соседям даёт
   C¹-непрерывность: камера едет одним движением. */
function hermite(
  out: THREE.Vector3,
  p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3,
  t0: number, t1: number, t2: number, t3: number,
  t: number,
) {
  const dt = t2 - t1 || 1;
  const s = (t - t1) / dt;
  const s2 = s * s;
  const s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1;
  const h10 = s3 - 2 * s2 + s;
  const h01 = -2 * s3 + 3 * s2;
  const h11 = s3 - s2;
  const k1 = dt / (t2 - t0 || 1);
  const k2 = dt / (t3 - t1 || 1);
  out.set(
    h00 * p1.x + h10 * (p2.x - p0.x) * k1 + h01 * p2.x + h11 * (p3.x - p1.x) * k2,
    h00 * p1.y + h10 * (p2.y - p0.y) * k1 + h01 * p2.y + h11 * (p3.y - p1.y) * k2,
    h00 * p1.z + h10 * (p2.z - p0.z) * k1 + h01 * p2.z + h11 * (p3.z - p1.z) * k2,
  );
}

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
  const look = useMemo(() => new THREE.Vector3(), []);
  const ptr = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = clamp01(progressRef.current);
    const t = sceneRefs.t.current;
    const n = keys.length;
    let i = 0;
    while (i < n - 2 && p > keys[i + 1].p) i++;
    const a = keys[Math.max(0, i - 1)];
    const b = keys[i];
    const c = keys[i + 1];
    const d = keys[Math.min(n - 1, i + 2)];
    hermite(pos, a.pos, b.pos, c.pos, d.pos, a.p, b.p, c.p, d.p, p);
    hermite(tgt, a.tgt, b.tgt, c.tgt, d.tgt, a.p, b.p, c.p, d.p, p);

    // Параллакс от указателя — демпфированный: сырой pointer подмешивал
    // дрожь курсора прямо в позицию камеры.
    const k = damp(6, dt);
    ptr.current.x += (pointer.x - ptr.current.x) * k;
    ptr.current.y += (pointer.y - ptr.current.y) * k;
    const dx = allowMotion ? Math.sin(t * 0.13) * 0.3 + ptr.current.x * 0.8 : 0;
    const dy = allowMotion ? Math.sin(t * 0.09) * 0.18 + ptr.current.y * 0.4 : 0;

    camera.position.set(pos.x + dx, pos.y + dy, pos.z);
    look.copy(tgt);
    camera.lookAt(look);
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
      {/* Чуть светлее фона: на #060A14 рельеф был неотличим от пустоты */}
      <meshStandardMaterial ref={mat} color="#0B1220" roughness={1} transparent />
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
    const t = sceneRefs.t.current;
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
interface AnnoRaw {
  pos: [number, number, number];
  kicker: string;
  text: string;
  /** этап и окно внутри него, в долях этапа */
  at: [PhaseId, number, number];
}
interface AnnoDef {
  pos: [number, number, number];
  kicker: string;
  text: string;
  window: [number, number]; // абсолютный p
}

/* Точки подобраны выше и правее своего объекта: слева карточка этапа,
   справа рельса навигации — выноска не должна попадать ни туда, ни туда. */
const ANNO_RAW: AnnoRaw[] = [
  { pos: [-6.5, 2.6, -7], kicker: 'ИГДИ', text: 'Тахеометрическая съёмка · опорная сеть', at: ['survey', 0.35, 0.95] },
  { pos: [RAIL_X + 1.5, 2.4, 7], kicker: 'ПСД', text: 'Оси трасс · генплан М 1:500', at: ['design', 0.35, 0.95] },
  { pos: [1.6, 4.2, 0.4], kicker: 'РГП ГЭ', text: 'Положительное заключение', at: ['expertise', 0.72, 1.0] },
  { pos: [-6.4, 2.8, 3.4], kicker: 'СМР', text: 'Насыпь h=0,5 м · Kу ≥ 0,98', at: ['earth', 0.38, 0.95] },
  // держится у центра трассы: камера на этом бите едет за укладчиком
  { pos: [2, 2.7, 3.2], kicker: 'ВСП-а/д', text: 'Асфальтобетон · 2 слоя по щебню', at: ['road', 0.16, 0.34] },
  { pos: [RAIL_X + 1.2, 2.6, -7], kicker: 'ВСП-ж/д', text: 'Р65 · колея 1520 мм · ЖБ шпалы', at: ['road', 0.44, 0.63] },
  { pos: [RAIL_X - 2.6, 3.0, 4.6], kicker: 'АПС', text: 'Шлагбаумы-автоматы + светофоры', at: ['road', 0.70, 0.99] },
  // Выноски называют работы так же, как карточки услуг на сайте: РВС и
  // марки труб в перечне услуг не значатся, поэтому в подписях их нет
  { pos: [-3.5, 1.9, -2.8], kicker: 'Сети', text: 'Водоснабжение · теплосеть · слаботочные', at: ['networks', 0.20, 0.62] },
  { pos: [2.0, 3.4, 6.4], kicker: 'ЛЭП', text: 'Электроснабжение · переход через путь', at: ['networks', 0.72, 0.99] },
  { pos: [WH.x, 4.6, WH.z], kicker: 'ПТО', text: 'Производственный корпус · фронт погрузки', at: ['industrial', 0.45, 0.99] },
];

const ANNOS: AnnoDef[] = ANNO_RAW.map(a => {
  const ph = PHASES[phaseIndex(a.at[0])];
  const span = ph.end - ph.start;
  return {
    pos: a.pos,
    kicker: a.kicker,
    text: a.text,
    window: [ph.start + span * a.at[1], ph.start + span * a.at[2]],
  };
});

/* Выноска монтируется только на своём окне: раньше все десять висели
   в DOM постоянно и каждый кадр писали transform — лишний layout на
   каждом кадре сцены. Гейт переключается ~дважды за весь скролл. */
function Annotation({ def }: { def: AnnoDef }) {
  const el = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);

  useFrame(() => {
    const p = sceneRefs.p.current;
    const near = p > def.window[0] - 0.02 && p < def.window[1] + 0.03;
    if (near !== liveRef.current) {
      liveRef.current = near;
      setLive(near);
    }
    if (!near || !el.current) return;
    const inW = clamp01((p - def.window[0]) / 0.012);
    const outW = 1 - clamp01((p - def.window[1]) / 0.012);
    const o = Math.min(inW, outW, 1);
    el.current.style.opacity = o.toFixed(3);
    el.current.style.transform = `translateY(${((1 - o) * 10).toFixed(1)}px)`;
  });

  if (!live) return null;

  return (
    <group position={def.pos}>
      <Html center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
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
  /* Единые часы кадра: useFrame родителя регистрируется раньше детских,
     поэтому ambient-время обновляется до того, как его прочитает техника.
     Сам таймлайн событий теперь живёт в p — транспорт воспроизведения
     двигает его по секундам, так что окна в долях этапа = секунды. */
  useFrame((_, delta) => {
    if (allowMotion) sceneRefs.t.current += Math.min(delta, 0.05);
  });

  return (
    <>
      <CameraRig progressRef={progressRef} allowMotion={allowMotion} />

      <hemisphereLight args={['#3A465E', '#10141E', 1.05]} />
      <directionalLight position={[8, 13, 5]} intensity={1.9} color={GOLD} />
      <directionalLight position={[-9, 7, -7]} intensity={0.6} color="#00C4A7" />
      {/* Заполняющий свет со стороны «дорожных» ракурсов (+Z) */}
      <directionalLight position={[2, 6, 16]} intensity={0.5} color="#7E90B8" />
      {/* Контровой по горизонту: без него холмы сливались с фоном */}
      <directionalLight position={[-14, 3, 24]} intensity={0.5} color="#2E4A72" />

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
      <Survey progressRef={progressRef} timeRef={sceneRefs.t} />
      <DesignGhosts progressRef={progressRef} />
      <Earthworks progressRef={progressRef} />
      <RoadWorks progressRef={progressRef} />
      <RailwayWorks progressRef={progressRef} />
      <CrossingWorks progressRef={progressRef} timeRef={sceneRefs.t} />
      <NetworkWorks progressRef={progressRef} timeRef={sceneRefs.t} />
      <IndustrialWorks progressRef={progressRef} timeRef={sceneRefs.t} />
      <ExpertiseDocs progressRef={progressRef} timeRef={sceneRefs.t} />

      {/* Техника и подвижной состав */}
      <Excavator progressRef={progressRef} timeRef={sceneRefs.t} />
      <DumpTruck progressRef={progressRef} timeRef={sceneRefs.t} />
      <Paver progressRef={progressRef} timeRef={sceneRefs.t} />
      <Roller progressRef={progressRef} timeRef={sceneRefs.t} />
      <Train progressRef={progressRef} timeRef={sceneRefs.t} />
      <Car progressRef={progressRef} timeRef={sceneRefs.t} />

      {/* Выноски */}
      {ANNOS.map((a, i) => (
        <Annotation key={i} def={a} />
      ))}

      <Dust />
    </>
  );
}

function Scene({
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
    sceneRefs.p = progressRef;
  }, [progressRef]);

  /* Плотность пикселей подстраивается под реальный FPS: фиксированные
     1.75 роняли слабые GPU в 30 кадров, что читалось как «дёргается». */
  const [dpr, setDpr] = useState(1.5);
  const onDecline = useCallback(() => setDpr(1), []);
  const onIncline = useCallback(() => setDpr(1.75), []);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [-30, 20, -30], fov: 40, near: 0.1, far: 260 }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerformanceMonitor onDecline={onDecline} onIncline={onIncline} flipflops={3} />
      <color attach="background" args={[DARK]} />
      <SceneRoot progressRef={progressRef} allowMotion={allowMotion} />
    </Canvas>
  );
}

/* Мемо обязателен: View перерисовывается на каждой границе этапа
   (setPhaseIdx), и без него R3F пересобирал дерево канваса ровно в
   момент перелёта камеры. */
export default memo(Scene);
