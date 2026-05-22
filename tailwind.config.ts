import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: "#071018",
        stroke: "rgba(255,255,255,0.10)",
        muted: "#8E9AAF",
        textSoft: "#C9D2E3",
        cyan: "#00E0D0",
        cyanSoft: "rgba(0,224,208,0.16)",
        // Semantic tokens (DESIGN.md) — prefer these over legacy below
        danger:     "#EF4444",
        dangerSoft: "rgba(239,68,68,0.15)",
        warning:    "#F5A623",
        warningSoft:"rgba(245,166,35,0.15)",
        info:       "#3B82F6",
        infoSoft:   "rgba(59,130,246,0.15)",
        success:    "#22C55E",
        successSoft:"rgba(34,197,94,0.15)",
        night:      "#A855F7",
        nightSoft:  "rgba(168,85,247,0.15)",
        // Legacy — kept for backward compat, migrate progressively
        blueSoft:   "#2D8CFF",
        orangeSoft: "#FFB020",
        redSoft:    "#FF4D4D",
        violetSoft: "#A855F7",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0,0,0,0.35)",
        glow: "0 0 25px rgba(0,224,208,0.18)",
      },
      borderRadius: {
        app: "26px",
      },
    },
  },
  plugins: [],
};

export default config;
