'use client';

/* Техника «живой стройки».

   ПРО ПЛАВНОСТЬ. Раньше позиция каждой машины была функцией скролла,
   поэтому её скорость равнялась скорости колеса мыши — отсюда рывки.
   Теперь p идёт по таймеру, а сверху добавлен общий «привод»: из позиции
   считается скорость, а уже из неё — вращение колёс, продольный клевок
   и вибрация на холостых. Скорость первична, всё остальное производно,
   иначе машина скользит по земле, как по льду.

   Перемещения считаются через travel() (короткие разгон и торможение,
   между ними — постоянная скорость), а не через smoothstep на весь путь:
   укладчик обязан идти ровно, иначе слой ложится неравномерно.

   Всё читает progressRef/timeRef внутри useFrame — ноль ре-рендеров. */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ProgressRef, TimeRef, phaseProgress, roadQ, railQ, sub, lin, travel,
  lerp, clamp01, ease, damp,
  ROAD_LEN, ROAD_EMB_H, ASPHALT_TOP, RAIL_X, RAIL_TOP, roadY,
  EXC_X, EXC_Z, TRUCK_Z, TRUCK_STOP_X, SWING_DIG, SWING_DUMP,
  CINE, cine, cineLin, ALIVE_FROM, sceneRefs,
  LOOP, TRAIN_FROM, TRAIN_SPAN, CAR_FROM, CAR_SPAN, CAR_LAG,
  GOLD, GOLD_LIGHT, TEAL, CONCRETE, STEEL,
} from './phases';
import { GlowSprite, BlobShadow } from './fx';

/* ══════════════════════════════════════════════════════════════════════
   ОБЩИЙ ПРИВОД
   ══════════════════════════════════════════════════════════════════════ */

interface Drive { x: number; v: number; a: number; spin: number }
const newDrive = (): Drive => ({ x: NaN, v: 0, a: 0, spin: 0 });

/** Максимальная правдоподобная скорость: во время перемотки между этапами
    p летит рывком, и без ограничения колёса раскручивало бы в блендер. */
const V_MAX = 14;

/**
 * Обновляет привод по новой продольной координате.
 * @param dir  +1 если локальный «вперёд» совпадает с +X, −1 если корпус развёрнут
 */
function drive(d: Drive, x: number, dt: number, wheelR: number, dir = 1) {
  if (!Number.isFinite(d.x)) d.x = x;
  const step = dt > 1e-4 ? (x - d.x) / dt : 0;
  d.x = x;
  const raw = Math.max(-V_MAX, Math.min(V_MAX, step));
  const prev = d.v;
  d.v += (raw - d.v) * damp(10, dt);
  d.a += ((d.v - prev) / Math.max(dt, 1e-3) - d.a) * damp(4, dt);
  // качение без проскальзывания: ось колеса после rotation.x=π/2 смотрит
  // в +Z, поэтому качение вперёд — это отрицательный поворот вокруг неё
  d.spin -= (d.v * dir * dt) / wheelR;
  return d;
}

/** Клевок корпуса при разгоне/торможении, рад */
const pitchOf = (d: Drive, k = 0.012) => Math.max(-0.05, Math.min(0.05, -d.a * k));
/** Вибрация двигателя, м. amount — доля 0..1, а НЕ булев флаг: включение
    вибрации переключателем давало щелчок на границе рабочего окна. */
const idleOf = (t: number, seed: number, amount: number) =>
  amount * (Math.sin(t * 31 + seed) * 0.008 + Math.sin(t * 17.3 + seed) * 0.004);

