export const MATRICE_DEPTS = [
  "ACCESSOIRES","ADMINISTRATION","ARMES","ARTISTE","CAMERA","CAMIONS",
  "CANTINE","CASCADES","CASTING","COIFFURE","CONSTRUCTION","COSTUMES",
  "DECORATION","ELECTRICITE","ENSEMBLIER","LOGES","MACHINERIE","MAKING OF",
  "MAQUILLAGE","PRODUCTION","REALISATION","REGIE","SFX","SON",
  "TRANSPORTS","VFX","VOITURE JEU",
] as const;

export type MatriceDept = typeof MATRICE_DEPTS[number];

export interface MatriceLigne {
  id: string;
  date: string;
  fournisseur: string;
  region: string;
  nature: string;
  recuperable: boolean;
  ttc: string;
  tva: string;
  codeComptable: string;
}

export interface MatriceData {
  numero: string;
  dateReleve: string;
  regionGlobale: string;
  nom: string;
  departement: string;
  emploi: string;
  lignes: MatriceLigne[];
}

export const PCG_SUGGESTIONS = [
  { code: "606300", label: "Carburant" },
  { code: "625700", label: "Repas / réceptions" },
  { code: "625600", label: "Mission (repas)" },
  { code: "625100", label: "Hébergement" },
  { code: "625200", label: "Transport (train/avion)" },
  { code: "625800", label: "Péage / Parking" },
  { code: "606100", label: "Fournitures / Matériel" },
  { code: "626000", label: "Télécom / communication" },
  { code: "628000", label: "Divers" },
] as const;
