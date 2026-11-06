"use client";

import { useSyncExternalStore } from "react";

export type GpuTier = "none" | "low" | "high";

let cached: GpuTier | null = null;

function probe(): GpuTier {
  if (cached) return cached;
  try {
    // ?webgl=1 / ?webgl=0 to force a path (headless Chrome reports SwiftShader).
    const force = new URLSearchParams(window.location.search).get("webgl");
    if (force === "1") return (cached = "high");
    if (force === "0") return (cached = "none");
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return (cached = "none");
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return (cached = "none");
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const small = Math.min(window.innerWidth, window.innerHeight) < 500;
    if (cores <= 2 || memory <= 2) return (cached = "none");
    if (cores <= 4 || memory <= 4 || small) return (cached = "low");
    return (cached = "high");
  } catch {
    return (cached = "none");
  }
}

export function useWebGLTier(): GpuTier | "pending" {
  return useSyncExternalStore(
    () => () => {},
    () => probe(),
    () => "pending" as const,
  );
}
