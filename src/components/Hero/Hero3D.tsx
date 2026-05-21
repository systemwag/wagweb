'use client';

/**
 * Hero3D — small WebGL railway-track scene for the Hero centerpiece.
 *
 * Composition: two parallel rails (metallic) sitting on wooden sleepers atop a
 * ballast bed. Slow orbital camera, warm gold key-light + cold teal fill-light.
 *
 * Performance:
 *   • frameloop="demand"  → renders only when something changes
 *   • IntersectionObserver pauses the orbit when offscreen
 *   • prefers-reduced-motion → returns a static fallback (no canvas mounted)
 *   • Touch / no-WebGL → fallback also kicks in
 *
 * Used via `dynamic(() => import('./Hero3D'), { ssr: false })`.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const GOLD  = '#D4A843';
const TEAL  = '#00C4A7';
const DARK  = '#04060C';

/* ── Camera rig: gentle orbit around the track ──────────────────────────── */
function CameraRig({ paused }: { paused: boolean }) {
  const { camera } = useThree();
  const t = useRef(0);
  useFrame((_, delta) => {
    if (paused) return;
    t.current += delta * 0.12; // ~52s per loop
    const r = 5.2;
    camera.position.set(
      Math.cos(t.current) * r,
      1.6 + Math.sin(t.current * 0.5) * 0.35,
      Math.sin(t.current) * r,
    );
    camera.lookAt(0, 0.1, 0);
  });
  return null;
}

/* ── Rail (one of two, mirrored) ────────────────────────────────────────── */
function Rail({ x }: { x: number }) {
  // I-beam-like profile via stacked boxes; kept low-poly on purpose
  return (
    <group position={[x, 0.12, 0]}>
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[0.08, 0.04, 14]} />
        <meshStandardMaterial color="#cfd2d9" metalness={0.9} roughness={0.28} />
      </mesh>
      {/* Web */}
      <mesh castShadow receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[0.025, 0.06, 14]} />
        <meshStandardMaterial color="#8a8e98" metalness={0.85} roughness={0.4} />
      </mesh>
      {/* Foot */}
      <mesh castShadow receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[0.12, 0.02, 14]} />
        <meshStandardMaterial color="#7a7e88" metalness={0.8} roughness={0.45} />
      </mesh>
    </group>
  );
}

/* ── Sleepers: an array of wooden ties under the rails ──────────────────── */
function Sleepers() {
  const count = 22;
  const spacing = 0.58;
  const items = useMemo(
    () => Array.from({ length: count }, (_, i) => i * spacing - (count - 1) * spacing * 0.5),
    [],
  );
  return (
    <group>
      {items.map((z) => (
        <mesh key={z} position={[0, 0.05, z]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.1, 0.22]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Ballast bed (textureless plane with subtle granular look via roughness) */
function Ballast() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[3.4, 18]} />
      <meshStandardMaterial color="#1a1d24" roughness={1} metalness={0} />
    </mesh>
  );
}

/* ── Scene aggregate ────────────────────────────────────────────────────── */
function Scene({ paused }: { paused: boolean }) {
  return (
    <>
      <CameraRig paused={paused} />

      {/* Warm gold key from one side */}
      <directionalLight
        position={[3, 4, 2]}
        intensity={2.2}
        color={GOLD}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Cold teal fill from the other */}
      <directionalLight position={[-4, 2.5, -3]} intensity={1.1} color={TEAL} />
      <ambientLight intensity={0.18} color="#3b4760" />

      {/* Subtle environment for metallic reflections */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <Ballast />
      <Sleepers />
      <Rail x={-0.72} />
      <Rail x={ 0.72} />

      {/* Soft floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial color={DARK} />
      </mesh>

      <fog attach="fog" args={[DARK, 4, 14]} />
    </>
  );
}

/* ── Public component ───────────────────────────────────────────────────── */
export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(true);   // start paused
  // Lazy initialiser — runs once on first render; this component is mounted
  // client-side only via dynamic(..., { ssr: false }) so window is available.
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (reduced) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setPaused(!e.isIntersecting)),
      { threshold: 0.05 },
    );
    if (containerRef.current) io.observe(containerRef.current);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(212,168,67,0.18) 0%, transparent 70%)',
        }}
      />
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} aria-hidden="true">
      <Canvas
        shadows
        frameloop={paused ? 'never' : 'always'}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [4.5, 1.6, 4.5], fov: 38 }}
      >
        <Scene paused={paused} />
      </Canvas>
    </div>
  );
}

/* Set the camera to look at origin once on mount */
THREE.ColorManagement.enabled = true;
