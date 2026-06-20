import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Composant réutilisable pour chaque section de la vidéo "tour de l'app".
// Affiche une capture PNG en background avec léger Ken Burns, calque sombre,
// et un bandeau d'info en bas (eyebrow cyan / titre blanc / 2-3 bullets cyan).
//
// Animations :
//  - frame 0-8   : fade in image + zoom 1.0 → 1.04
//  - frame 8-25  : slide-up du bandeau (spring)
//  - frame 25+   : Ken Burns continu (zoom léger jusqu'à 1.08)
//  - frame 105-120 : fade out de la section pour transition.
//
// Durée standard d'une section : 120 frames (4 s @ 30fps).

interface Props {
  capture: string;          // chemin relatif depuis /public, ex "captures/01-today.png"
  eyebrow: string;          // ex "AUJOURD'HUI"
  title: string;            // ex "Ta journée d'un coup d'œil"
  bullets: string[];        // 2-3 points
  panY?: number;            // décalage vertical du pan, par défaut 0 (pan léger vers le bas)
  durationFrames?: number;  // défaut 120
}

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

  // Fade in + fade out symétriques. Le composant CineoVideoFull fait se
  // chevaucher chaque Sequence avec la suivante sur 12 frames → crossfade fluide.
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationFrames - 12, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const sectionOpacity = Math.min(fadeIn, fadeOut);

  // Ken Burns : zoom continu de 1.02 à 1.08 sur la durée
  const zoom = interpolate(frame, [0, durationFrames], [1.02, 1.08]);
  // Pan vertical doux
  const panOffset = interpolate(frame, [0, durationFrames], [-20 + panY, 20 + panY]);

  // Slide-up du bandeau
  const panelProgress = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 160, mass: 0.6 },
  });
  const panelTranslateY = (1 - panelProgress) * 120;

  // Apparition des bullets en cascade
  return (
    <AbsoluteFill style={{ background: theme.bg, opacity: sectionOpacity }}>
      {/* Capture en background avec Ken Burns */}
      <AbsoluteFill
        style={{
          overflow: "hidden",
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
      </AbsoluteFill>

      {/* Calque sombre dégradé pour lisibilité du bandeau bas */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,16,24,0.55) 0%, rgba(7,16,24,0.10) 25%, rgba(7,16,24,0.20) 55%, rgba(7,16,24,0.92) 100%)",
        }}
      />

      {/* Eyebrow / pastille cyan en haut */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            padding: "16px 32px",
            background: theme.cyanSoft,
            border: `1px solid ${theme.cyanBorder}`,
            borderRadius: 999,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: theme.cyan,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </p>
        </div>
      </div>

      {/* Bandeau bas — titre + bullets */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "80px 60px 120px",
          transform: `translateY(${panelTranslateY}px)`,
          opacity: panelProgress,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 84,
            fontWeight: 900,
            color: theme.white,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            marginBottom: 36,
          }}
        >
          {title}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {bullets.map((b, i) => {
            const itemDelay = 18 + i * 5;
            const itemOpacity = interpolate(
              frame,
              [itemDelay, itemDelay + 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const itemTranslate = interpolate(
              frame,
              [itemDelay, itemDelay + 8],
              [16, 0],
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
                  gap: 18,
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
                    fontSize: 38,
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
