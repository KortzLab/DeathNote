import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Death Note — a dark, cinematic notebook";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fontDir = join(process.cwd(), "node_modules/@fontsource");
  const [gothic, serif] = await Promise.all([
    readFile(join(fontDir, "unifrakturcook/files/unifrakturcook-latin-700-normal.woff")),
    readFile(join(fontDir, "im-fell-english/files/im-fell-english-latin-400-normal.woff")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 20%, #1c2228 0%, #030304 60%)",
        fontFamily: "Fell",
      }}
    >
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i * 137) % 1200,
            top: (i * 71) % 630,
            width: i % 7 === 0 ? 5 : 3,
            height: i % 7 === 0 ? 5 : 3,
            borderRadius: 9,
            background: i % 7 === 0 ? "#e8eef2" : "#5d6266",
            opacity: 0.7,
          }}
        />
      ))}
      <div style={{ display: "flex", position: "relative", transform: "rotate(-6deg)" }}>
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 14,
            width: 330,
            height: 450,
            background: "#dcdcd6",
            borderRadius: 8,
          }}
        />
        <div
          style={{
            width: 340,
            height: 460,
            borderRadius: 10,
            background: "linear-gradient(135deg, #1d1819, #070606)",
            border: "1px solid #2a2624",
            boxShadow: "0 40px 80px rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Gothic",
              fontSize: 50,
              whiteSpace: "nowrap",
              color: "#f4f7f8",
              textShadow: "0 0 14px rgba(200,225,240,0.6)",
            }}
          >
            DEATH NOTE
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: -8,
            width: 16,
            height: 220,
            background: "#0a0a0c",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 48,
          display: "flex",
          fontSize: 26,
          letterSpacing: 6,
          color: "#a59c8f",
        }}
      >
        EVERY NAME IS A DOOR. SOME ONLY OPEN ONCE.
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Gothic", data: gothic, weight: 700, style: "normal" },
        { name: "Fell", data: serif, weight: 400, style: "normal" },
      ],
    },
  );
}
