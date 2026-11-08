import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { sharedNote } from "@/lib/server/public";
import { SHARE_ID } from "@/lib/public/shared";

export const alt = "A page from the Death Note";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function SharedNoteImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = SHARE_ID.test(id) ? await sharedNote(id).catch(() => null) : null;

  const fonts = join(process.cwd(), "node_modules/@fontsource");
  const [gothic, hand] = await Promise.all([
    readFile(join(fonts, "unifrakturcook/files/unifrakturcook-latin-700-normal.woff")),
    readFile(join(fonts, "caveat/files/caveat-latin-700-normal.woff")),
  ]);

  const sub = note ? [note.cause, note.time].filter(Boolean).join(" — ") : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 20%, #1c2228 0%, #030304 65%)",
      }}
    >
      <div
        style={{
          width: 900,
          height: 470,
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          background: "linear-gradient(180deg, #efefea, #dcdcd6)",
          borderRadius: 10,
          transform: "rotate(-1.5deg)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.85)",
          fontFamily: "Hand",
          color: "#0b0b0d",
        }}
      >
        {note?.name ? (
          <div style={{ fontSize: 84, lineHeight: 1.1 }}>{note.name}</div>
        ) : (
          <div
            style={{
              width: Math.max(4, note?.nameLength ?? 10) * 34,
              height: 64,
              marginTop: 18,
              background: "#0b0b0d",
              borderRadius: 6,
            }}
          />
        )}
        {sub && <div style={{ fontSize: 46, marginTop: 24, color: "#25272b" }}>{sub}</div>}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 30, color: "#55585c" }}>
            {note?.penName ? `— ${note.penName}` : ""}
          </div>
          <div style={{ fontFamily: "Gothic", fontSize: 44 }}>Death Note</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Gothic", data: gothic, weight: 700, style: "normal" },
        { name: "Hand", data: hand, weight: 700, style: "normal" },
      ],
    },
  );
}
