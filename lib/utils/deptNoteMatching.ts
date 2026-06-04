// Filtrage des notes département par utilisateur.
// Centralisé ici pour éviter la duplication (3 composants en avaient une
// copie : Hero, ScheduleList, SequenceSheet) → divergence garantie au
// prochain ajustement de keywords.
//
// Règles :
// 1. La production voit toujours tout.
// 2. Un département vu sans department / "tous" / "all" / "toutes" → visible
//    pour tous (cas où l'admin écrit une note générale).
// 3. Si le département string contient un mot-clé du slug courant → visible.
// 4. Fallback : si le département string ne matche AUCUN slug connu → on
//    affiche pour tous (mieux que de masquer silencieusement).

import type { DeptNote } from "@/lib/types/shoot";

export const DEPT_KEYWORDS: Record<string, string[]> = {
  camera:     ["caméra", "camera", "image", "chef op", "cadreur", "steadi"],
  electro:    ["électro", "electro", "électricité", "electricite", "gaffer", "groupe"],
  machino:    ["machino", "machinerie", "grip", "machiniste"],
  son:        ["son", "perchman", "perche", "prise de son"],
  regie:      ["régie", "regie", "régisseur", "regisseur", "scripte", "1er ad", "2e ad"],
  deco:       ["déco", "deco", "décoration", "decoration", "accessoir", "ensembl"],
  hmc:        ["hmc", "maquillage", "coiffure", "costume", "habillage", "perruque"],
  cantine:    ["cantine", "catering", "restauration", "traiteur"],
  // Renommé "Mise en scène" en UI — slug interne reste "direction".
  // Garde "réal" pour les feuilles legacy.
  direction:  ["direction", "mise en scène", "mise en scene", "réal", "real", "metteur en scène"],
  production: ["production", "directeur de prod", "chargé de prod", "secrétaire de prod"],
};

export function matchesDept(note: DeptNote, slug: string | null): boolean {
  if (!slug || slug === "production") return true;
  const dept = note.department?.toLowerCase().trim() ?? "";
  if (!dept || dept === "tous" || dept === "all" || dept === "toutes" || dept === "tout") return true;
  if ((DEPT_KEYWORDS[slug] ?? []).some((k) => dept.includes(k))) return true;
  // Note avec département non mappable → affichée pour tous (fallback safe).
  const matchesAny = Object.values(DEPT_KEYWORDS).some((keys) =>
    keys.some((k) => dept.includes(k))
  );
  return !matchesAny;
}
