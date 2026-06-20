// Charte CinéO réutilisée par les slides Remotion.
// Aligné sur tailwind.config.ts / globals.css de l'app.
export const theme = {
  bg: "#071018",        // appBg
  bgGradient: "linear-gradient(180deg, #09141f 0%, #060b12 100%)",
  bgGlow: "radial-gradient(circle at 50% 30%, rgba(0, 224, 208, 0.18), transparent 50%)",
  cyan: "#00E0D0",
  cyanSoft: "rgba(0, 224, 208, 0.16)",
  cyanBorder: "rgba(0, 224, 208, 0.30)",
  white: "#FFFFFF",
  textSoft: "#C9D2E3",
  muted: "#8E9AAF",
  stroke: "rgba(255, 255, 255, 0.10)",
  glass: "rgba(255, 255, 255, 0.05)",
  warning: "#F5A623",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
} as const;
