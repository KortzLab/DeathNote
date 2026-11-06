// All sounds are generated here and handed to Howler as WAV blob URLs. No audio assets.

export type SoundName =
  "rustle" | "tick" | "heartbeat" | "thunder" | "rain" | "scratch" | "laugh" | "creak" | "thud";

const RATE = 22050;

type Gen = (n: number, rate: number) => Float32Array;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// RBJ cookbook band-pass, in place.
function bandpass(buf: Float32Array, freq: number, q: number, rate = RATE) {
  const w = (2 * Math.PI * freq) / rate;
  const alpha = Math.sin(w) / (2 * q);
  const b0 = alpha,
    b2 = -alpha,
    a0 = 1 + alpha,
    a1 = -2 * Math.cos(w),
    a2 = 1 - alpha;
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i] ?? 0;
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    buf[i] = y;
  }
  return buf;
}

function lowpass(buf: Float32Array, amount: number) {
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y += amount * ((buf[i] ?? 0) - y);
    buf[i] = y;
  }
  return buf;
}

function normalise(buf: Float32Array, peak = 0.9) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  if (max > 0) for (let i = 0; i < buf.length; i++) buf[i] = ((buf[i] ?? 0) / max) * peak;
  return buf;
}

const GENERATORS: Record<SoundName, { seconds: number; gen: Gen }> = {
  rustle: {
    seconds: 0.55,
    gen: (n) => {
      const r = rng(7);
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const env = Math.sin(Math.PI * Math.pow(t, 0.6)) * (0.6 + 0.4 * Math.sin(t * 40 + r()));
        const crackle = r() > 0.985 ? (r() - 0.5) * 3 : 0;
        out[i] = ((r() - 0.5) * env + crackle * env) * 0.8;
      }
      return normalise(bandpass(out, 3200, 0.6), 0.55);
    },
  },
  tick: {
    seconds: 0.05,
    gen: (n, rate) => {
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / rate;
        out[i] = Math.sin(2 * Math.PI * 2100 * t) * Math.exp(-t * 140);
      }
      return normalise(out, 0.35);
    },
  },
  heartbeat: {
    seconds: 1.1,
    gen: (n, rate) => {
      const out = new Float32Array(n);
      const beat = (t0: number, amp: number) => {
        for (let i = 0; i < n; i++) {
          const t = i / rate - t0;
          if (t < 0 || t > 0.35) continue;
          const f = 70 - t * 90;
          out[i] = (out[i] ?? 0) + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 14) * amp;
        }
      };
      beat(0.02, 1);
      beat(0.3, 0.7);
      return normalise(lowpass(out, 0.25), 0.95);
    },
  },
  thunder: {
    seconds: 4.5,
    gen: (n) => {
      const r = rng(13);
      const out = new Float32Array(n);
      let brown = 0;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        brown = (brown + (r() - 0.5) * 0.08) * 0.995;
        const env = Math.min(1, t * 18) * Math.exp(-t * 2.6) * (0.7 + 0.3 * Math.sin(t * 23));
        out[i] = brown * env;
      }
      return normalise(lowpass(out, 0.08), 0.8);
    },
  },
  rain: {
    seconds: 4,
    gen: (n, rate) => {
      const r = rng(21);
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = (r() - 0.5) * 0.35;
      bandpass(out, 2400, 0.35);
      for (let d = 0; d < 260; d++) {
        const start = Math.floor(r() * (n - rate * 0.02));
        const f = 2500 + r() * 3500;
        for (let j = 0; j < rate * 0.02; j++) {
          const t = j / rate;
          const idx = start + j;
          out[idx] = (out[idx] ?? 0) + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 300) * 0.15;
        }
      }
      // Cross-fade the ends so the loop is seamless.
      const fade = Math.floor(rate * 0.2);
      for (let i = 0; i < fade; i++) {
        const k = i / fade;
        const a = out[i] ?? 0;
        const b = out[n - fade + i] ?? 0;
        out[i] = a * k + b * (1 - k);
      }
      return normalise(out.subarray(0, n - fade).slice(), 0.35);
    },
  },
  scratch: {
    seconds: 0.16,
    gen: (n) => {
      const r = rng(5);
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        out[i] = (r() - 0.5) * Math.sin(Math.PI * t) * (0.5 + 0.5 * Math.sin(t * 90));
      }
      return normalise(bandpass(out, 5200, 1.2), 0.25);
    },
  },
  laugh: {
    seconds: 1.6,
    gen: (n, rate) => {
      const out = new Float32Array(n);
      const grains = [0, 0.32, 0.6, 0.86, 1.1];
      grains.forEach((g, k) => {
        const f0 = 118 - k * 9;
        for (let i = 0; i < n; i++) {
          const t = i / rate - g;
          if (t < 0 || t > 0.24) continue;
          const env = Math.sin((Math.PI * t) / 0.24) ** 2;
          const phase = (t * f0) % 1;
          out[i] = (out[i] ?? 0) + (phase < 0.12 ? 1 : -0.1) * env;
        }
      });
      const a = bandpass(out.slice(), 650, 3);
      const b = bandpass(out.slice(), 1100, 4);
      for (let i = 0; i < n; i++) out[i] = (a[i] ?? 0) + 0.6 * (b[i] ?? 0);
      return normalise(out, 0.7);
    },
  },
  creak: {
    seconds: 1.2,
    gen: (n, rate) => {
      const out = new Float32Array(n);
      let phase = 0;
      for (let i = 0; i < n; i++) {
        const t = i / rate;
        const f = 34 + 18 * Math.sin(t * 3.1) + 6 * Math.sin(t * 17);
        phase += f / rate;
        const pulse = phase % 1 < 0.06 ? 1 : 0;
        out[i] = pulse * Math.sin((Math.PI * t) / 1.2);
      }
      return normalise(bandpass(out, 900, 2), 0.5);
    },
  },
  thud: {
    seconds: 0.9,
    gen: (n, rate) => {
      const r = rng(3);
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / rate;
        out[i] =
          Math.sin(2 * Math.PI * (48 - t * 20) * t) * Math.exp(-t * 7) +
          (r() - 0.5) * Math.exp(-t * 18) * 0.6;
      }
      return normalise(lowpass(out, 0.3), 0.9);
    },
  },
};

function encodeWav(samples: Float32Array, rate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export function synthesize(name: SoundName): string {
  const { seconds, gen } = GENERATORS[name];
  const samples = gen(Math.floor(seconds * RATE), RATE);
  return URL.createObjectURL(encodeWav(samples, RATE));
}

export const SOUND_NAMES = Object.keys(GENERATORS) as SoundName[];
