import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

// Slide 5 — CTA final
// "Gratuit. cineo.app" — slogan de clôture avec accent fort et URL
// mise en avant. Animation : titre punchy + URL qui zoom légèrement.
export const Slide05CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.5 } });
  const urlEnter = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 180, mass: 0.6 } });
  const closingOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });
  const footerOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });

  // Halo qui pulse derrière l'URL
  const haloScale = 1 + Math.sin((frame / fps) * 2) * 0.06;

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      {/* Eyebrow */}
      <p
        style={{
          fontSize: 32,
          color: theme.cyan,
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          marginBottom: 32,
          fontWeight: 800,
          opacity: enter,
        }}
      >
        Gratuit · Pour toujours
      </p>

      {/* URL en gros, central */}
      <div
        style={{
          position: "relative",
          padding: "40px 60px",
          opacity: urlEnter,
          transform: `scale(${0.85 + urlEnter * 0.15})`,
        }}
      >
        {/* Halo cyan */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            background: `radial-gradient(circle, ${theme.cyanSoft} 0%, transparent 70%)`,
            transform: `scale(${haloScale})`,
            borderRadius: "50%",
          }}
        />
        <h1
          style={{
            position: "relative",
            fontSize: 200,
            fontWeight: 900,
            color: theme.cyan,
            margin: 0,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          cineo
          <span style={{ color: theme.white }}>.app</span>
        </h1>
      </div>

      {/* Sous-titre instructions */}
      <p
        style={{
          fontSize: 38,
          color: theme.textSoft,
          marginTop: 56,
          fontWeight: 500,
          opacity: closingOpacity,
          lineHeight: 1.3,
        }}
      >
        Connecte-toi.
        <br />
        Rejoins ton projet.
        <br />
        <span style={{ color: theme.white, fontWeight: 700 }}>Pointe ta journée.</span>
      </p>

      {/* Footer signature */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: footerOpacity,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: theme.glass,
            border: `1px solid ${theme.stroke}`,
            borderRadius: 999,
            padding: "16px 32px",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 999, background: theme.cyan }} />
          <p style={{ fontSize: 26, color: theme.textSoft, margin: 0, fontWeight: 600, letterSpacing: "0.04em" }}>
            Conçue par des intermittents.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
