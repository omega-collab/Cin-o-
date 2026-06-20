import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

// Slide 1 — Hook
// "Le tournage dans ta poche" — slogan d'accroche
// Animations : titre slide-up + fade, sous-titre fade décalé
export const Slide01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 200, mass: 0.5 } });
  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  // Sortie : fade léger à la fin pour la transition
  const exitOpacity = interpolate(frame, [105, 120], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, justifyContent: "center", alignItems: "center", padding: 80 }}>
      {/* Pastille décorative */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: theme.cyan,
          boxShadow: `0 0 32px ${theme.cyan}`,
          marginBottom: 64,
          opacity: subtitleOpacity,
        }}
      />

      {/* Slogan principal */}
      <h1
        style={{
          fontSize: 140,
          fontWeight: 900,
          color: theme.white,
          textAlign: "center",
          lineHeight: 0.95,
          margin: 0,
          letterSpacing: "-0.04em",
          transform: `translateY(${(1 - titleProgress) * 60}px)`,
          opacity: titleProgress,
        }}
      >
        Le tournage
        <br />
        <span style={{ color: theme.cyan }}>dans ta poche.</span>
      </h1>

      {/* Sous-titre */}
      <p
        style={{
          fontSize: 44,
          color: theme.textSoft,
          textAlign: "center",
          marginTop: 56,
          fontWeight: 500,
          opacity: subtitleOpacity,
          letterSpacing: "-0.02em",
        }}
      >
        L&apos;app gratuite des
        <br />
        intermittents du spectacle.
      </p>

      {/* Tagline conventions en bas */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: taglineOpacity,
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: theme.muted,
            margin: 0,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Cinéma · Audiovisuel
        </p>
        <p style={{ fontSize: 22, color: theme.muted, margin: "12px 0 0", opacity: 0.6 }}>
          IDCC 2642 · IDCC 3097
        </p>
      </div>
    </AbsoluteFill>
  );
};
