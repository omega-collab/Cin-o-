import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

// Outro de la vidéo "tour complet" : CTA, URL, baseline conçue par des intermittents.
// Durée : 120 frames (4s).
export const OutroSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200, mass: 0.5 } });
  const ctaProgress = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 200, mass: 0.5 } });
  const baselineOpacity = interpolate(frame, [38, 58], [0, 1], { extrapolateRight: "clamp" });
  // Fade-in pour crossfade avec la dernière section (overlap 12 frames).
  const enterOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [120, 132], [1, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sectionOpacity = Math.min(enterOpacity, exitOpacity);

  return (
    <AbsoluteFill
      style={{
        opacity: sectionOpacity,
        background: theme.bgGradient,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Halo cyan en fond */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,224,208,0.35), transparent 55%)",
        }}
      />

      {/* Wordmark plus petit en haut */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 30}px)`,
        }}
      >
        <h1 style={{ fontSize: 88, fontWeight: 900, color: theme.white, margin: 0, letterSpacing: "-0.05em" }}>
          Ciné<span style={{ color: theme.cyan }}>O</span>
        </h1>
      </div>

      {/* CTA bloc central */}
      <div
        style={{
          opacity: ctaProgress,
          transform: `scale(${0.92 + ctaProgress * 0.08}) translateY(${(1 - ctaProgress) * 40}px)`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 36,
            color: theme.cyan,
            margin: 0,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          Gratuit
        </p>
        <h2
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: theme.white,
            margin: "32px 0 0",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
          }}
        >
          cineo.app
        </h2>
        <p
          style={{
            fontSize: 36,
            color: theme.textSoft,
            margin: "48px 0 0",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Toute l&apos;app dans ta poche.
          <br />
          Pour chaque jour de tournage.
        </p>
      </div>

      {/* Baseline en bas */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: baselineOpacity,
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: theme.muted,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Conçue par des intermittents
        </p>
        <p style={{ fontSize: 22, color: theme.muted, opacity: 0.6, marginTop: 12 }}>
          Pour des intermittents
        </p>
      </div>
    </AbsoluteFill>
  );
};
