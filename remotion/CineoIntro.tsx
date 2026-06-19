import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type CineoIntroProps = {
  titre: string;
  sousTitre: string;
};

// Jeton de couleurs CinéO (cf. CLAUDE.md / DESIGN.md).
const COLORS = {
  appBg: "#071018",
  cyan: "#00E0D0",
  textSoft: "#C9D2E3",
  muted: "#8E9AAF",
};

// Première vidéo d'exemple : révélation animée du logo CinéO.
export const CineoIntro: React.FC<CineoIntroProps> = ({ titre, sousTitre }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Apparition du titre avec un ressort.
  const titreProgress = spring({ frame, fps, config: { damping: 200 } });
  const titreScale = interpolate(titreProgress, [0, 1], [0.85, 1]);
  const titreOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Le sous-titre arrive un peu après.
  const sousTitreOpacity = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sousTitreY = interpolate(frame, [25, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fondu de sortie sur les dernières frames.
  const sortie = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.appBg,
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        opacity: sortie,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 180,
            fontWeight: 800,
            letterSpacing: -4,
            color: COLORS.cyan,
            transform: `scale(${titreScale})`,
            opacity: titreOpacity,
            textShadow: "0 0 60px rgba(0,224,208,0.35)",
          }}
        >
          {titre}
        </h1>
        <p
          style={{
            margin: "24px 0 0",
            fontSize: 48,
            fontWeight: 500,
            color: COLORS.textSoft,
            opacity: sousTitreOpacity,
            transform: `translateY(${sousTitreY}px)`,
          }}
        >
          {sousTitre}
        </p>
        <div
          style={{
            margin: "40px auto 0",
            width: interpolate(frame, [40, 80], [0, 320], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            height: 4,
            borderRadius: 2,
            backgroundColor: COLORS.cyan,
          }}
        />
        <p
          style={{
            margin: "28px 0 0",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COLORS.muted,
            opacity: sousTitreOpacity,
          }}
        >
          Cinéma · Télévision · Intermittents
        </p>
      </div>
    </AbsoluteFill>
  );
};
