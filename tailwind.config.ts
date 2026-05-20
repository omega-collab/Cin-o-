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
        blueSoft: "#2D8CFF",
        orangeSoft: "#FFB020",
        redSoft: "#FF4D4D",
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
