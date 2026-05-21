/**
 * Index des sources juridiques utilisées par le moteur de recherche légal CinéO.
 *
 * Sources prioritaires : Légifrance (officielle).
 * Sources complémentaires : USPA, SPI, SPIAC-CGT, FFAP, SYNAVI.
 *
 * Dernière vérification : 2026-05-21
 * À re-vérifier chaque 1er janvier et 1er juillet (dates de revalorisation).
 */

export type LegalSourceKind =
  | "convention_collective"
  | "avenant"
  | "grille_salaire"
  | "annexe"
  | "accord"
  | "source_professionnelle";

export type LegalSector =
  | "audiovisuel"
  | "cinema"
  | "film_publicitaire"
  | "animation"
  | "prestation_technique"
  | "artistes_interpretes"
  | "commun";

export interface LegalSource {
  id: string;
  title: string;
  sector: LegalSector;
  idcc: string;
  kind: LegalSourceKind;
  sourceName: string;
  sourceUrl: string;
  lastCheckedAt: string;
  effectiveDate?: string;
  extensionStatus?: "etendu" | "non_etendu" | "en_vigueur" | "abroge" | "inconnu";
  priority: number;
  notes?: string;
}

export const LEGAL_SOURCES: LegalSource[] = [
  // ── IDCC 2642 — Production audiovisuelle ────────────────────────────────────
  {
    id: "ccn-pav-2642-legifrance",
    title: "Convention collective nationale de la production audiovisuelle du 13 décembre 2006",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "convention_collective",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000018828041",
    lastCheckedAt: "2026-05-21",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Brochure n° 3346. Source officielle prioritaire. Étendue, en vigueur.",
  },
  {
    id: "ccn-pav-2642-avenant-20-salaires-2025",
    title: "Avenant n° 20 du 29 novembre 2024 relatif aux salaires minima conventionnels (IDCC 2642)",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "avenant",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000051379535",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2025-01-01",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Revalorisation +1,5% au 1er janvier 2025 (cat A et B). Plancher 1 828,83 €/mois. +2,2% au 1er juillet 2025 pour CDDU ≤ 1 100 €/semaine ; +1% au-delà.",
  },
  {
    id: "ccn-pav-2642-avenant-19-juillet-2024",
    title: "Avenant n° 19 du 8 juillet 2024 relatif aux salaires et fonctions fiction/flux (IDCC 2642)",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "avenant",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000050219954",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2024-07-01",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Définit les genres fiction et flux. Première revalorisation des fonctions I à VI spécifiques à la fiction et au flux au 1er juillet 2024.",
  },
  {
    id: "ccn-pav-2642-avenant-17-salaires-2024",
    title: "Avenant n° 17 du 18 janvier 2024 relatif à la revalorisation des salaires (IDCC 2642)",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "avenant",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000049300793",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2024-02-01",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Revalorisation cat B CDDU au 1er février 2024.",
  },
  {
    id: "pav-2642-salaires-uspa",
    title: "Grilles des minima conventionnels — production audiovisuelle (USPA)",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "grille_salaire",
    sourceName: "USPA",
    sourceUrl: "https://www.uspa.fr/conventions-collectives-et-accords-sociaux",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2025-01-01",
    extensionStatus: "inconnu",
    priority: 2,
    notes: "Union Syndicale de la Production Audiovisuelle. À croiser avec Légifrance.",
  },
  {
    id: "pav-2642-salaires-spi",
    title: "Grilles des minima conventionnels — production audiovisuelle (SPI / lespi.org)",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "grille_salaire",
    sourceName: "SPI",
    sourceUrl: "https://lespi.org/textes-juridiques/",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2025-01-01",
    extensionStatus: "inconnu",
    priority: 2,
    notes: "Syndicat des Producteurs Indépendants.",
  },
  {
    id: "pav-2642-grilles-spiac-cgt",
    title: "Grilles de fonctions et salaires — filière audiovisuelle (SPIAC-CGT)",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "grille_salaire",
    sourceName: "SPIAC-CGT",
    sourceUrl: "https://spiac-cgt.org/salaires-conventions-collectives/salaires/salaires-production-audiovisuelle/",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2024-06-01",
    extensionStatus: "inconnu",
    priority: 2,
    notes: "Syndicat de techniciens audiovisuels. Grille consolidée catégorie B CDDU fiction/flux/documentaire.",
  },
  {
    id: "pav-2642-grille-atcac-jan2025",
    title: "Grille de salaires cat B fiction au 1er janvier 2025 — ATCAC Corse",
    sector: "audiovisuel",
    idcc: "2642",
    kind: "grille_salaire",
    sourceName: "ATCAC",
    sourceUrl: "https://atcac.corsica/wp-content/uploads/2025/03/CCN-Prod-AV-Grille-de-salaires-1er-janvier-2025-CAT-B-Fiction.pdf",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2025-01-01",
    extensionStatus: "inconnu",
    priority: 3,
    notes: "Document ATCAC consolidé CAT B Fiction au 1er janvier 2025.",
  },

  // ── IDCC 3097 — Production cinématographique ─────────────────────────────────
  {
    id: "ccn-cinema-3097-legifrance",
    title: "Convention collective nationale de la production cinématographique du 19 janvier 2012",
    sector: "cinema",
    idcc: "3097",
    kind: "convention_collective",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000028059838",
    lastCheckedAt: "2026-05-21",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Source officielle. Titres I (dispositions communes), II (techniciens CDDU), III (artistes), IV (permanents). Couvre aussi les films publicitaires.",
  },
  {
    id: "ccn-cinema-3097-avenant-26sept2025-classification",
    title: "Avenant du 26 septembre 2025 relatif à la classification Titre II (IDCC 3097)",
    sector: "cinema",
    idcc: "3097",
    kind: "avenant",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALIARTI000053497571",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2026-05-01",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Étendu par arrêté du 26 mars 2026 (JORF 3 avril 2026). En vigueur au 1er mai 2026. Signé SPI, API, UPC / CGT, SNTPCT. Révise les classifications des fonctions Titre II.",
  },
  {
    id: "ccn-cinema-3097-arrete-extension-6jan2026",
    title: "Arrêté du 6 janvier 2026 portant extension d'un avenant (IDCC 3097)",
    sector: "cinema",
    idcc: "3097",
    kind: "accord",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053378949",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2026-01-01",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Extension des nouveaux minima applicables depuis janvier 2026.",
  },
  {
    id: "ccn-cinema-3097-avenant-23jan2024-salaires-titreII",
    title: "Avenant du 23 janvier 2024 relatif à la révision des salaires minima Titre II (IDCC 3097)",
    sector: "cinema",
    idcc: "3097",
    kind: "avenant",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000050329461",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2024-03-01",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Étendu par arrêté du 3 octobre 2024. +20 € sur tous les minima hebdomadaires Titre II.",
  },
  {
    id: "ccn-cinema-3097-avenant-24juil2023-salaires",
    title: "Avenant du 24 juillet 2023 relatif à la revalorisation des salaires Titres II et IV (IDCC 3097)",
    sector: "cinema",
    idcc: "3097",
    kind: "avenant",
    sourceName: "Légifrance",
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000049095260",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2023-08-01",
    extensionStatus: "etendu",
    priority: 1,
    notes: "Revalorisation Titres II et IV.",
  },
  {
    id: "ccn-cinema-3097-consolidee-spi-2024",
    title: "CCN Production cinématographique consolidée — juin 2024 (SPI)",
    sector: "cinema",
    idcc: "3097",
    kind: "convention_collective",
    sourceName: "SPI",
    sourceUrl: "https://lespi.org/wp-content/uploads/2024/07/CCN-Production-cinema-consolidee-juin-24.pdf",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2024-06-01",
    extensionStatus: "etendu",
    priority: 2,
    notes: "Document consolidé intégrant les avenants jusqu'en juin 2024. À compléter avec les avenants postérieurs (sept 2025, janv 2026) via Légifrance.",
  },
  {
    id: "ccn-cinema-3097-salaires-spi",
    title: "Grilles des minima conventionnels — production cinématographique (SPI)",
    sector: "cinema",
    idcc: "3097",
    kind: "grille_salaire",
    sourceName: "SPI",
    sourceUrl: "https://lespi.org/textes-juridiques/",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2026-01-01",
    extensionStatus: "inconnu",
    priority: 2,
    notes: "Grilles Titre II base 39h applicables en 2026.",
  },
  {
    id: "ccn-cinema-3097-salaires-afar",
    title: "Grilles des salaires minima techniciens cinéma (AFAR)",
    sector: "cinema",
    idcc: "3097",
    kind: "grille_salaire",
    sourceName: "AFAR",
    sourceUrl: "https://www.afar-fiction.com/spip.php?article28=&lang=fr",
    lastCheckedAt: "2026-05-21",
    effectiveDate: "2024-01-01",
    extensionStatus: "inconnu",
    priority: 2,
    notes: "Association Française des Assistants Réalisateurs. Grilles techniciens cinéma Titre II.",
  },
];
