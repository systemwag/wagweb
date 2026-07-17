'use client';

/* Мелкая светотехника сцены: глоу-спрайты (фары, сигналы, маяки)
   и контактные blob-тени под техникой. Без постпроцессинга —
   свечение имитируется аддитивными спрайтами. */

import { useMemo } from 'react';
import * as THREE from 'three';

let glowTex: THREE.CanvasTexture | null = null;

/** Радиальная текстура свечения (общая на все спрайты) */
export function getGlowTexture(): THREE.CanvasTexture {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

export function GlowSprite({
  color,
  size = 1,
  position = [0, 0, 0],
  opacity = 1,
  spriteRef,
}: {
  color: string;
  size?: number;
  position?: [number, number, number];
  opacity?: number;
  spriteRef?: React.Ref<THREE.Sprite>;
}) {
  const mat = useMemo(() => {
    const m = new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return m;
  }, [color, opacity]);

  return (
    <sprite ref={spriteRef} position={position} scale={[size, size, 1]} material={mat} />
  );
}

/** Мягкая контактная тень: тёмный диск на земле под объектом */
export function BlobShadow({
  radius = 1,
  position = [0, 0.015, 0],
  opacity = 0.32,
  stretchX = 1,
}: {
  radius?: number;
  position?: [number, number, number];
  opacity?: number;
  stretchX?: number;
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getGlowTexture(),
        color: '#000000',
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    [opacity],
  );
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[radius * stretchX, radius, 1]} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
