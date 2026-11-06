"use client";

import type { Ref } from "react";
import type * as THREE from "three";
import {
  BLOCK_T,
  COVER_T,
  LEAF_GAP,
  LEAVES,
  PAGE_H,
  PAGE_W,
  type BookAssets,
} from "@/components/three/book";

type Props = {
  assets: BookAssets;
  coverPivotRef: Ref<THREE.Group>;
  coverMaterialRef: Ref<THREE.MeshPhysicalMaterial>;
};

export function BookModel({ assets, coverPivotRef, coverMaterialRef }: Props) {
  const { cover, endpaper, leaves, pageGeometry } = assets;
  const coverSize: [number, number, number] = [PAGE_W + 0.04, PAGE_H + 0.06, COVER_T];

  return (
    <>
      <mesh position={[PAGE_W / 2, 0, COVER_T / 2]}>
        <boxGeometry args={coverSize} />
        <meshPhysicalMaterial
          map={cover.map}
          roughnessMap={cover.roughnessMap}
          roughness={0.75}
          clearcoat={0.25}
          clearcoatRoughness={0.6}
        />
      </mesh>

      <mesh position={[PAGE_W / 2, 0, COVER_T + BLOCK_T / 2]}>
        <boxGeometry args={[PAGE_W - 0.02, PAGE_H - 0.03, BLOCK_T]} />
        <meshStandardMaterial color="#d8d8d2" roughness={0.95} />
      </mesh>

      {leaves.map((leaf, i) => (
        <group key={i}>
          <mesh geometry={pageGeometry} material={leaf.front} />
          <mesh geometry={pageGeometry} material={leaf.back} />
        </group>
      ))}

      {/* Pivot sits on the spine so rotating it swings the cover open. */}
      <group
        ref={coverPivotRef}
        position={[0, 0, COVER_T + BLOCK_T + LEAVES.length * LEAF_GAP + 0.01]}
      >
        <mesh position={[PAGE_W / 2, 0, COVER_T / 2]}>
          <boxGeometry args={coverSize} />
          <meshPhysicalMaterial
            ref={coverMaterialRef}
            map={cover.map}
            roughnessMap={cover.roughnessMap}
            emissiveMap={cover.emissiveMap}
            emissive="#ffffff"
            emissiveIntensity={0.32}
            roughness={0.7}
            clearcoat={0.3}
            clearcoatRoughness={0.5}
          />
        </mesh>
        <mesh position={[PAGE_W / 2, 0, -0.0005]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[PAGE_W, PAGE_H]} />
          <meshStandardMaterial map={endpaper} roughness={0.95} />
        </mesh>
      </group>
    </>
  );
}
