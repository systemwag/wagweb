'use client';

/* Техника «живой стройки». Каждая машина не появляется — она РАБОТАЕТ:
   экскаватор копает трёхзвенной стрелой, самосвал привозит и вываливает
   грунт, асфальтоукладчик стелет полотно (слой растёт ровно за ним),
   каток укатывает следом, поезд проходит переезд по графику, автомобиль
   ждёт у шлагбаума и пересекает путь после открытия.

   Всё читает progressRef/timeRef внутри useFrame — ноль ре-рендеров. */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ProgressRef, TimeRef, phaseProgress, sub, subAbs, lerp, clamp01, ease,
  ROAD_LEN, ROAD_EMB_H, ASPHALT_TOP, RAIL_X, RAIL_TOP, CINE, ALIVE_FROM,
  GOLD, GOLD_LIGHT, TEAL, CONCRETE, STEEL,
} from './phases';
import { GlowSprite, BlobShadow } from './fx';

/* ══════════════════════════════════════════════════════════════════════
   ЭКСКАВАТОР — фаза 2. Заезжает, разворачивается к корыту, копает:
   стрела/рукоять/ковш ходят в противофазе, кабина доворачивается.
   ══════════════════════════════════════════════════════════════════════ */
export function Excavator({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  const boom = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const bucket = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 3);
    const t = timeRef.current;
    if (!root.current) return;

    const appear = sub(q, 0, 0.14);
    const leave = sub(q, 0.94, 1);
    root.current.visible = appear > 0.01 && leave < 0.99 && phaseProgress(p, 4) < 0.35;

    // заезд слева вдоль будущей дороги, отъезд после отсыпки
    const x = lerp(-17, -7.5, appear) + leave * -10;
    root.current.position.set(x, 0, 4.9);

    // рабочий цикл: интенсивность включается в среднем окне фазы
    const work = sub(q, 0.2, 0.32) * (1 - sub(q, 0.86, 0.96));
    const cyc = t * 1.5;
    if (upper.current) upper.current.rotation.y = -0.5 + Math.sin(cyc * 0.5) * 0.55 * work;
    if (boom.current) boom.current.rotation.z = -0.55 + Math.sin(cyc) * 0.28 * work;
    if (arm.current) arm.current.rotation.z = 0.85 + Math.sin(cyc + 1.2) * 0.5 * work;
    if (bucket.current) bucket.current.rotation.z = 0.6 + Math.sin(cyc + 2.1) * 0.7 * work;
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={2.4} stretchX={1.25} />
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
        <group ref={boom} position={[0.6, 0.55, 0]}>
          <mesh position={[1.1, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[2.3, 0.32, 0.26]} />
            <meshStandardMaterial color={GOLD} roughness={0.55} />
          </mesh>
          <group ref={arm} position={[2.2, 0, 0]}>
            <mesh position={[0.75, 0, 0]}>
              <boxGeometry args={[1.6, 0.22, 0.2]} />
              <meshStandardMaterial color={GOLD_LIGHT} roughness={0.55} />
            </mesh>
            <group ref={bucket} position={[1.5, 0, 0]}>
              <mesh position={[0.28, -0.1, 0]} rotation={[0, 0, -0.5]}>
                <boxGeometry args={[0.55, 0.4, 0.55]} />
                <meshStandardMaterial color="#2A2F3A" roughness={0.8} metalness={0.3} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   САМОСВАЛ — фаза 2. Подъезжает к экскаватору, поднимает кузов
   (отсыпка), опускает и уезжает.
   ══════════════════════════════════════════════════════════════════════ */
export function DumpTruck({ progressRef }: { progressRef: ProgressRef }) {
  const root = useRef<THREE.Group>(null);
  const bed = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 3);
    if (!root.current) return;

    const arrive = sub(q, 0.3, 0.48);
    const depart = sub(q, 0.82, 0.98);
    root.current.visible = q > 0.3 && depart < 0.99 && phaseProgress(p, 4) < 0.1;
    root.current.position.set(lerp(16, -2.5, arrive) + depart * -14, 0, 6.6);
    root.current.rotation.y = Math.PI; // носом влево

    if (bed.current) {
      const tip = sub(q, 0.55, 0.68) * (1 - sub(q, 0.72, 0.8));
      bed.current.rotation.z = -tip * 0.55;
    }
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={2.2} stretchX={1.4} />
      {/* Колёса */}
      {[[-1.25, 0.62], [-1.25, -0.62], [0.5, 0.62], [0.5, -0.62], [1.15, 0.62], [1.15, -0.62]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.34, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.26, 14]} />
          <meshStandardMaterial color="#12151C" roughness={0.9} />
        </mesh>
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
        <mesh position={[-1.05, 0.82, 0]}>
          <boxGeometry args={[2.3, 0.14, 1.15]} />
          <meshStandardMaterial color="#3A3226" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   АСФАЛЬТОУКЛАДЧИК + КАТОК — фаза 3. Верхний слой асфальта растёт
   ровно за укладчиком (единая функция прогресса), каток идёт следом.
   ══════════════════════════════════════════════════════════════════════ */
export const paveProgress = (q3: number) => sub(q3, 0.18, 0.8);

export function Paver({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Sprite>(null);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 4);
    if (!root.current) return;
    const pv = paveProgress(q);
    const gone = sub(q, 0.86, 1);
    root.current.visible = q > 0.02 && gone < 0.99 && phaseProgress(p, 5) < 0.1;
    root.current.position.set(lerp(-ROAD_LEN / 2 + 0.5, ROAD_LEN / 2 - 0.5, pv), ROAD_EMB_H + 0.15, gone * 6.5);
    if (glow.current) {
      const working = pv > 0.01 && pv < 0.99 ? 1 : 0.15;
      glow.current.material.opacity = 0.55 * working * (0.8 + Math.sin(timeRef.current * 7) * 0.2);
    }
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={2.1} stretchX={1.3} position={[0, -0.13, 0]} />
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
      <GlowSprite spriteRef={glow} color="#FF8A3A" size={2.6} position={[-1.15, 0.25, 0]} opacity={0.5} />
    </group>
  );
}

export function Roller({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const drumA = useRef<THREE.Mesh>(null);
  const drumB = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = progressRef.current;
    const q = phaseProgress(p, 4);
    if (!root.current) return;
    const pv = paveProgress(q);
    const gone = sub(q, 0.9, 1);
    root.current.visible = pv > 0.06 && gone < 0.99 && phaseProgress(p, 5) < 0.1;
    const x = Math.max(-ROAD_LEN / 2 + 1.2, lerp(-ROAD_LEN / 2 + 0.5, ROAD_LEN / 2 - 0.5, pv) - 4.2);
    // каток «челноком» слегка ходит поперёк за укладчиком
    const weave = Math.sin(timeRef.current * 0.9) * 1.1 * (pv > 0.05 && pv < 0.98 ? 1 : 0);
    root.current.position.set(x, ASPHALT_TOP, weave + gone * -6);
    // Вальцы: цилиндр лежит осью вдоль Z (rotation.x=π/2); при порядке
    // Эйлера XYZ качение — это ВТОРОЕ вращение вокруг локальной оси Y
    // (оси самого вальца). rotation.z крутил бы его вокруг вертикали.
    const spin = timeRef.current * 2.2;
    if (drumA.current) drumA.current.rotation.y = spin;
    if (drumB.current) drumB.current.rotation.y = spin;
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={1.5} stretchX={1.4} position={[0, -0.72, 0]} />
      <mesh ref={drumA} position={[-0.85, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 1.5, 18]} />
        <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh ref={drumB} position={[0.85, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 1.5, 18]} />
        <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.7} />
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
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ПОЕЗД — событие фазы «Переезд» + вечный рейс в финале.
   Локомотив с прожектором и два полувагона.
   ══════════════════════════════════════════════════════════════════════ */
export function Train({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Sprite>(null);
  /** Текущая Z поезда — читают шлагбаумы в финале */
  const zRef = useRef<number>(-100);

  useFrame(() => {
    const p = progressRef.current;
    if (!root.current) return;

    let z = -100;
    if (p >= ALIVE_FROM) {
      // вечный рейс: период 8 у.е. времени, растянут на 60 м пути
      const t = (timeRef.current % 8) / 8;
      z = -30 + t * 60;
    } else {
      const run = subAbs(p, CINE.train[0], CINE.train[1]);
      if (run > 0 && run < 1) z = lerp(-26, 26, run);
    }
    zRef.current = z;
    trainZ.current = z;

    root.current.visible = z > -28 && z < 28;
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

/** Общий канал: текущая Z поезда (для автоматики переезда в финале) */
export const trainZ: { current: number } = { current: -100 };

/* ══════════════════════════════════════════════════════════════════════
   АВТОМОБИЛЬ — ждёт у закрытого шлагбаума, пересекает после открытия;
   в финале ездит по вечному кругу в противофазе с поездом.
   ══════════════════════════════════════════════════════════════════════ */
export function Car({ progressRef, timeRef }: { progressRef: ProgressRef; timeRef: TimeRef }) {
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progressRef.current;
    if (!root.current) return;

    let x = -100;
    if (p >= ALIVE_FROM) {
      // сдвиг +3 к фазе поезда → у переезда они не встречаются
      const t = ((timeRef.current + 3) % 8) / 8;
      x = -15 + t * 30;
    } else if (p >= CINE.carIn[0] - 0.004) {
      const arr = subAbs(p, CINE.carIn[0], CINE.carIn[1]);
      const crossQ = subAbs(p, CINE.carCross[0], CINE.carCross[1]);
      // стоп-линия ПЕРЕД шлагбаумом (шлагбаум на x = RAIL_X - 4.6)
      x = lerp(-13, -2.8, arr) + crossQ * 16.5;
      if (crossQ >= 1) x = -100; // уехал
    }

    root.current.visible = x > -16 && x < 16;
    root.current.position.set(x, ASPHALT_TOP, 1.7);
  });

  return (
    <group ref={root} visible={false}>
      <BlobShadow radius={1.35} stretchX={1.5} position={[0, 0.02, 0]} opacity={0.4} />
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
      {[[-0.75, 0.58], [-0.75, -0.58], [0.75, 0.58], [0.75, -0.58]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.22, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.16, 12]} />
          <meshStandardMaterial color="#12151C" roughness={0.9} />
        </mesh>
      ))}
      {/* Фары */}
      <GlowSprite color="#FFE9B0" size={0.7} position={[1.2, 0.45, 0.35]} opacity={0.7} />
      <GlowSprite color="#FFE9B0" size={0.7} position={[1.2, 0.45, -0.35]} opacity={0.7} />
    </group>
  );
}

/** Прогресс укладки для слоя асфальта в Stages (единый источник) */
export const asphaltProgress = (p: number) => {
  const q = phaseProgress(p, 3);
  return paveProgress(q);
};

export { clamp01, ease };
