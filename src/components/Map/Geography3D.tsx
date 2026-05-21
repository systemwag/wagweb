'use client';

/**
 * Geography3D — a 3D companion to the flat <KazakhstanMap />. Renders the same
 * `projects` data as glowing pillars rising from a flat plane, with a soft
 * ground glow. Intentionally minimal geometry so it stays under ~30 KB
 * gzipped on top of the shared three/r3f bundle.
 *
 * Coordinate mapping: the KazakhstanMap viewBox is -100 → 1100 (X) and
 * 30 → 850 (Y) in SVG units (1200 × 820). We normalise into a square ~6×4
 * plane in scene space.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/lib/types';

const STATUS_COLOR: Record<string, string> = {
  completed:    '#D4A843',
  'in-progress':'#00C4A7',
  planned:      '#4F84FF',
};

const PLANE_W = 6;
const PLANE_H = 4;
const VB_X = -100, VB_Y = 30, VB_W = 1200, VB_H = 820;

function toScene(x: number, y: number): [number, number] {
  // SVG coords (origin top-left, Y down) → scene plane (origin centre, Z forward)
  const nx = (x - VB_X) / VB_W - 0.5;
  const ny = (y - VB_Y) / VB_H - 0.5;
  return [nx * PLANE_W, -ny * PLANE_H];
}

function Marker({ x, z, color, height, phase }: { x: number; z: number; color: string; height: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    ref.current.position.y = height / 2 + Math.sin(t * 0.8 + phase) * 0.02;
  });
  return (
    <group position={[x, 0, z]}>
      {/* Pillar */}
      <mesh ref={ref} castShadow>
        <cylinderGeometry args={[0.035, 0.035, height, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* Base glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.18, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[PLANE_W * 1.4, PLANE_H * 1.4]} />
      <meshStandardMaterial color="#0a0e18" roughness={1} metalness={0} />
    </mesh>
  );
}

function GridOverlay() {
  // A subtle radial grid texture by intersecting transparent lines
  const lines = useMemo(() => {
    const arr: [number, number, number, number][] = [];
    const step = 0.4;
    for (let x = -PLANE_W / 2; x <= PLANE_W / 2; x += step) arr.push([x, -PLANE_H / 2, x, PLANE_H / 2]);
    for (let z = -PLANE_H / 2; z <= PLANE_H / 2; z += step) arr.push([-PLANE_W / 2, z, PLANE_W / 2, z]);
    return arr;
  }, []);
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([x1, y1, 0, x2, y2, 0]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#D4A843" transparent opacity={0.06} />
        </line>
      ))}
    </group>
  );
}

function CameraRig({ paused }: { paused: boolean }) {
  const t = useRef(0);
  useFrame(({ camera }, delta) => {
    if (paused) return;
    t.current += delta * 0.06;
    const r = 5.5;
    camera.position.set(Math.cos(t.current) * r * 0.4, 3.4, 4.2 + Math.sin(t.current) * 0.4);
    camera.lookAt(0, 0.3, 0);
  });
  return null;
}

function Scene({ projects, paused }: { projects: Project[]; paused: boolean }) {
  return (
    <>
      <CameraRig paused={paused} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} color="#D4A843" castShadow />
      <directionalLight position={[-3, 3, -2]} intensity={0.7} color="#4F84FF" />
      <ambientLight intensity={0.25} />
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>
      <Ground />
      <GridOverlay />
      {projects.map((p) => {
        if (p.x_map == null || p.y_map == null) return null;
        const [x, z] = toScene(p.x_map, p.y_map);
        const color = STATUS_COLOR[p.status] ?? STATUS_COLOR.completed;
        const height = p.featured ? 0.85 : 0.45;
        // Deterministic phase from id, so bobbing is stable across renders
        const phase = (p.id * 1.7) % (Math.PI * 2);
        return <Marker key={p.id} x={x} z={z} color={color} height={height} phase={phase} />;
      })}
      <fog attach="fog" args={['#04060C', 5, 14]} />
    </>
  );
}

export default function Geography3D({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(true);
  // Lazy initialiser — this component mounts client-side only.
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (reduced) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setPaused(!e.isIntersecting)),
      { threshold: 0.1 },
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
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,196,167,0.12) 0%, transparent 70%)',
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
        camera={{ position: [2, 3.4, 4.5], fov: 40 }}
      >
        <Scene projects={projects} paused={paused} />
      </Canvas>
    </div>
  );
}
