"use client";

import * as THREE from "three";
import { RULES } from "@/content/rules";

// next/font generates hashed family names; the CSS variable is the only stable handle.
function font(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { c, ctx };
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

export function coverTextures(size = 1024) {
  const w = size;
  const h = Math.round(size * 1.4);
  const r = rng(11);
  const gothic = font("--font-gothic", "serif");

  const { c, ctx } = canvas(w, h);
  const g = ctx.createRadialGradient(w * 0.4, h * 0.35, 10, w / 2, h / 2, w);
  g.addColorStop(0, "#1d1819");
  g.addColorStop(1, "#070606");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) {
    const v = r();
    ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${r() * 0.035})` : `rgba(0,0,0,${r() * 0.25})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2.2, 1 + r() * 2.2);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  for (let i = 0; i < 40; i++) {
    ctx.lineWidth = 1 + r() * 2;
    ctx.beginPath();
    const x = r() * w;
    const y = r() * h;
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + r() * 80 - 40, y + r() * 30, x + r() * 160 - 80, y + r() * 60 - 30);
    ctx.stroke();
  }
  ctx.setLineDash([10, 9]);
  ctx.strokeStyle = "rgba(120,110,100,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, w - 68, h - 68);
  ctx.setLineDash([]);

  // engraved: dark inset with a light lower lip
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const titleY = h * 0.3;
  ctx.font = `700 ${Math.round(w * 0.15)}px ${gothic}`;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillText("DEATH NOTE", w / 2, titleY + 3);
  ctx.fillStyle = "#020202";
  ctx.fillText("DEATH NOTE", w / 2, titleY);
  ctx.fillStyle = "#eef2f4";
  ctx.fillText("DEATH NOTE", w / 2, titleY - 1);

  const em = canvas(w, h);
  em.ctx.fillStyle = "#000";
  em.ctx.fillRect(0, 0, w, h);
  em.ctx.textAlign = "center";
  em.ctx.textBaseline = "middle";
  em.ctx.font = `700 ${Math.round(w * 0.15)}px ${gothic}`;
  em.ctx.shadowColor = "#cfe0ea";
  em.ctx.shadowBlur = 18;
  em.ctx.fillStyle = "#7e8f99";
  em.ctx.fillText("DEATH NOTE", w / 2, titleY - 1);
  em.ctx.shadowBlur = 0;
  em.ctx.fillStyle = "#c9d4da";
  em.ctx.fillText("DEATH NOTE", w / 2, titleY - 1);

  const ro = canvas(w / 2, h / 2);
  ro.ctx.fillStyle = "#b8b8b8";
  ro.ctx.fillRect(0, 0, w / 2, h / 2);
  for (let i = 0; i < 6000; i++) {
    const v = Math.floor(120 + r() * 120);
    ro.ctx.fillStyle = `rgb(${v},${v},${v})`;
    ro.ctx.fillRect(r() * (w / 2), r() * (h / 2), 2, 2);
  }

  return {
    map: toTexture(c),
    emissiveMap: toTexture(em.c),
    roughnessMap: toTexture(ro.c, false),
  };
}

