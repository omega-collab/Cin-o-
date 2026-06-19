import { Composition } from "remotion";
import { CineoIntro } from "./CineoIntro";

// Catalogue des compositions vidéo CinéO.
// Ajouter ici toute nouvelle vidéo pour la voir apparaître dans le studio.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CineoIntro"
        component={CineoIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titre: "CinéO",
          sousTitre: "Gestion de tournage",
        }}
      />
    </>
  );
};
