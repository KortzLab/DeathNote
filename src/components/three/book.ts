"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { coverTextures, pageTexture, type PageSpec } from "@/components/three/textures";
import {
  createPageMaterial,
  createPageUniforms,
  type PageUniforms,
} from "@/components/three/pageMaterial";

// World units. The book lies in its local XY plane with the spine on x = 0.
export const PAGE_W = 1;
export const PAGE_H = 1.4;
export const COVER_T = 0.035;
export const BLOCK_T = 0.11;
export const LEAF_GAP = 0.0035;

export const LEAVES: Array<[front: PageSpec, back: PageSpec]> = [
  [{ kind: "toc" }, { kind: "rules", from: 0, to: 3, heading: true, number: 2 }],
  [
    { kind: "rules", from: 3, to: 6, number: 3 },
    { kind: "rules", from: 6, to: 9, number: 4 },
  ],
  [
    { kind: "rules", from: 9, to: 12, number: 5 },
    { kind: "rules", from: 12, to: 15, number: 6 },
  ],
  [
    { kind: "rules", from: 15, to: 18, number: 7 },
    { kind: "blank", number: 8 },
  ],
  [{ kind: "invite", number: 9 }, { kind: "blank" }],
];

export type Leaf = { uniforms: PageUniforms; front: THREE.Material; back: THREE.Material };

export type BookAssets = {
  cover: ReturnType<typeof coverTextures>;
  endpaper: THREE.Texture;
  leaves: Leaf[];
  pageGeometry: THREE.BufferGeometry;
};

function buildLeaves(): Leaf[] {
  const top = COVER_T + BLOCK_T;
  return LEAVES.map(([front, back], i) => {
    // Unturned leaves stack downwards from the top; turned ones stack upwards on the left.
    const uniforms = createPageUniforms(
      top + (LEAVES.length - i) * LEAF_GAP,
      COVER_T + 0.004 + i * LEAF_GAP,
    );
    const backMap = pageTexture(back, i * 2 + 4);
    // The back face is rendered from behind, so mirror it to read correctly.
    backMap.wrapS = THREE.RepeatWrapping;
    backMap.repeat.x = -1;
    backMap.offset.x = 1;
    return {
      uniforms,
      front: createPageMaterial(pageTexture(front, i * 2 + 3), uniforms, false),
      back: createPageMaterial(backMap, uniforms, true),
    };
  });
}

/** Textures are drawn with the page fonts, so this waits for document.fonts. */
export function useBookAssets(lowPower: boolean): BookAssets | null {
  const [textures, setTextures] = useState<Omit<BookAssets, "pageGeometry"> | null>(null);

  const pageGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(PAGE_W, PAGE_H, lowPower ? 16 : 32, 1);
    geometry.translate(PAGE_W / 2, 0, 0);
    return geometry;
  }, [lowPower]);

  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      setTextures({
        cover: coverTextures(lowPower ? 768 : 1024),
        endpaper: pageTexture({ kind: "endpaper" }, 1),
        leaves: buildLeaves(),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [lowPower]);

  return useMemo(() => textures && { ...textures, pageGeometry }, [textures, pageGeometry]);
}
