"use client";

import type { NoteRecord } from "@/lib/notes/types";

type ExportOptions = { blurNames?: boolean; page: number };

const W = 1240;
const H = 1754; // A4 at 150 dpi

function cssFont(varName: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderPage(notes: NoteRecord[], { blurNames, page }: ExportOptions) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const hand = cssFont("--font-hand", "cursive");
  const gothic = cssFont("--font-gothic", "serif");
  const serif = cssFont("--font-serif", "serif");

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#ebdfc4");
  g.addColorStop(1, "#d8c7a1");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(90,60,30,${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
  }
  const v = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.85);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(84,56,22,0.35)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(120,72,28,0.22)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.12, 90, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(143,15,18,0.25)";
  ctx.beginPath();
  ctx.arc(W * 0.14, H * 0.9, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#141012";
  ctx.font = `700 92px ${gothic}`;
  ctx.textAlign = "center";
  ctx.fillText("Death Note", W / 2, 170);
  ctx.textAlign = "left";

  const top = 260;
  const lineH = 62;
  ctx.strokeStyle = "rgba(60,40,30,0.25)";
  ctx.lineWidth = 2;
  for (let y = top; y < H - 140; y += lineH) {
    ctx.beginPath();
    ctx.moveTo(110, y);
    ctx.lineTo(W - 90, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(143,15,18,0.35)";
  ctx.beginPath();
  ctx.moveTo(150, 220);
  ctx.lineTo(150, H - 120);
  ctx.stroke();

  let y = top + lineH - 14;
  for (const n of notes) {
    if (y > H - 200) break;
    ctx.save();
    if (blurNames) ctx.filter = "blur(14px)";
    ctx.fillStyle = n.sealedAt ? "#050304" : "#1d1719";
    ctx.font = `700 64px ${hand}`;
    ctx.fillText(n.name, 180, y);
    ctx.restore();
    y += lineH;
    const sub = [n.cause, n.time].filter(Boolean).join(" — ");
    ctx.fillStyle = "#2b2326";
    ctx.font = `500 44px ${hand}`;
    if (sub) {
      for (const l of wrap(ctx, sub, W - 300)) {
        ctx.fillText(l, 210, y);
        y += lineH;
      }
    }
    if (n.details) {
      ctx.font = `500 38px ${hand}`;
      for (const l of wrap(ctx, n.details, W - 300).slice(0, 4)) {
        ctx.fillText(l, 210, y);
        y += lineH;
      }
    }
    y += lineH / 2;
  }

  ctx.fillStyle = "rgba(20,16,18,0.55)";
  ctx.font = `500 40px ${hand}`;
  ctx.textAlign = "right";
  ctx.fillText(String(page), W - 100, H - 70);
  ctx.textAlign = "left";
  ctx.font = `italic 22px ${serif}`;
  ctx.fillText("Fiction only · Unofficial fan project", 110, H - 70);

  return canvas;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function exportPng(notes: NoteRecord[], opts: ExportOptions) {
  const canvas = await renderPage(notes, opts);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (blob) download(blob, `death-note-page-${opts.page}.png`);
  return blob;
}

// Minimal hand-written PDF: one page, one DCTDecode image. Avoids pulling in a PDF library.
export async function exportPdf(notes: NoteRecord[], opts: ExportOptions) {
  const canvas = await renderPage(notes, opts);
  const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  if (!jpeg) return;
  const img = new Uint8Array(await jpeg.arrayBuffer());
  const pageW = 595.28;
  const pageH = 841.89;
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? enc.encode(chunk) : chunk;
    parts.push(bytes);
    length += bytes.length;
  };
  const obj = (n: number, body: string | (() => void)) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
    if (typeof body === "string") push(body);
    else body();
    push("\nendobj\n");
  };
  const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`;

  push("%PDF-1.4\n%âãÏÓ\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  obj(4, () => {
    push(
      `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`,
    );
    push(img);
    push("\nendstream");
  });
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xref = length;
  push(`xref\n0 6\n0000000000 65535 f \n`);
  for (let i = 1; i <= 5; i++) push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);

  const blob = new Blob(parts as BlobPart[], { type: "application/pdf" });
  download(blob, `death-note-page-${opts.page}.pdf`);
}

export async function sharePage(notes: NoteRecord[], opts: ExportOptions) {
  const canvas = await renderPage(notes, opts);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return "failed" as const;
  const file = new File([blob], `death-note-page-${opts.page}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "A page from my Death Note" });
      return "shared" as const;
    } catch {
      return "cancelled" as const;
    }
  }
  download(blob, file.name);
  return "downloaded" as const;
}
