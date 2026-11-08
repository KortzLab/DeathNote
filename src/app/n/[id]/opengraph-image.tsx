import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { sharedNote } from "@/lib/server/public";
import { SHARE_ID } from "@/lib/public/shared";
import { SITE } from "@/lib/site";

export const alt = "A page from the Death Note";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b0b0d";
const FADED = "#5d6166";
const LINE_GAP = 66;

/** Satori can't measure text, so pick a size that keeps long names on one line. */
function nameSize(length: number) {
  if (length > 26) return 64;
  if (length > 18) return 84;
  return 108;
}

function Label({ children }: { children: string }) {
  return (
    <div style={{ fontFamily: "Fell", fontSize: 20, letterSpacing: 6, color: FADED }}>
      {children}
    </div>
  );
}

export default async function SharedNoteImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = SHARE_ID.test(id) ? await sharedNote(id).catch(() => null) : null;

  const fonts = join(process.cwd(), "node_modules/@fontsource");
  const [gothic, hand, fell] = await Promise.all([
    readFile(join(fonts, "unifrakturcook/files/unifrakturcook-latin-700-normal.woff")),
    readFile(join(fonts, "caveat/files/caveat-latin-700-normal.woff")),
    readFile(join(fonts, "im-fell-english/files/im-fell-english-latin-400-normal.woff")),
  ]);

  const oneLine = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;
  const host = new URL(SITE.url).host;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "radial-gradient(ellipse at 50% 0%, #1f262c 0%, #050506 70%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 34,
          width: 1100,
          height: 562,
          display: "flex",
          flexDirection: "column",
          padding: "40px 64px 34px 118px",
          background: "linear-gradient(180deg, #f1f1ec 0%, #dcdcd5 100%)",
          borderRadius: 8,
          transform: "rotate(-1deg)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.9)",
          fontFamily: "Hand",
          color: INK,
        }}
      >
        {/* ruled lines and the margin rule */}
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 112 + i * LINE_GAP,
              height: 2,
              background: "rgba(40,44,50,0.16)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 86,
            top: 0,
            bottom: 0,
            width: 2,
            background: "rgba(40,44,50,0.28)",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Label>NAME</Label>
          <div style={{ fontFamily: "Gothic", fontSize: 40 }}>Death Note</div>
        </div>

        {note && (
          <div style={{ fontSize: nameSize(note.name.length), lineHeight: 1.05, ...oneLine }}>
            {note.name}
          </div>
        )}

        {note?.cause && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
            <Label>CAUSE OF DEATH</Label>
            <div style={{ fontSize: 64, lineHeight: 1.1, color: "#202226", ...oneLine }}>
              {note.cause}
            </div>
          </div>
        )}

        {note?.time ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
            <Label>TIME</Label>
            <div style={{ fontSize: 46, color: "#2c2f33", ...oneLine }}>{note.time}</div>
          </div>
        ) : note?.details ? (
          <div style={{ fontSize: 40, marginTop: 14, color: "#2c2f33", ...oneLine }}>
            {note.details}
          </div>
        ) : (
          <div style={{ fontSize: 40, marginTop: 22, color: "#8a8e93" }}>
            Forty seconds later, the ink set.
          </div>
        )}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 36, color: FADED }}>
            {note?.penName ? `— ${note.penName}` : ""}
          </div>
          <div style={{ fontFamily: "Fell", fontSize: 22, letterSpacing: 2, color: FADED }}>
            {host}
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Gothic", data: gothic, weight: 700, style: "normal" },
        { name: "Hand", data: hand, weight: 700, style: "normal" },
        { name: "Fell", data: fell, weight: 400, style: "normal" },
      ],
    },
  );
}
