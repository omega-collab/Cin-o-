// Script de rendu de la vidéo CinéO en MP4.
// Usage : node scripts/render-video.mjs [output_path] [composition_id]
// Par défaut sort dans public/cineo-promo.mp4 et utilise la composition CineoVideo.
//
// On utilise les Chromium et FFmpeg pré-installés dans /opt/pw-browsers
// pour éviter les téléchargements bloqués par la network policy.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const OUTPUT = process.argv[2] || path.join(ROOT, "public", "cineo-promo.mp4");
const COMPOSITION_ID = process.argv[3] || "CineoVideo";

const CHROMIUM = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

// Empêche tout téléchargement automatique de Chrome Headless par Remotion.
const noopDownload = () => Promise.resolve(null);

console.log("[remotion] bundling…");
const bundled = await bundle({
  entryPoint: path.join(ROOT, "remotion", "index.ts"),
  webpackOverride: (config) => config,
  publicDir: path.join(ROOT, "public"),
});

console.log(`[remotion] selecting composition ${COMPOSITION_ID}…`);
const composition = await selectComposition({
  serveUrl: bundled,
  id: COMPOSITION_ID,
  chromiumOptions: { executablePath: CHROMIUM, gl: "swangle" },
  browserExecutable: CHROMIUM,
  onBrowserDownload: noopDownload,
});

console.log(`[remotion] rendering ${composition.width}x${composition.height} @${composition.fps}fps · ${composition.durationInFrames} frames → ${OUTPUT}`);

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: OUTPUT,
  chromiumOptions: { executablePath: CHROMIUM, gl: "swangle" },
  browserExecutable: CHROMIUM,
  onBrowserDownload: noopDownload,
  concurrency: 2,
  onProgress: ({ progress }) => {
    const pct = Math.round(progress * 100);
    process.stdout.write(`\r[remotion] ${pct}%   `);
  },
});

console.log("\n[remotion] OK →", OUTPUT);
