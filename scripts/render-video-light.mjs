// Variante "light" du rendu MP4 : même contenu mais plus léger pour
// partage rapide (réseaux sociaux, messageries) et compatibilité large.
//
// Différences avec scripts/render-video.mjs :
// - Résolution forcée à 720×1280 au lieu de 1080×1920 (gain ~4x)
// - CRF plus élevé (compression plus agressive)
// - Audio bitrate réduit
//
// Usage :
//   node scripts/render-video-light.mjs [output_path] [composition_id]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const OUTPUT = process.argv[2] || path.join(ROOT, "public", "cineo-promo-light.mp4");
const COMPOSITION_ID = process.argv[3] || "CineoVideoFull";

const CHROMIUM = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
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

// Force la résolution light (720×1280, ratio identique 9:16)
const lightComposition = {
  ...composition,
  width: 720,
  height: 1280,
};

console.log(`[remotion] rendering LIGHT ${lightComposition.width}x${lightComposition.height} @${lightComposition.fps}fps · ${lightComposition.durationInFrames} frames → ${OUTPUT}`);

await renderMedia({
  composition: lightComposition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: OUTPUT,
  chromiumOptions: { executablePath: CHROMIUM, gl: "swangle" },
  browserExecutable: CHROMIUM,
  onBrowserDownload: noopDownload,
  concurrency: 2,
  // Bitrate cap pour réduire le poids — pas de CRF en parallèle (mutex)
  videoBitrate: "1200k",
  audioBitrate: "96k",
  onProgress: ({ progress }) => {
    const pct = Math.round(progress * 100);
    process.stdout.write(`\r[remotion] ${pct}%   `);
  },
});

console.log("\n[remotion] OK →", OUTPUT);
