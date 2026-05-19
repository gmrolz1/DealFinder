import localFont from "next/font/local";

// Magnetik — the brand typeface.
export const magnetik = localFont({
  src: [
    { path: "../fonts/Magnetik-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/Magnetik-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/Magnetik-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../fonts/Magnetik-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/Magnetik-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "../fonts/Magnetik-Heavy.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-magnetik",
  display: "swap",
});
