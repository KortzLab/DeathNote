"use client";

import * as THREE from "three";

export type PageUniforms = {
  uPhi: { value: number };
  uK: { value: number };
  uZ0: { value: number };
  uZ1: { value: number };
};

export function createPageUniforms(z0: number, z1: number): PageUniforms {
  return { uPhi: { value: 0 }, uK: { value: 0 }, uZ0: { value: z0 }, uZ1: { value: z1 } };
}

/**
 * Bends the page around the spine along an arc: angle(s) = uPhi + uK * s, so the free edge
 * curls while turning. Positions are the closed-form integral of that direction; normals
 * are rotated to match. uZ0/uZ1 lerp the stack height so turned pages pile up correctly.
 */
export function createPageMaterial(map: THREE.Texture, uniforms: PageUniforms, back: boolean) {
  const mat = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.92,
    metalness: 0,
    side: back ? THREE.BackSide : THREE.FrontSide,
  });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uPhi;
uniform float uK;
uniform float uZ0;
uniform float uZ1;`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `float pgS = position.x;
float pgK = abs(uK) < 1e-4 ? (uK < 0.0 ? -1e-4 : 1e-4) : uK;
float pgA = uPhi + pgK * pgS;
vec3 objectNormal = vec3(-sin(pgA), 0.0, cos(pgA));
#ifdef USE_TANGENT
vec3 objectTangent = vec3(cos(pgA), 0.0, sin(pgA));
#endif`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(
  (sin(pgA) - sin(uPhi)) / pgK,
  position.y,
  (cos(uPhi) - cos(pgA)) / pgK + mix(uZ0, uZ1, clamp(uPhi / 3.14159265, 0.0, 1.0))
);`,
      );
  };
  return mat;
}
