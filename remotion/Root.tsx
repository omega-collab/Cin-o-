import { Composition } from "remotion";
import { CineoVideo } from "./CineoVideo";
import { CineoVideoFull, CINEO_FULL_DURATION } from "./CineoVideoFull";

// Format vertical 1080x1920 (9:16) optimal Reels/TikTok/Stories.
// 30fps.
//
// - CineoVideo      : 5 slides illustrés × 4s = 20s — vidéo originale.
// - CineoVideoFull  : 1 intro + 14 sections (vraies captures app) + 1 outro
//                     × 4s = 64s — tour complet de l'app.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CineoVideo"
        component={CineoVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CineoVideoFull"
        component={CineoVideoFull}
        durationInFrames={CINEO_FULL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
