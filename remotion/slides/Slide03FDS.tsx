import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

// Slide 3 — Feuille de service en direct
// Mockup d'une card Hero CinéO qui se reveal, avec un badge "Live" cyan
// pulsant pour suggérer la synchro temps réel.
export const Slide03FDS: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.6 } });
  const cardEnter = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 200, mass: 0.5 } });

  const pulse = Math.sin((frame / fps) * 4) * 0.5 + 0.5;

  const filterChipOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });
  const filterChipScale = spring({ frame: Math.max(0, frame - 55), fps, config: { damping: 200, mass: 0.5 } });

  const taglineOpacity = interpolate(frame, [80, 95], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [108, 120], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, padding: 80, justifyContent: "center" }}>
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
        Feuille de service
      </p>

      <h2
        style={{
          fontSize: 92,
          fontWeight: 900,
          color: theme.white,
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 30}px)`,
        }}
      >
        Toujours
        <br />
        <span style={{ color: theme.cyan }}>à jour.</span>
      </h2>

      {/* Mockup card Hero */}
      <div
        style={{
          marginTop: 56,
          background: theme.glass,
          border: `1px solid ${theme.stroke}`,
          borderRadius: 36,
          padding: 36,
          opacity: cardEnter,
          transform: `translateY(${(1 - cardEnter) * 40}px) scale(${0.96 + cardEnter * 0.04})`,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header card : badge live + jour */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: theme.cyanSoft,
              border: `1px solid ${theme.cyanBorder}`,
              borderRadius: 999,
              padding: "10px 20px",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: theme.cyan,
                boxShadow: `0 0 ${12 + pulse * 18}px ${theme.cyan}`,
                opacity: 0.6 + pulse * 0.4,
              }}
            />
            <span style={{ color: theme.cyan, fontSize: 22, fontWeight: 700, letterSpacing: "0.08em" }}>
              EN LIGNE
            </span>
          </div>
          <span style={{ color: theme.muted, fontSize: 24, fontWeight: 600, fontFamily: "monospace" }}>
            J 12 / 28
          </span>
        </div>

        {/* Titre projet */}
        <p style={{ fontSize: 48, color: theme.white, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
          Tournage Saison 2
        </p>
        <p style={{ fontSize: 24, color: theme.muted, margin: "8px 0 0" }}>Studio Bry · INT. JOUR</p>

        {/* Convocation */}
        <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${theme.stroke}`,
              borderRadius: 20,
              padding: "16px 20px",
            }}
          >
            <p style={{ fontSize: 20, color: theme.muted, margin: 0 }}>Convocation</p>
            <p style={{ fontSize: 38, color: theme.cyan, fontWeight: 800, fontFamily: "monospace", margin: "4px 0 0" }}>
              07:30
            </p>
          </div>
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${theme.stroke}`,
              borderRadius: 20,
              padding: "16px 20px",
            }}
          >
            <p style={{ fontSize: 20, color: theme.muted, margin: 0 }}>Repas</p>
            <p style={{ fontSize: 38, color: theme.textSoft, fontWeight: 700, fontFamily: "monospace", margin: "4px 0 0" }}>
              12:45
            </p>
          </div>
        </div>
      </div>

      {/* Chips de filtre Ma section */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 12,
          opacity: filterChipOpacity,
          transform: `scale(${0.9 + filterChipScale * 0.1})`,
        }}
      >
        <div
          style={{
            background: theme.cyanSoft,
            color: theme.cyan,
            border: `1px solid ${theme.cyanBorder}`,
            padding: "12px 22px",
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          Ma section
        </div>
        <div
          style={{
            background: theme.glass,
            color: theme.muted,
            border: `1px solid ${theme.stroke}`,
            padding: "12px 22px",
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          Caméra
        </div>
        <div
          style={{
            background: theme.glass,
            color: theme.muted,
            border: `1px solid ${theme.stroke}`,
            padding: "12px 22px",
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          HMC
        </div>
      </div>

      <p
        style={{
          marginTop: 32,
          fontSize: 30,
          color: theme.textSoft,
          fontWeight: 500,
          opacity: taglineOpacity,
          lineHeight: 1.3,
        }}
      >
        Convocation par dept · Notes filtrées
        <br />
        <span style={{ color: theme.muted }}>Hors-ligne · Synchro temps réel</span>
      </p>
    </AbsoluteFill>
  );
};