/** Колесо со спицей — без метки вращение цилиндра на экране не читается */
function Wheel({ r, w, position, attach }: {
  r: number; w: number; position: [number, number, number];
  attach: (m: THREE.Mesh | null) => void;
}) {
  return (
    <mesh ref={attach} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r, w, 14]} />
      <meshStandardMaterial color="#12151C" roughness={0.9} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[r * 1.5, w * 1.05, r * 0.16]} />
        <meshStandardMaterial color="#39404E" roughness={0.7} metalness={0.3} />
      </mesh>
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ЭКСКАВАТОР — этап «Земляные работы».

   Раньше три звена качались НЕЗАВИСИМЫМИ синусами: кинематической связи
   не было, землю они не «знали», и на крайних углах остриё ковша уходило
   почти на метр под площадку. Теперь цикл собран из выверенных троек
   углов, а сверху стоит числовая страховка: если остриё всё-таки ниже
   отметки грунта, стрела подбирается ровно настолько, чтобы вывести его
   на поверхность. Уйти под текстуру физически невозможно.
   ══════════════════════════════════════════════════════════════════════ */

/** Геометрия стрелы: пятка, длины звеньев, вылет острия из шарнира ковша */
const BOOM_PIVOT_X = 0.6;
const BOOM_PIVOT_Y = 1.27;   // 0.72 (платформа) + 0.55 (пятка стрелы)
const L_BOOM = 2.2;
const L_ARM = 1.5;
const L_TIP = 0.54;
const TIP_OFF = -0.38;       // угол острия относительно оси ковша
const GROUND = 0.03;         // отметка, ниже которой остриё не пускаем

const tipXY = (b: number, a: number, k: number) => {
  const s2 = b + a;
  const s3 = b + a + k + TIP_OFF;
  return {
    x: BOOM_PIVOT_X + L_BOOM * Math.cos(b) + L_ARM * Math.cos(s2) + L_TIP * Math.cos(s3),
    y: BOOM_PIVOT_Y + L_BOOM * Math.sin(b) + L_ARM * Math.sin(s2) + L_TIP * Math.sin(s3),
  };
};

/** Ключевые позы цикла: u — доля цикла, b/a/k — стрела/рукоять/ковш, s — поворот */
const DIG_KEYS = [
  { u: 0.00, b: -0.05, a: -0.35, k: -1.10, s: SWING_DIG },   // остриё на грунте, дальняя точка
  { u: 0.10, b: -0.05, a: -0.35, k: -1.10, s: SWING_DIG },
  { u: 0.22, b: 0.10, a: -0.95, k: -1.35, s: SWING_DIG },    // тянем к себе по дну
  { u: 0.32, b: 0.18, a: -1.45, k: -1.55, s: SWING_DIG },    // ковш набран
  { u: 0.42, b: 0.75, a: -1.55, k: -1.65, s: SWING_DIG },    // подъём
  { u: 0.56, b: 0.85, a: -1.45, k: -1.60, s: SWING_DUMP },   // поворот к самосвалу
  { u: 0.66, b: 0.95, a: -1.30, k: -0.30, s: SWING_DUMP },   // разгрузка
  { u: 0.74, b: 0.95, a: -1.30, k: -0.30, s: SWING_DUMP },
  { u: 0.88, b: 0.40, a: -0.80, k: -1.10, s: SWING_DIG },    // возврат
  { u: 1.00, b: -0.05, a: -0.35, k: -1.10, s: SWING_DIG },
];
const DIG_CYCLE = 2.9; // с — два полных цикла укладываются в рабочее окно

function digPose(u: number) {
  let i = 0;
  while (i < DIG_KEYS.length - 2 && u > DIG_KEYS[i + 1].u) i++;
  const A = DIG_KEYS[i];
  const B = DIG_KEYS[i + 1];
  const t = ease(clamp01((u - A.u) / (B.u - A.u || 1)));
  let b = lerp(A.b, B.b, t);
  const a = lerp(A.a, B.a, t);
  const k = lerp(A.k, B.k, t);
  // Страховка по грунту: поднимаем стрелу ровно на нехватку высоты.
  // dY/db ≈ горизонтальный вылет, поэтому поправка считается за один шаг.
  const tip = tipXY(b, a, k);
  if (tip.y < GROUND) {
    const reach = Math.max(1, tip.x - BOOM_PIVOT_X);
    b += (GROUND - tip.y) / reach;
    const fix = tipXY(b, a, k);
    if (fix.y < GROUND) b += (GROUND - fix.y) / reach;
  }
  return { b, a, k, s: lerp(A.s, B.s, t) };
}

