import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf4ff",
          100: "#fae8ff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          900: "#581c87",
        },
        cineo: {
          bg: "#0B0C14",
          card: "#13141F",
          "card-inner": "#1C1D2B",
          teal: "#00D4B4",
          "teal-hover": "#00BFA3",
          muted: "#5A5B72",
          border: "rgba(255,255,255,0.07)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
