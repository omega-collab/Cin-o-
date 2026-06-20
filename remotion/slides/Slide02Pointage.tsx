import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

// Slide 2 — Pointage 1 clic
// Mise en scène d'un mockup mobile avec 3 boutons cyan qui s'illuminent
// les uns après les autres pour simuler le flow Coupure / Reprise / Fin.
export const Slide02Pointage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.6 } });

  // Pulsations successives des 3 boutons (15-30, 35-50, 55-70)
  const btn1 = interpolate(frame, [15, 25, 35], [0, 1, 0.55], { extrapolateRight: "clamp" });
  const btn2 = interpolate(frame, [35, 45, 55], [0, 1, 0.55], { extrapolateRight: "clamp" });
  const btn3 = interpolate(frame, [55, 65, 75], [0, 1, 1], { extrapolateRight: "clamp" });

  const bullet1Opacity = interpolate(frame, [70, 82], [0, 1], { extrapolateRight: "clamp" });
  const bullet2Opacity = interpolate(frame, [78, 90], [0, 1], { extrapolateRight: "clamp" });
  const bullet3Opacity = interpolate(frame, [86, 98], [0, 1], { extrapolateRight: "clamp" });

  const exitOpacity = interpolate(frame, [108, 120], [1, 0], { extrapolateLeft: "clamp" });

  const Button = ({ label, glow }: { label: string; glow: number }) => (
    <div
      style={{
        background: `rgba(0, 224, 208, ${0.12 + glow * 0.18})`,
        border: `2px solid rgba(0, 224, 208, ${0.3 + glow * 0.7})`,
        borderRadius: 28,
        padding: "28px 24px",
        color: theme.cyan,
        fontSize: 38,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        textAlign: "center",
        boxShadow: glow > 0.6 ? `0 0 40px rgba(0, 224, 208, ${glow * 0.5})` : "none",
        transform: `scale(${1 + glow * 0.04})`,
      }}
    >
      {label}
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, padding: 80, justifyContent: "center" }}>
      {/* Eyebrow */}
      <p
        style={{
          fontSize: 26,
          color: theme.cyan,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          marginBottom: 24,
          fontWeight: 700,
          opacity: enter,
        }}
      >
        Pointage du jour
      </p>

      <h2
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: theme.white,
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 30}px)`,
        }}
      >
        Fini la saisie
        <br />
        des heures
        <br />
        <span style={{ color: theme.cyan }}>à la main.</span>
      </h2>

      {/* Stack des 3 boutons */}
      <div style={{ marginTop: 80, display: "flex", flexDirection: "column", gap: 18 }}>
        <Button label="Coupure déjeuner" glow={btn1} />
        <Button label="Reprise du travail" glow={btn2} />
        <Button label="Fin de journée" glow={btn3} />
      </div>

      {/* Bénéfices */}
      <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { text: "Heures sup. calculées auto", opacity: bullet1Opacity },
          { text: "Heures de nuit · anticipées · journée continue", opacity: bullet2Opacity },
          { text: "Convocation pré-remplie depuis la FDS", opacity: bullet3Opacity },
        ].map((b) => (
          <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 18, opacity: b.opacity }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: theme.cyan, flexShrink: 0 }} />
            <p style={{ fontSize: 30, color: theme.textSoft, margin: 0, fontWeight: 500 }}>{b.text}</p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
