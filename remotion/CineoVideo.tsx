import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "./theme";
import { Slide01Hook } from "./slides/Slide01Hook";
import { Slide02Pointage } from "./slides/Slide02Pointage";
import { Slide03FDS } from "./slides/Slide03FDS";
import { Slide04Frais } from "./slides/Slide04Frais";
import { Slide05CTA } from "./slides/Slide05CTA";

// 5 slides × 120 frames (4s @ 30fps) = 600 frames total = 20s vidéo.
const SLIDE_DURATION = 120;

export const CineoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.fontFamily }}>
      {/* Halo cyan permanent en fond pour cohérence visuelle */}
      <AbsoluteFill style={{ background: theme.bgGlow }} />

      <Sequence from={0} durationInFrames={SLIDE_DURATION}>
        <Slide01Hook />
      </Sequence>
      <Sequence from={SLIDE_DURATION} durationInFrames={SLIDE_DURATION}>
        <Slide02Pointage />
      </Sequence>
      <Sequence from={SLIDE_DURATION * 2} durationInFrames={SLIDE_DURATION}>
        <Slide03FDS />
      </Sequence>
      <Sequence from={SLIDE_DURATION * 3} durationInFrames={SLIDE_DURATION}>
        <Slide04Frais />
      </Sequence>
      <Sequence from={SLIDE_DURATION * 4} durationInFrames={SLIDE_DURATION}>
        <Slide05CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
