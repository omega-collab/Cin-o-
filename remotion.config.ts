// Configuration Remotion — format vertical 1080x1920 (Reels/Stories/TikTok)
// optimisé mobile-first puisque l'app cible mobile et les techniciens
// regardent essentiellement sur smartphone.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./remotion/index.ts");
