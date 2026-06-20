import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

// Slide 4 — Notes de frais OCR
// Ticket photographié → matrice générée. Animation : le ticket "scanne"
// avec une barre cyan qui descend, puis les valeurs extraites apparaissent.
export const Slide04Frais: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.6 } });

  const scanY = interpolate(frame, [25, 65], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scanOpacity = interpolate(frame, [25, 30, 60, 65], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  const valuesOpacity = interpolate(frame, [65, 80], [0, 1], { extrapolateRight: "clamp" });
  const bulletsStart = 85;
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
        Notes de frais
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
        Photo du ticket.
        <br />
        <span style={{ color: theme.cyan }}>Matrice prête.</span>
      </h2>

      {/* Ticket mockup avec barre de scan */}
      <div style={{ marginTop: 56, display: "flex", gap: 24, alignItems: "stretch" }}>
        {/* Ticket */}
        <div
          style={{
            flex: 1,
            background: "#FAFAF7",
            color: "#1a1a1a",
            borderRadius: 16,
            padding: "28px 22px",
            fontFamily: "monospace",
            fontSize: 22,
            lineHeight: 1.6,
            position: "relative",
            overflow: "hidden",
            transform: `rotate(-2deg) scale(${0.92 + enter * 0.08})`,
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            opacity: enter,
          }}
        >
          <p style={{ margin: 0, textAlign: "center", fontWeight: 700, fontSize: 24 }}>STATION TOTAL</p>
          <p style={{ margin: "2px 0 0", textAlign: "center", color: "#666", fontSize: 18 }}>06/12/26 11:43</p>
          <div style={{ borderTop: "1px dashed #999", margin: "16px 0" }} />
          <p style={{ margin: "4px 0" }}>Carburant SP95</p>
          <p style={{ margin: "4px 0" }}>EUR/L 1,82</p>
          <p style={{ margin: "4px 0" }}>Litres 24,3</p>
          <div style={{ borderTop: "1px dashed #999", margin: "16px 0" }} />
          <p style={{ margin: "4px 0", fontWeight: 700 }}>TOTAL TTC 44,23 €</p>
          <p style={{ margin: "12px 0 0", textAlign: "center", color: "#666", fontSize: 18 }}>AB-123-CD</p>

          {/* Barre de scan */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${scanY}%`,
              height: 4,
              background: `linear-gradient(90deg, transparent, ${theme.cyan}, transparent)`,
              opacity: scanOpacity,
              boxShadow: `0 0 20px ${theme.cyan}`,
            }}
          />
        </div>

        {/* Valeurs extraites */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            justifyContent: "center",
            opacity: valuesOpacity,
          }}
        >
          {[
            { label: "Fournisseur", value: "STATION TOTAL" },
            { label: "Date", value: "06/12/2026" },
            { label: "Montant TTC", value: "44,23 €" },
            { label: "Plaque", value: "AB-123-CD" },
            { label: "Nature", value: "Carburant" },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                background: theme.glass,
                border: `1px solid ${theme.stroke}`,
                borderRadius: 16,
                padding: "12px 16px",
              }}
            >
              <p style={{ fontSize: 18, color: theme.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {row.label}
              </p>
              <p style={{ fontSize: 24, color: theme.white, margin: "2px 0 0", fontWeight: 700 }}>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bullets bénéfices */}
      <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          "Matrice PDF prête pour la production",
          "Détection auto plaque + indemnité kilométrique",
          "Bonus : la cantine reçoit le brief, toi tu manges",
        ].map((text, i) => {
          const opacity = interpolate(
            frame,
            [bulletsStart + i * 6, bulletsStart + 12 + i * 6],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          return (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 16, opacity }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: theme.cyan, flexShrink: 0 }} />
              <p style={{ fontSize: 28, color: theme.textSoft, margin: 0, fontWeight: 500 }}>{text}</p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
