import type { DepartmentSlug } from "@/lib/types";

// Postes par département — terminologie convention collective cinéma / audiovisuel (IDPF)
export const DEPT_ROLES: Record<DepartmentSlug, string[]> = {

  // Caméra
  // DP = chef opérateur qui cadre ; en fiction TV, le DP délègue souvent la caméra à un cadreur
  camera: [
    "Directeur de la photographie",
    "Cadreur",
    "1er assistant caméra",
    "2e assistant caméra",
    "Stagiaire caméra",
  ],

  // Électricité
  // En France il n'y a pas de "best boy" officiel : tous ceux sous le chef sont "électriciens"
  electro: [
    "Chef électricien",
    "Électricien",
  ],

  // Machinerie / Grip
  machino: [
    "Chef machiniste",
    "Machiniste",
    "Opérateur Steadicam",
  ],

  // Son
  son: [
    "Ingénieur du son",
    "Perchman",
    "Assistant son",
  ],

  // Régie — couvre la logistique plateau (régie) ET les assistants mise en scène (AD)
  regie: [
    "1er assistant réalisateur",
    "2e assistant réalisateur",
    "Régisseur général",
    "Régisseur adjoint",
    "Régisseur de plateau",
    "Runner",
  ],

  // Décoration
  deco: [
    "Chef décorateur",
    "Ensemblier",
    "Accessoiriste de plateau",
    "Peintre décorateur",
    "Menuisier décorateur",
  ],

  // HMC — Habillage (costume) + Maquillage + Coiffure
  hmc: [
    "Chef costumier",
    "Costumier",
    "Chef maquilleur",
    "Maquilleur",
    "Chef coiffeur",
    "Coiffeur",
  ],

  // Production
  production: [
    "Directeur de production",
    "Chargé de production",
    "Scripte",
    "Secrétaire de production",
    "Stagiaire",
  ],

  // Cantine / Traiteur plateau
  cantine: [
    "Traiteur de plateau",
    "Cuisinier",
    "Aide-cuisinier",
  ],
};
