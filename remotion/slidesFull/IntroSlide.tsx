import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

// Intro de la vidéo "tour complet" : logo CinéO + slogan + conventions.
// Durée : 120 frames (4s).
export const IntroSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({ frame, fps, config: { damping: 200, mass: 0.5 } });
  const titleProgress = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 200, mass: 0.5 } });
  const subOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const tagOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  // Fadeout 120 → 132 pour faire crossfade avec la section 1 qui démarre à 120
  const exitOpacity = interpolate(frame, [120, 132], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: exitOpacity,
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
            "radial-gradient(circle at 50% 40%, rgba(0,224,208,0.30), transparent 55%)",
        }}
      />

      {/* Logo block */}
      <div
        style={{
          width: 168,
          height: 168,
          borderRadius: 36,
          background: theme.cyanSoft,
          border: `2px solid ${theme.cyanBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 56,
          transform: `scale(${logoProgress}) translateY(${(1 - logoProgress) * 40}px)`,
          opacity: logoProgress,
          boxShadow: `0 24px 80px rgba(0,224,208,0.30)`,
        }}
      >
        <span style={{ fontSize: 92, fontWeight: 900, color: theme.cyan, letterSpacing: "-0.06em" }}>
          C
        </span>
      </div>

      {/* Wordmark */}
      <h1
        style={{
          fontSize: 156,
          fontWeight: 900,
          color: theme.white,
          margin: 0,
          letterSpacing: "-0.05em",
          transform: `translateY(${(1 - titleProgress) * 50}px)`,
          opacity: titleProgress,
        }}
      >
        Ciné<span style={{ color: theme.cyan }}>O</span>
      </h1>

      {/* Slogan */}
      <p
        style={{
          fontSize: 46,
          color: theme.textSoft,
          marginTop: 48,
          fontWeight: 600,
          textAlign: "center",
          opacity: subOpacity,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
        }}
      >
        Le tournage
        <br />
        <span style={{ color: theme.cyan, fontWeight: 800 }}>dans ta poche.</span>
      </p>

      {/* Conventions tag */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: tagOpacity,
        }}
      >
        <p
          style={{
            fontSize: 26,
            color: theme.muted,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Cinéma · Audiovisuel
        </p>
        <p style={{ fontSize: 22, color: theme.muted, opacity: 0.6, marginTop: 12 }}>
          IDCC 2642 · IDCC 3097
        </p>
      </div>
    </AbsoluteFill>
  );
};
