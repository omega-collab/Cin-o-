import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "./theme";
import { IntroSlide } from "./slidesFull/IntroSlide";
import { OutroSlide } from "./slidesFull/OutroSlide";
import { SectionWithCapture } from "./components/SectionWithCapture";

// Vidéo "tour complet de l'app" — 16 sections @30fps en 1080×1920 vertical.
// Chaque section : 1 capture réelle de l'app + bandeau eyebrow/titre/bullets.
//
// Pour avoir un crossfade fluide entre sections, chaque Sequence dure
// SECTION_LIFE frames mais l'avancée du curseur est de SECTION_DURATION,
// donc les 12 dernières frames de la section N se superposent aux 12
// premières de N+1 (fade-out de l'une + fade-in de l'autre).
const SECTION_DURATION = 120;  // pas du curseur (4s @ 30fps)
const SECTION_LIFE = 132;       // durée effective de la Sequence (overlap 12 frames)

// Définition des 14 sections (entre intro et outro) — chacune référence
// une capture PNG dans /public/captures/ et un trio eyebrow/title/bullets.
const SECTIONS: Array<{
  capture: string;
  eyebrow: string;
  title: string;
  bullets: string[];
}> = [
  {
    capture: "captures/01-today.png",
    eyebrow: "Aujourd'hui",
    title: "Ta journée d'un coup d'œil.",
    bullets: [
      "Call time · Repas · Fin prévue",
      "Notes par section filtrées",
      "Météo · Lieu · Jour de tournage",
    ],
  },
  {
    capture: "captures/02-pointage.png",
    eyebrow: "En direct",
    title: "Séquence en cours, sans chercher.",
    bullets: [
      "Déroulé minute par minute",
      "Localisations GPS · Maps · Waze",
      "Alertes prod · risques · drone",
    ],
  },
  {
    capture: "captures/03-departments.png",
    eyebrow: "Départements",
    title: "10 sections, tout le matos.",
    bullets: [
      "Caméra · Électro · Machino · Son",
      "Régie · Déco · HMC · Production",
      "Stock à jour par équipe",
    ],
  },
  {
    capture: "captures/04-department-dept.png",
    eyebrow: "Détail section",
    title: "Ton stock en temps réel.",
    bullets: [
      "Liste matériel · entrées · sorties",
      "Mouvements tracés par jour",
      "Import feuille de stock PDF",
    ],
  },
  {
    capture: "captures/05-calendar.png",
    eyebrow: "Calendrier",
    title: "Tout le tournage en un mois.",
    bullets: [
      "Jours tournés · à venir · passés",
      "Filtre par section",
      "Édition manuelle des jours",
    ],
  },
  {
    capture: "captures/06-cantine.png",
    eyebrow: "Cantine",
    title: "La cantine briefée en un lien.",
    bullets: [
      "Menu du jour pour l'équipe",
      "Lieu cantine + lieu tournage GPS",
      "Maps · Waze en un tap",
    ],
  },
  {
    capture: "captures/07-heures.png",
    eyebrow: "Mes heures",
    title: "Saisie en 10 secondes.",
    bullets: [
      "Cinéma (SFACT) · Audiovisuel",
      "Heures sup · nuit · anticipées auto",
      "Pause déjeuner intégrée",
    ],
  },
  {
    capture: "captures/08-frais.png",
    eyebrow: "Notes de frais",
    title: "Photo du ticket → matrice PDF.",
    bullets: [
      "OCR Mistral · date · fournisseur · TTC",
      "Plaque immat détectée",
      "Export matrice PDF prête",
    ],
  },
  {
    capture: "captures/09-admin-dashboard.png",
    eyebrow: "Admin",
    title: "La prod tient la barre.",
    bullets: [
      "Import FDS · révision · publication",
      "Fin de journée archivée auto",
      "Statut tournage en direct",
    ],
  },
  {
    capture: "captures/10-admin-codes.png",
    eyebrow: "Accès",
    title: "Codes d'accès par section.",
    bullets: [
      "Toggle global activable",
      "Un code unique par département",
      "Sync temps réel sur l'équipe",
    ],
  },
  {
    capture: "captures/11-admin-project.png",
    eyebrow: "Projet",
    title: "Permissions · code d'invitation.",
    bullets: [
      "Régen du code d'invitation",
      "Renommage projet",
      "Permissions par section",
    ],
  },
  {
    capture: "captures/12-admin-hours.png",
    eyebrow: "Heures équipe",
    title: "Vue prod : par dept, par personne.",
    bullets: [
      "Total heures sup · nuit",
      "Filtré par section",
      "Pour la paie en fin de tournage",
    ],
  },
  {
    capture: "captures/13-history.png",
    eyebrow: "Historique",
    title: "Tous tes jours archivés.",
    bullets: [
      "Séquences · cast · menu cantine",
      "Recherche par action",
      "Incidents · rapports tracés",
    ],
  },
  {
    capture: "captures/14-documents.png",
    eyebrow: "Documents",
    title: "Toute la doc tournage à portée.",
    bullets: [
      "Plan de tournage · scénarios · board",
      "Catalogue + uploads",
      "Téléchargement direct PDF",
    ],
  },
];

export const CineoVideoFull: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.fontFamily }}>
      <Sequence from={cursor} durationInFrames={SECTION_LIFE}>
        <IntroSlide />
      </Sequence>
      {(() => { cursor += SECTION_DURATION; return null; })()}

      {SECTIONS.map((s) => {
        const from = cursor;
        cursor += SECTION_DURATION;
        return (
          <Sequence key={s.capture} from={from} durationInFrames={SECTION_LIFE}>
            <SectionWithCapture
              capture={s.capture}
              eyebrow={s.eyebrow}
              title={s.title}
              bullets={s.bullets}
              durationFrames={SECTION_LIFE}
            />
          </Sequence>
        );
      })}

      <Sequence from={cursor} durationInFrames={SECTION_LIFE}>
        <OutroSlide />
      </Sequence>
    </AbsoluteFill>
  );
};

// Durée totale calculée : intro + 14 sections au pas de 120 frames + outro 132 frames.
// (1 + SECTIONS.length) × SECTION_DURATION + SECTION_LIFE (la dernière sequence ne se chevauche pas).
export const CINEO_FULL_DURATION =
  (1 + SECTIONS.length) * SECTION_DURATION + SECTION_LIFE;