/** Транспортное положение: стрела подобрана, ковш подвёрнут.
    В неё поза плавно уходит на въезде и выезде — раньше рабочий цикл
    включался булевым флагом и все три звена ПРЫГАЛИ в произвольную
    фазу синуса, что и читалось как рывок при появлении и исчезании. */
const REST = { b: 0.75, a: -1.9, k: -1.9 };

export function Excavator({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  const boom = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const bucket = useRef<THREE.Group>(null);
  const spoil = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Sprite>(null);
  const d = useRef(newDrive());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = progressRef.current;
    const q = phaseProgress(p, 'earth');
    const t = timeRef.current;
    if (!root.current) return;

    /* Экскаватор уходит СРАЗУ после двух циклов копания — до того, как
       фронт насыпи дойдёт до его забоя. Раньше он работал почти весь
       этап и последние секунды «копал» уже отсыпанное полотно. */
    const arrive = travel(lin(q, 0.0, 0.13), 0.3);
    const leave = travel(lin(q, 0.58, 0.72), 0.3);
    root.current.visible = q > 0.001 && leave < 0.999 && roadQ(p) < 0.2;

    // заезд слева на рабочую точку, уход после отсыпки
    const x = lerp(EXC_X - 11, EXC_X, arrive) - leave * 13;
    drive(d.current, x, dt, 0.5);
    root.current.position.set(x, 0, EXC_Z);

    // «Насколько машина в работе» — плавная величина, не флаг
    const work = sub(q, 0.13, 0.23) * (1 - sub(q, 0.50, 0.58));
    if (body.current) {
      body.current.position.y = idleOf(t, 1.7, work);
      body.current.rotation.z = pitchOf(d.current);
    }

    // Цикл идёт по СВОИМ часам всегда (он не должен зависеть от того,
    // как быстро зритель перематывает этап), а на въезде и выезде поза
    // смешивается с транспортной — переход получается непрерывным.
    const u = (t % DIG_CYCLE) / DIG_CYCLE;
    const pose = digPose(u);
    if (upper.current) upper.current.rotation.y = lerp(SWING_DIG, pose.s, work);
    if (boom.current) boom.current.rotation.z = lerp(REST.b, pose.b, work);
    if (arm.current) arm.current.rotation.z = lerp(REST.a, pose.a, work);
    if (bucket.current) bucket.current.rotation.z = lerp(REST.k, pose.k, work);
    // грунт в ковше: появляется при резании, высыпается на разгрузке
    if (spoil.current) {
      const filled = clamp01((u - 0.16) / 0.14) * (1 - clamp01((u - 0.62) / 0.06)) * work;
      spoil.current.visible = filled > 0.03;
      spoil.current.scale.setScalar(Math.max(0.001, filled));
    }
    // пыль в точке резания (спрайт живёт внутри поворотной платформы,
    // иначе он оставался бы на месте, пока стрела уходит в сторону)
    if (dust.current) {
      const cutting = clamp01((u - 0.04) / 0.04) * (1 - clamp01((u - 0.30) / 0.06)) * work;
      const tip = tipXY(pose.b, pose.a, pose.k);
      dust.current.position.set(tip.x, Math.max(0.12, tip.y) - 0.72, 0);
      dust.current.material.opacity = cutting * (0.16 + Math.sin(t * 9) * 0.06);
    }
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={2.4} stretchX={1.25} />
      <group ref={body}>
        {/* Гусеницы */}
        {[-0.85, 0.85].map(z => (
          <mesh key={z} position={[0, 0.32, z]}>
            <boxGeometry args={[2.5, 0.55, 0.5]} />
            <meshStandardMaterial color="#1A1F29" roughness={0.9} />
          </mesh>
        ))}
        {/* Поворотная платформа */}
        <group ref={upper} position={[0, 0.72, 0]}>
          <mesh position={[-0.35, 0.35, 0]}>
            <boxGeometry args={[2.1, 0.7, 1.5]} />
            <meshStandardMaterial color={GOLD} roughness={0.55} metalness={0.15} />
          </mesh>
          {/* Кабина */}
          <mesh position={[0.45, 0.95, 0.45]}>
            <boxGeometry args={[0.85, 0.8, 0.7]} />
            <meshStandardMaterial color="#141922" roughness={0.4} />
          </mesh>
          <mesh position={[0.78, 0.98, 0.45]}>
            <boxGeometry args={[0.06, 0.55, 0.55]} />
            <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
          {/* Противовес */}
          <mesh position={[-1.35, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.6, 1.3]} />
            <meshStandardMaterial color="#20242E" roughness={0.8} />
          </mesh>
          {/* Стрела → рукоять → ковш */}
          <group ref={boom} position={[BOOM_PIVOT_X, 0.55, 0]}>
            <mesh position={[L_BOOM / 2, 0, 0]}>
              <boxGeometry args={[L_BOOM + 0.1, 0.32, 0.26]} />
              <meshStandardMaterial color={GOLD} roughness={0.55} />
            </mesh>
            <group ref={arm} position={[L_BOOM, 0, 0]}>
              <mesh position={[L_ARM / 2, 0, 0]}>
                <boxGeometry args={[L_ARM + 0.1, 0.22, 0.2]} />
                <meshStandardMaterial color={GOLD_LIGHT} roughness={0.55} />
              </mesh>
              <group ref={bucket} position={[L_ARM, 0, 0]}>
                <mesh position={[0.2, -0.11, 0]}>
                  <boxGeometry args={[0.5, 0.44, 0.62]} />
                  <meshStandardMaterial color="#2A2F3A" roughness={0.8} metalness={0.3} />
                </mesh>
                {/* Режущая кромка — по ней и считается остриё */}
                <mesh position={[0.45, -0.19, 0]} rotation={[0, 0, -0.35]}>
                  <boxGeometry args={[0.22, 0.07, 0.6]} />
                  <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.7} />
                </mesh>
                {/* Грунт в ковше */}
                <mesh ref={spoil} position={[0.18, 0.09, 0]} visible={false}>
                  <boxGeometry args={[0.44, 0.16, 0.54]} />
                  <meshStandardMaterial color="#3A3226" roughness={1} />
                </mesh>
              </group>
            </group>
          </group>
          <GlowSprite spriteRef={dust} color="#6B6250" size={1.7} opacity={0} />
        </group>
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   САМОСВАЛ — привозит грунт под насыпь.

   Раньше он подъезжал ЗАДНИМ ХОДОМ: корпус развёрнут на π (кабина
   смотрит в +X), а координата убывала. Теперь едет кабиной вперёд,
   встаёт у начала будущей насыпи, поднимает кузов и высыпает отсыпку
   назад — на полотно, откуда насыпь дальше и растёт, — после чего
   уходит вперёд, обгоняя фронт отсыпки.
   ══════════════════════════════════════════════════════════════════════ */
export function DumpTruck({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const bed = useRef<THREE.Group>(null);
  const load = useRef<THREE.Mesh>(null);
  const d = useRef(newDrive());
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const WHEEL_R = 0.34;

  const WHEEL_POS = useMemo<[number, number][]>(
    () => [[-1.25, 0.62], [-1.25, -0.62], [0.5, 0.62], [0.5, -0.62], [1.15, 0.62], [1.15, -0.62]],
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = progressRef.current;
    const q = phaseProgress(p, 'earth');
    const t = timeRef.current;
    if (!root.current) return;

    const arrive = travel(lin(q, 0.08, 0.26), 0.25);
    const depart = travel(lin(q, 0.56, 0.76), 0.2);
    root.current.visible = q > 0.06 && depart < 0.995 && roadQ(p) < 0.08;

    // кабина у модели с локальной стороны −X, корпус развёрнут на π —
    // значит «вперёд» для него это +X, и координата должна РАСТИ
    const x = lerp(TRUCK_STOP_X - 18, TRUCK_STOP_X, arrive) + depart * 26;
    root.current.position.set(x, 0, TRUCK_Z);
    root.current.rotation.y = Math.PI;

    drive(d.current, x, dt, WHEEL_R, -1);
    for (const w of wheels.current) if (w) w.rotation.y = d.current.spin;

    const running = sub(q, 0.06, 0.12) * (1 - sub(q, 0.74, 0.82));
    if (body.current) {
      body.current.position.y = idleOf(t, 0.4, running);
      body.current.rotation.z = -pitchOf(d.current); // корпус развёрнут
    }

    // приезжает гружёным, кузов пустеет по мере высыпания
    const tip = sub(q, 0.30, 0.38) * (1 - sub(q, 0.46, 0.54));
    if (load.current) {
      const left = 1 - clamp01((q - 0.32) / 0.12);
      load.current.visible = left > 0.03;
      load.current.scale.set(1, Math.max(0.001, left), 1);
      load.current.position.y = 0.7 + left * 0.06;
    }
    if (bed.current) bed.current.rotation.z = -tip * 0.55;
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={2.2} stretchX={1.4} />
      <group ref={body}>
        {WHEEL_POS.map(([x, z], i) => (
          <Wheel
            key={i}
            r={WHEEL_R}
            w={0.26}
            position={[x, WHEEL_R, z]}
            attach={m => { wheels.current[i] = m; }}
          />
        ))}
        {/* Рама + кабина */}
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[3.1, 0.18, 1.25]} />
          <meshStandardMaterial color="#20242E" roughness={0.8} />
        </mesh>
        <mesh position={[-1.35, 1.15, 0]}>
          <boxGeometry args={[0.8, 0.9, 1.25]} />
          <meshStandardMaterial color={GOLD} roughness={0.55} />
        </mesh>
        <mesh position={[-1.72, 1.22, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.95]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
        {/* Кузов (опрокидывается назад) */}
        <group ref={bed} position={[1.55, 0.74, 0]}>
          <mesh position={[-1.05, 0.42, 0]}>
            <boxGeometry args={[2.5, 0.7, 1.35]} />
            <meshStandardMaterial color="#2A2F3A" roughness={0.85} />
          </mesh>
          <mesh ref={load} position={[-1.05, 0.7, 0]} visible={false}>
            <boxGeometry args={[2.3, 0.3, 1.15]} />
            <meshStandardMaterial color="#3A3226" roughness={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   АСФАЛЬТОУКЛАДЧИК + КАТОК.
   Слой асфальта растёт ровно за плитой укладчика — обе величины берутся
   из одной функции. Укладчик идёт с ПОСТОЯННОЙ скоростью: раньше здесь
   был smoothstep на весь проход, из-за чего машина разгонялась половину
   участка и тормозила вторую.
   ══════════════════════════════════════════════════════════════════════ */
export const paveProgress = (qr: number) => travel(clamp01((qr - 0.06) / 0.80), 0.09);

const PAVE_X0 = -ROAD_LEN / 2 + 0.5;
const PAVE_X1 = ROAD_LEN / 2 - 0.5;

export function Paver({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Sprite>(null);
  const d = useRef(newDrive());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = progressRef.current;
    const q = roadQ(p);
    if (!root.current) return;
    const pv = paveProgress(q);
    const gone = travel(lin(q, 0.88, 1.0), 0.25);
    root.current.visible = q > 0.02 && gone < 0.995 && railQ(p) < 0.25;

    const x = lerp(PAVE_X0, PAVE_X1, pv);
    drive(d.current, x, dt, 0.5);
    root.current.position.set(x, ROAD_EMB_H + 0.15, gone * 6.5);

    const working = sub(pv, 0.0, 0.04) * (1 - sub(pv, 0.96, 1.0));
    if (body.current) body.current.position.y = idleOf(timeRef.current, 2.9, working);
    if (glow.current) {
      glow.current.material.opacity =
        0.55 * (0.15 + working * 0.85) * (0.8 + Math.sin(timeRef.current * 7) * 0.2);
    }
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={2.1} stretchX={1.3} position={[0, -0.13, 0]} />
      <group ref={body}>
        {/* Корпус + бункер */}
        <mesh position={[0.4, 0.55, 0]}>
          <boxGeometry args={[2.2, 0.75, 2.4]} />
          <meshStandardMaterial color={GOLD} roughness={0.55} />
        </mesh>
        <mesh position={[1.45, 0.5, 0]}>
          <boxGeometry args={[0.9, 0.55, 2.9]} />
          <meshStandardMaterial color="#2A2F3A" roughness={0.85} />
        </mesh>
        {/* Пост оператора */}
        <mesh position={[-0.15, 1.15, -0.6]}>
          <boxGeometry args={[0.7, 0.5, 0.7]} />
          <meshStandardMaterial color="#141922" roughness={0.5} />
        </mesh>
        {/* Гусеницы */}
        {[-1.05, 1.05].map(z => (
          <mesh key={z} position={[0.3, 0.22, z]}>
            <boxGeometry args={[1.9, 0.42, 0.4]} />
            <meshStandardMaterial color="#1A1F29" roughness={0.9} />
          </mesh>
        ))}
        {/* Выглаживающая плита — светится жаром свежего асфальта */}
        <mesh position={[-1.05, 0.16, 0]}>
          <boxGeometry args={[0.5, 0.28, 3.1]} />
          <meshStandardMaterial color="#3A2413" emissive="#FF7A2A" emissiveIntensity={0.9} roughness={0.6} toneMapped={false} />
        </mesh>
      </group>
      <GlowSprite spriteRef={glow} color="#FF8A3A" size={2.6} position={[-1.15, 0.25, 0]} opacity={0.5} />
    </group>
  );
}

export function Roller({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const drumA = useRef<THREE.Mesh>(null);
  const drumB = useRef<THREE.Mesh>(null);
  const d = useRef(newDrive());
  const zPrev = useRef(0);
  const DRUM_R = 0.42;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = progressRef.current;
    const q = roadQ(p);
    if (!root.current) return;
    const pv = paveProgress(q);
    const gone = travel(lin(q, 0.9, 1.0), 0.25);

    /* Каток СТОИТ у начала трассы с первого кадра и трогается, когда
       укладчик оторвётся на 5,5 м. Ни появления, ни исчезновения в
       кадре нет — а именно они и читались как рывки.
       (Исходный баг был в другом: зажим max(начало+1.2, укладчик−4.2)
       ставил каток ВПЕРЕДИ укладчика, и тот проезжал сквозь него.) */
    const paverX = lerp(PAVE_X0, PAVE_X1, pv);
    const follow = Math.max(PAVE_X0 - 0.5, paverX - 5.5);
    const x = follow + gone * 9;   // уходит за восточный конец трассы
    // «челнок» включается плавно: раньше множитель был булевым, и каток
    // на границе окна СКАКАЛ вбок сразу на метр с лишним
    const active = sub(pv, 0.05, 0.14) * (1 - sub(pv, 0.92, 0.99));
    root.current.visible = pv > 0.002 && x < PAVE_X1 + 2.5 && railQ(p) < 0.25;
    const z = Math.sin(timeRef.current * 0.55) * 1.15 * active + gone * -4;
    root.current.position.set(x, ASPHALT_TOP, z);
    // корпус доворачивается по направлению челнока — раньше каток
    // смещался вбок, оставаясь параллельным оси, и «ехал крабом»
    const dz = dt > 1e-4 ? (z - zPrev.current) / dt : 0;
    zPrev.current = z;
    const vx = Math.max(0.2, Math.abs(d.current.v));
    root.current.rotation.y += (Math.atan2(-dz, vx) * 0.55 - root.current.rotation.y) * damp(4, dt);

    drive(d.current, x, dt, DRUM_R);
    if (drumA.current) drumA.current.rotation.y = d.current.spin;
    if (drumB.current) drumB.current.rotation.y = d.current.spin;
    if (body.current) body.current.position.y = idleOf(timeRef.current, 5.1, active);
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={1.5} stretchX={1.4} position={[0, -0.72, 0]} />
      <group ref={body}>
        <mesh ref={drumA} position={[-0.85, DRUM_R, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[DRUM_R, DRUM_R, 1.5, 18]} />
          <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.7} />
          {/* метка на вальце: без неё вращение цилиндра на экране не видно */}
          <mesh>
            <boxGeometry args={[DRUM_R * 2.02, 1.52, 0.05]} />
            <meshStandardMaterial color="#8F98A8" roughness={0.4} metalness={0.6} />
          </mesh>
        </mesh>
        <mesh ref={drumB} position={[0.85, DRUM_R, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[DRUM_R, DRUM_R, 1.5, 18]} />
          <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.7} />
          <mesh>
            <boxGeometry args={[DRUM_R * 2.02, 1.52, 0.05]} />
            <meshStandardMaterial color="#8F98A8" roughness={0.4} metalness={0.6} />
          </mesh>
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[1.5, 0.5, 1.2]} />
          <meshStandardMaterial color={GOLD} roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[0.7, 0.55, 0.9]} />
          <meshStandardMaterial color="#141922" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ПОЕЗД — событие на переезде + вечный рейс в финале.
   ══════════════════════════════════════════════════════════════════════ */
export function Train({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Sprite>(null);

  useFrame(() => {
    const p = progressRef.current;
    if (!root.current) return;

    let z = -100;
    if (p >= ALIVE_FROM) {
      // вечный рейс: длина рейса больше видимой зоны — между составами пауза
      const t = (timeRef.current % LOOP) / LOOP;
      z = TRAIN_FROM + t * TRAIN_SPAN;
    } else {
      const run = cineLin(p, CINE.train);
      if (run > 0 && run < 1) z = lerp(-24, 24, run);
    }
    sceneRefs.trainZ.current = z;

    root.current.visible = z > -30 && z < 30;
    root.current.position.set(RAIL_X, RAIL_TOP, z);
    if (head.current) head.current.material.opacity = root.current.visible ? 0.85 : 0;
  });

  return (
    <group ref={root} visible={false}>
      {/* Локомотив */}
      <group position={[0, 0, 2.6]}>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[1.45, 1.15, 3.8]} />
          <meshStandardMaterial color="#1C2432" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.02, 1.55]}>
          <boxGeometry args={[1.3, 0.5, 0.7]} />
          <meshStandardMaterial color={GOLD} roughness={0.55} />
        </mesh>
        {/* Лобовое окно + прожектор */}
        <mesh position={[0, 0.95, 1.92]}>
          <boxGeometry args={[1.1, 0.4, 0.05]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
        <GlowSprite spriteRef={head} color="#FFE9B0" size={3.2} position={[0, 0.75, 2.05]} opacity={0.85} />
        {/* Тележки */}
        {[-1.2, 1.2].map(oz => (
          <mesh key={oz} position={[0, 0.12, oz]}>
            <boxGeometry args={[1.5, 0.28, 0.9]} />
            <meshStandardMaterial color="#12151C" roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* Полувагоны */}
      {[-2.1, -6.5].map(oz => (
        <group key={oz} position={[0, 0, oz]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.4, 0.95, 3.9]} />
            <meshStandardMaterial color={CONCRETE} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.06, 0]}>
            <boxGeometry args={[1.2, 0.14, 3.6]} />
            <meshStandardMaterial color="#3A3226" roughness={1} />
          </mesh>
          {[-1.25, 1.25].map(bz => (
            <mesh key={bz} position={[0, 0.12, bz]}>
              <boxGeometry args={[1.45, 0.26, 0.85]} />
              <meshStandardMaterial color="#12151C" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   АВТОМОБИЛЬ — ждёт у закрытого шлагбаума, пересекает после открытия;
   в финале ездит по вечному кругу в противофазе с поездом.
   Едет ПО ПРОФИЛЮ дороги: асфальт → пандус → настил, с наклоном кузова.
   ══════════════════════════════════════════════════════════════════════ */
/* Автомобиль подъезжает к переезду с ВОСТОКА по своей правой полосе
   (z = −1.7, движение в −X). Раньше он шёл с запада и на кадре эпизода
   оказывался в нижнем левом углу — ровно там, где лежит карточка этапа,
   и его попросту не было видно. Правостороннее движение соблюдено:
   при движении в −X правая обочина — это −Z. */
/** Полоса встречного направления */
export const CAR_LANE_Z = -1.7;
/** Место остановки: нос встаёт ДО стоп-линии (RAIL_X + 6.9 = 9.9),
    до стрелы шлагбаума остаётся 2,85 м, до кромки настила — 5,7 м. */
export const CAR_STOP_X = 11.6;

export function Car({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const d = useRef(newDrive());
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const WHEEL_R = 0.22;

  const WHEEL_POS = useMemo<[number, number][]>(
    () => [[-0.75, 0.58], [-0.75, -0.58], [0.75, 0.58], [0.75, -0.58]],
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = progressRef.current;
    if (!root.current) return;

    let x = -100;
    let z = CAR_LANE_Z;
    let eastbound = false; // true — едет в +X (финальный цикл)
    if (p >= ALIVE_FROM) {
      // в финале машина идёт в другую сторону по своей правой полосе
      const t = ((timeRef.current + CAR_LAG) % LOOP) / LOOP;
      x = CAR_FROM + t * CAR_SPAN;
      z = 1.7;
      eastbound = true;
    } else {
      const arr = cineLin(p, CINE.carIn);
      const crossQ = cineLin(p, CINE.carCross);
      if (arr > 0) {
        x = lerp(24, CAR_STOP_X, travel(arr, 0.35)) - travel(crossQ, 0.2) * 26;
        if (crossQ >= 1) x = -100; // уехал
      }
    }

    root.current.visible = x > -18 && x < 20;
    root.current.position.set(x, roadY(x), z);
    // Продольный наклон по уклону пандуса, носом вверх на подъёме.
    // Корпус встречного направления развёрнут на π, поэтому знак крена
    // и направление качения колёс у него обратные.
    const slope = Math.atan((roadY(x + 0.6) - roadY(x - 0.6)) / 1.2);
    const dir = eastbound ? 1 : -1;
    root.current.rotation.set(0, eastbound ? 0 : Math.PI, slope * dir);
    drive(d.current, x, dt, WHEEL_R, dir);
    if (body.current) body.current.rotation.z = pitchOf(d.current, 0.02) * dir;
    for (const w of wheels.current) if (w) w.rotation.y = d.current.spin;
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={1.35} stretchX={1.5} position={[0, 0.02, 0]} opacity={0.4} />
      <group ref={body}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[2.3, 0.5, 1.1]} />
          <meshStandardMaterial color="#E8EAF0" roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh position={[-0.1, 0.82, 0]}>
          <boxGeometry args={[1.3, 0.42, 1.0]} />
          <meshStandardMaterial color="#D5D9E2" roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh position={[-0.1, 0.84, 0]}>
          <boxGeometry args={[1.1, 0.3, 1.04]} />
          <meshStandardMaterial color="#0E1622" roughness={0.2} />
        </mesh>
        {WHEEL_POS.map(([wx, wz], i) => (
          <Wheel
            key={i}
            r={WHEEL_R}
            w={0.16}
            position={[wx, WHEEL_R, wz]}
            attach={m => { wheels.current[i] = m; }}
          />
        ))}
        {/* Фары */}
        <GlowSprite color="#FFE9B0" size={0.7} position={[1.2, 0.45, 0.35]} opacity={0.7} />
        <GlowSprite color="#FFE9B0" size={0.7} position={[1.2, 0.45, -0.35]} opacity={0.7} />
      </group>
    </group>
  );
}

/** Прогресс укладки для слоя асфальта в Stages (единый источник) */
export const asphaltProgress = (p: number) => paveProgress(roadQ(p));

/** Шлагбаумы читают ту же функцию, что и техника */
export { cine, clamp01, ease };
