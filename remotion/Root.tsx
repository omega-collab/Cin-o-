import { Composition } from "remotion";
import { CineoVideo } from "./CineoVideo";

// Format vertical 1080x1920 (9:16) optimal Reels/TikTok/Stories.
// 30fps, 5 slides × 4s = 20s total = 600 frames.
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
    </>
  );
};
