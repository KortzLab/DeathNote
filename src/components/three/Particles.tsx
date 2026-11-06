"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Seeded so useMemo stays pure (react-hooks/purity).
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ashVertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
varying float vSeed;
varying float vAlpha;
void main() {
  vec3 p = position;
  float speed = 0.06 + aSeed * 0.12;
  p.y = mod(p.y - uTime * speed + 20.0, 8.0) - 2.0;
  float t = uTime * 0.25 + aSeed * 40.0;
  p.x += sin(t * 1.3 + aSeed * 6.0) * 0.45 + uTime * 0.02;
  p.z += cos(t * 0.9 + aSeed * 3.0) * 0.35;
  p.x = mod(p.x + 6.0, 12.0) - 6.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.5 + aSeed * 4.5) * uPixelRatio * (5.0 / -mv.z);
  vSeed = aSeed;
  vAlpha = smoothstep(-2.0, -1.2, p.y) * (1.0 - smoothstep(5.0, 6.0, p.y));
}`;

const ashFragment = /* glsl */ `
varying float vSeed;
varying float vAlpha;
uniform float uTime;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  bool ember = vSeed > 0.94;
  vec3 color = ember ? vec3(0.92, 0.95, 0.97) : vec3(0.5, 0.53, 0.56);
  float flicker = ember ? 0.6 + 0.4 * sin(uTime * 6.0 + vSeed * 50.0) : 1.0;
  gl_FragColor = vec4(color, soft * vAlpha * (ember ? 0.95 : 0.45) * flicker);
}`;

export function Ash({ count = 1400 }: { count?: number }) {
  const { gl } = useThree();
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, seeds } = useMemo(() => {
    const random = mulberry(count);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 12;
      positions[i * 3 + 1] = random() * 8 - 2;
      positions[i * 3 + 2] = (random() - 0.5) * 8 - 1;
      seeds[i] = random();
    }
    return { positions, seeds };
  }, [count]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }),
    [gl],
  );

  useFrame((_, dt) => {
    if (material.current) material.current.uniforms.uTime!.value += dt;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={ashVertex}
        fragmentShader={ashFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

const dustVertex = /* glsl */ `
attribute vec3 aVel;
attribute float aSeed;
uniform float uProgress;
uniform float uPixelRatio;
varying float vAlpha;
void main() {
  float e = 1.0 - pow(1.0 - uProgress, 3.0);
  vec3 p = position + aVel * e;
  p.y += sin(uProgress * 3.14159) * aVel.y * 0.4 - uProgress * uProgress * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (4.0 + aSeed * 10.0) * (1.0 + uProgress) * uPixelRatio * (4.0 / -mv.z);
  vAlpha = (1.0 - uProgress) * step(0.001, uProgress);
}`;

const dustFragment = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(0.4, 0.42, 0.44, smoothstep(0.5, 0.0, d) * vAlpha * 0.35);
}`;

/** Animate `progress.value` from 0 to 1 to play the burst. */
export function DustBurst({
  progress,
  count = 260,
}: {
  progress: { value: number };
  count?: number;
}) {
  const { gl } = useThree();
  const { positions, vels, seeds } = useMemo(() => {
    const random = mulberry(count + 7);
    const positions = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2;
      const r = 0.5 + random() * 0.3;
      positions[i * 3] = Math.cos(a) * r * 0.8;
      positions[i * 3 + 1] = 0.02;
      positions[i * 3 + 2] = Math.sin(a) * r;
      const s = 0.8 + random() * 1.6;
      vels[i * 3] = Math.cos(a) * s;
      vels[i * 3 + 1] = 0.15 + random() * 0.5;
      vels[i * 3 + 2] = Math.sin(a) * s;
      seeds[i] = random();
    }
    return { positions, vels, seeds };
  }, [count]);
  const uniforms = useMemo(
    () => ({ uProgress: progress, uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }),
    [gl, progress],
  );
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aVel" args={[vels, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
