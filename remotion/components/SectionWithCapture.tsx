import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Layout split STRICT pour garantir la lisibilité du texte :
//  - Capture occupe les 55% du haut (1056px sur 1920px)
//  - Bandeau opaque dark occupe les 45% restants (864px) avec eyebrow,
//    titre et bullets — AUCUN chevauchement avec la capture.
//
// Animations :
//  - frame 0-12  : fade in section + capture (Ken Burns subtil 1.02→1.06)
//  - frame 8+    : slide-up du bandeau (spring)
//  - frame 22+   : bullets en cascade
//  - frame -12→0 : fade out (crossfade géré par la sequence parent)
//
// Durée standard : 120 frames (4 s @ 30fps).

interface Props {
  capture: string;          // chemin relatif depuis /public, ex "captures/01-today.png"
  eyebrow: string;          // ex "AUJOURD'HUI"
  title: string;            // ex "Ta journée d'un coup d'œil"
  bullets: string[];        // 2-3 points
  panY?: number;            // décalage vertical du pan, par défaut 0
  durationFrames?: number;  // défaut 120
}

// Ratio capture/bandeau : 55%/45% sur la hauteur 1920px
const CAPTURE_HEIGHT_RATIO = 0.55;

export const SectionWithCapture: React.FC<Props> = ({
  capture,
  eyebrow,
  title,
  bullets,
  panY = 0,
  durationFrames = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in/out gérés en parallèle pour crossfade dans la sequence parent
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationFrames - 12, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const sectionOpacity = Math.min(fadeIn, fadeOut);

  // Ken Burns subtil sur la capture (zoom 1.02 → 1.06)
  const zoom = interpolate(frame, [0, durationFrames], [1.02, 1.06]);
  const panOffset = interpolate(frame, [0, durationFrames], [-15 + panY, 15 + panY]);

  // Slide-up du bandeau
  const panelProgress = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 180, mass: 0.6 },
  });
  const panelTranslateY = (1 - panelProgress) * 80;

  return (
    <AbsoluteFill style={{ background: theme.bg, opacity: sectionOpacity }}>
      {/* ── Zone capture (haut) ───────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${CAPTURE_HEIGHT_RATIO * 100}%`,
          overflow: "hidden",
          background: theme.bg,
        }}
      >
        <Img
          src={staticFile(capture)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            transform: `scale(${zoom}) translateY(${panOffset}px)`,
            transformOrigin: "center top",
          }}
        />
        {/* Fondu dégradé bas de la capture vers la couleur du bandeau */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 160,
            background: `linear-gradient(180deg, transparent 0%, ${theme.bg} 100%)`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Zone bandeau (bas) — fond UNI opaque, AUCUNE superposition ───── */}
      <div
        style={{
          position: "absolute",
          top: `${CAPTURE_HEIGHT_RATIO * 100}%`,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.bg,
          padding: "60px 70px 120px",
          display: "flex",
          flexDirection: "column",
          transform: `translateY(${panelTranslateY}px)`,
        }}
      >
        {/* Trait cyan de séparation en haut du bandeau */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 4,
            borderRadius: 999,
            background: theme.cyan,
            boxShadow: `0 0 24px ${theme.cyan}`,
            opacity: panelProgress,
          }}
        />

        {/* Eyebrow cyan */}
        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            color: theme.cyan,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 24,
            opacity: panelProgress,
          }}
        >
          {eyebrow}
        </p>

        {/* Titre principal — sur fond plein opaque, lecture garantie */}
        <h2
          style={{
            margin: 0,
            fontSize: 80,
            fontWeight: 900,
            color: theme.white,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            marginBottom: 40,
            opacity: panelProgress,
          }}
        >
          {title}
        </h2>

        {/* Bullets en cascade */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {bullets.map((b, i) => {
            const itemDelay = 22 + i * 5;
            const itemOpacity = interpolate(
              frame,
              [itemDelay, itemDelay + 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const itemTranslate = interpolate(
              frame,
              [itemDelay, itemDelay + 8],
              [14, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemTranslate}px)`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    minWidth: 12,
                    borderRadius: 999,
                    background: theme.cyan,
                    marginTop: 18,
                    boxShadow: `0 0 16px ${theme.cyan}`,
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 36,
                    color: theme.textSoft,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {b}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