function paper(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#f0f0eb");
  g.addColorStop(1, "#d9d9d3");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 7000; i++) {
    ctx.fillStyle = `rgba(40,44,48,${r() * 0.06})`;
    ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
  }
  const v = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.85);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(30,34,38,0.35)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  if (r() > 0.5) {
    ctx.strokeStyle = "rgba(50,54,58,0.14)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(w * (0.6 + r() * 0.3), h * (0.1 + r() * 0.2), 50 + r() * 30, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (r() > 0.6) {
    ctx.fillStyle = "rgba(143,15,18,0.28)";
    ctx.beginPath();
    ctx.arc(w * r(), h * (0.7 + r() * 0.25), 8 + r() * 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
  return yy + lh;
}

export type PageSpec =
  | { kind: "endpaper" }
  | { kind: "toc" }
  | { kind: "rules"; from: number; to: number; heading?: boolean; number: number }
  | { kind: "invite"; number: number }
  | { kind: "blank"; number?: number };

export function pageTexture(spec: PageSpec, seed: number) {
  const w = 768;
  const h = 1075;
  const { c, ctx } = canvas(w, h);
  paper(ctx, w, h, seed);
  const gothic = font("--font-gothic", "serif");
  const serif = font("--font-serif", "serif");
  const hand = font("--font-hand", "cursive");
  const scrawl = font("--font-scrawl", "cursive");
  const ink = "#16110f";
  const pad = 70;

  if (spec.kind === "endpaper") {
    ctx.strokeStyle = "rgba(20,16,18,0.12)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.45, 140, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.45 - 170);
    ctx.lineTo(w / 2, h * 0.45 + 170);
    ctx.moveTo(w / 2 - 90, h * 0.45 - 70);
    ctx.lineTo(w / 2 + 90, h * 0.45 - 70);
    ctx.stroke();
    ctx.fillStyle = "rgba(20,16,18,0.5)";
    ctx.font = `italic 26px ${serif}`;
    ctx.textAlign = "center";
    ctx.fillText("Should this notebook find you,", w / 2, h * 0.75);
    ctx.fillText("it has already decided to stay.", w / 2, h * 0.75 + 36);
  }

  if (spec.kind === "toc") {
    ctx.fillStyle = ink;
    ctx.font = `48px ${scrawl}`;
    ctx.fillText("Contents", pad, 150);
    ctx.font = `600 44px ${hand}`;
    const rows = [
      ["How to use it", "I"],
      ["The rules", "II – XVIII"],
      ["Your names", "→"],
    ];
    rows.forEach(([a, b], i) => {
      const y = 280 + i * 90;
      ctx.fillText(a ?? "", pad, y);
      ctx.textAlign = "right";
      ctx.fillText(b ?? "", w - pad, y);
      ctx.textAlign = "left";
      ctx.setLineDash([3, 8]);
      ctx.strokeStyle = "rgba(20,16,18,0.4)";
      ctx.beginPath();
      ctx.moveTo(pad + ctx.measureText(a ?? "").width + 16, y);
      ctx.lineTo(w - pad - ctx.measureText(b ?? "").width - 16, y);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  if (spec.kind === "rules") {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0e0f11");
    bg.addColorStop(1, "#050506");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    let y = 120;
    if (spec.heading) {
      ctx.save();
      ctx.translate(pad, 120);
      ctx.rotate(-0.04);
      ctx.fillStyle = "#f2f4f5";
      ctx.font = `46px ${scrawl}`;
      ctx.fillText("How to use it", 0, 0);
      ctx.restore();
      y = 210;
    }
    for (const rule of RULES.en.slice(spec.from, spec.to)) {
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 40px ${gothic}`;
      ctx.fillText(`${rule.numeral}.`, pad, y);
      ctx.fillStyle = "#d4dadf";
      ctx.font = `26px ${serif}`;
      y = wrap(ctx, rule.body, pad, y + 42, w - pad * 2, 34) + 30;
    }
  }

  if (spec.kind === "invite") {
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.font = `700 64px ${gothic}`;
    ctx.fillText("Your page", w / 2, h * 0.38);
    ctx.font = `600 46px ${hand}`;
    ctx.fillText("waits for a name.", w / 2, h * 0.38 + 80);
    ctx.fillStyle = ink;
    ctx.font = `40px ${scrawl}`;
    ctx.fillText("write it →", w / 2, h * 0.62);
  }

  if ("number" in spec && spec.number) {
    ctx.fillStyle = spec.kind === "rules" ? "rgba(240,244,246,0.5)" : "rgba(20,16,18,0.55)";
    ctx.font = `500 34px ${hand}`;
    ctx.textAlign = "center";
    ctx.fillText(String(spec.number), w / 2, h - 50);
  }

  return toTexture(c);
}
