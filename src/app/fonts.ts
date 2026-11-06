import localFont from "next/font/local";

export const gothic = localFont({
  src: "../../node_modules/@fontsource/unifrakturcook/files/unifrakturcook-latin-700-normal.woff2",
  variable: "--font-gothic",
  weight: "700",
  display: "swap",
});

export const serif = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/im-fell-english/files/im-fell-english-latin-400-normal.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../../node_modules/@fontsource/im-fell-english/files/im-fell-english-latin-400-italic.woff2",
      style: "italic",
      weight: "400",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const hand = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/caveat/files/caveat-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../../node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2",
      weight: "700",
    },
  ],
  variable: "--font-hand",
  display: "swap",
});

export const scrawl = localFont({
  src: "../../node_modules/@fontsource/homemade-apple/files/homemade-apple-latin-400-normal.woff2",
  variable: "--font-scrawl",
  weight: "400",
  display: "swap",
});
