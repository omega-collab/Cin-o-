import type { LegalDocumentChunk } from "./legalTypes";

const SRC = "ccn-cinema-3097-legifrance";
const SRC_AV2024 = "ccn-cinema-3097-avenant-23jan2024-salaires-titreII";
const SRC_AV2025 = "ccn-cinema-3097-avenant-26sept2025-classification";
const SRC_ARR2026 = "ccn-cinema-3097-arrete-extension-6jan2026";
const URL_BASE = "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000028059838";
const CHECKED = "2026-05-21";

export const CHUNKS_3097: LegalDocumentChunk[] = [
  {
    id: "3097-champ-application",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "Champ d'application — IDCC 3097",
    article: "Titre I, Art. 1",
    chunkText:
      "La Convention Collective Nationale de la Production Cinématographique (IDCC 3097) s'applique aux entreprises ayant pour activité principale la production de films cinématographiques, y compris les films publicitaires destinés au cinéma. Elle est organisée en quatre titres : Titre I (dispositions communes), Titre II (techniciens et ouvriers sous CDDU), Titre III (artistes interprètes), Titre IV (techniciens et ouvriers permanents). Sont exclus : la production audiovisuelle (IDCC 2642), le spectacle vivant.",
    plainText:
      "convention collective production cinématographique IDCC 3097 champ application films cinéma publicitaires Titre I II III IV",
    keywords: ["cinéma", "production cinématographique", "IDCC 3097", "film publicitaire", "Titre I", "Titre II"],
    legalTags: ["champ_application", "cinema", "publicite"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-contrats-titre-ii",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "Contrats — Titre II (techniciens CDDU)",
    article: "Titre II",
    chunkText:
      "Le Titre II de la CCN Cinéma (IDCC 3097) régit les techniciens et ouvriers embauchés en CDDU (Contrat à Durée Déterminée d'Usage). Ce statut correspond au régime des intermittents du spectacle. Le CDDU est le contrat standard pour les techniciens de tournage (caméra, son, lumière, régie, décor, etc.). La rémunération est établie à la semaine de tournage (base 39h). Les contrats sont renouvelés à chaque production.",
    plainText:
      "CDDU techniciens Titre II intermittent cinéma contrat usage semaine tournage",
    keywords: ["CDDU", "Titre II", "techniciens cinéma", "intermittent", "contrat d'usage"],
    legalTags: ["cddu", "intermittent", "cinema"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-duree-travail",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "Durée du travail — base 39 h semaine cinéma",
    article: "Titre II, Chap. II",
    chunkText:
      "En production cinématographique (IDCC 3097), la semaine de travail de référence est de 39 heures (5 jours × 7h48 ou 5 jours × 8h, selon les accords d'entreprise). Les 4 premières heures au-delà de 35h/sem (36e à 39e heure) sont des heures supplémentaires structurelles incluses dans le salaire minimum hebdomadaire. La journée de tournage type est de 10 heures (dont 8h effectives). Un contrat hebdomadaire cinéma couvre du lundi au dimanche.",
    plainText:
      "durée travail 39 heures semaine cinéma base journée 10 heures 8 heures effectives lundi dimanche",
    keywords: ["39 heures", "durée du travail", "semaine cinéma", "journée tournage", "base 39h"],
    legalTags: ["temps_travail"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-heures-sup",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "Heures supplémentaires — Titre II cinéma",
    article: "Titre II, Chap. II",
    chunkText:
      "Au-delà de 39 heures hebdomadaires (Titre II IDCC 3097), les heures supplémentaires sont majorées de 25% pour les heures 40 à 47, puis de 50% à partir de la 48e heure. À la journée, les heures au-delà de 8h effectives sont majorées à 25% pour les 2 premières heures, puis 50%. Le maximum hebdomadaire est fixé à 48h. Toute heure travaillée le 6e ou 7e jour de la semaine fait l'objet d'une majoration spécifique.",
    plainText:
      "heures supplémentaires 25% 50% au-delà 39 heures 47 heures cinéma Titre II",
    keywords: ["heures supplémentaires", "heures sup", "majoration", "dépassement horaire"],
    legalTags: ["heures_sup", "temps_travail"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-travail-nuit",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "Travail de nuit — majoration 25 %",
    article: "Titre II, Chap. II",
    chunkText:
      "En production cinématographique (IDCC 3097), les heures effectuées entre 22h00 et 5h00 (ou 7h00 selon les accords d'entreprise) sont majorées de 25% du taux horaire. Cette majoration est moins favorable qu'en audiovisuel (IDCC 2642 : +50%). Elle se cumule avec les majorations pour heures supplémentaires. Pour les films tournés en décalé nocturne, un accord spécifique peut prévoir une compensation en repos.",
    plainText:
      "travail de nuit majoration 25% cinéma heures nuit 22h 5h IDCC 3097",
    keywords: ["travail de nuit", "nuit", "majoration nuit", "25%", "heure de nuit", "cinéma"],
    legalTags: ["nuit", "temps_travail"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-salaires-2026",
    sourceId: SRC_ARR2026,
    idcc: "3097",
    sector: "cinema",
    title: "Salaires minima Titre II — applicables en 2026",
    article: "Arrêté du 6 janvier 2026",
    chunkText:
      "L'arrêté du 6 janvier 2026 étend les nouveaux minima conventionnels applicables au Titre II de la CCN Cinéma (IDCC 3097) depuis le 1er janvier 2026. Ces montants font suite à l'avenant du 23 janvier 2024 (+20 € sur tous les minima hebdomadaires), étendu par arrêté du 3 octobre 2024. Les salaires minima Titre II sont exprimés en salaire brut hebdomadaire (base 39h), couvrant 5 jours de tournage. Consultez les grilles détaillées sur lespi.org ou afar-fiction.com pour les montants par fonction.",
    plainText:
      "salaires minima 2026 Titre II cinéma semaine 39h arrêté janvier 2026 grille",
    keywords: ["salaire minimum", "minima 2026", "Titre II", "grille salaire", "cinéma", "39h"],
    legalTags: ["salaire", "grille_salaire", "cddu", "cinema"],
    sourceUrl: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053378949",
    effectiveDate: "2026-01-01",
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-salaires-avenant2024",
    sourceId: SRC_AV2024,
    idcc: "3097",
    sector: "cinema",
    title: "Salaires minima — avenant 23 janvier 2024 (+20 €)",
    article: "Avenant du 23 janvier 2024",
    chunkText:
      "L'avenant du 23 janvier 2024 à la CCN Cinéma (IDCC 3097), étendu par arrêté du 3 octobre 2024, augmente de +20 € tous les salaires minima hebdomadaires du Titre II (techniciens CDDU). Cette revalorisation uniforme s'applique à toutes les fonctions, quel que soit le groupe de classification. Avant cet avenant, les minima techniques variaient entre environ 1 000 € et 2 500 €/semaine selon le groupe. Source prioritaire : Légifrance.",
    plainText:
      "avenant 23 janvier 2024 plus 20 euros semaine minima Titre II techniciens CDDU cinéma revalorisation",
    keywords: ["+20 euros", "avenant 2024", "revalorisation", "minima hebdomadaires", "Titre II"],
    legalTags: ["salaire", "grille_salaire", "cddu"],
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000050329461",
    effectiveDate: "2024-03-01",
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-classifications-avenant2025",
    sourceId: SRC_AV2025,
    idcc: "3097",
    sector: "cinema",
    title: "Classifications Titre II — avenant 26 septembre 2025",
    article: "Avenant du 26 septembre 2025",
    chunkText:
      "L'avenant du 26 septembre 2025 à la CCN Cinéma (IDCC 3097), étendu par arrêté du 26 mars 2026 (JORF 3 avril 2026), révise les classifications des fonctions Titre II. Il est en vigueur depuis le 1er mai 2026. Cet avenant a été signé par les syndicats SPI, API, UPC côté employeurs, et CGT, SNTPCT côté salariés. Il redéfinit les critères d'affectation aux groupes de classification pour les techniciens de tournage, notamment les métiers caméra, son, lumière, décor et régie.",
    plainText:
      "avenant 2025 classifications Titre II cinéma révision groupes fonctions mai 2026 SPI API UPC CGT SNTPCT",
    keywords: ["classifications", "avenant 2025", "Titre II", "groupes", "fonctions", "mai 2026"],
    legalTags: ["classification", "cinema"],
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALIARTI000053497571",
    effectiveDate: "2026-05-01",
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-fonctions-camera",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "Fonctions caméra et image — classification Titre II cinéma",
    article: "Titre II, Annexe classification",
    chunkText:
      "En production cinématographique (IDCC 3097), les fonctions caméra/image du Titre II sont classées du plus haut au plus bas niveau de qualification : Groupe I/II — Chef opérateur (directeur de la photographie, DOP, chef op) ; Groupe II/III — Cadreur (opérateur de prises de vues, OPV, camera operator) ; Groupe III — 1er assistant caméra (1er AC, premier assistant opérateur, first AC, clapper loader) ; Groupe IV — 2e assistant caméra (2e AC, deuxième assistant opérateur, second AC) ; Groupe V — 3e assistant caméra (assistant OPV adjoint, loader) ; Groupe III/IV — Vidéo-assist / retour image (technicien retour image, DIT adjacent).",
    plainText:
      "fonctions caméra image classification Titre II cinéma chef opérateur DOP cadreur OPV 1er assistant 2e assistant 3e assistant retour image vidéo-assist DIT",
    keywords: [
      "chef opérateur", "directeur de la photographie", "DOP", "cadreur", "OPV",
      "1er assistant caméra", "premier assistant caméra", "1er AC", "first AC",
      "2e assistant caméra", "deuxième assistant caméra", "second AC",
      "3e assistant caméra", "troisième assistant caméra", "assistant OPV adjoint",
      "vidéo assist", "retour image", "DIT", "technicien retour image",
    ],
    legalTags: ["classification", "camera", "image", "cinema"],
    jobTitles: [
      "chef opérateur", "directeur de la photographie", "cadreur", "opérateur de prises de vues",
      "premier assistant caméra", "deuxième assistant caméra", "troisième assistant caméra",
      "vidéo assist", "technicien retour image", "DIT",
    ],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-salaires-camera",
    sourceId: "ccn-cinema-3097-salaires-afar",
    idcc: "3097",
    sector: "cinema",
    title: "Salaires caméra/image — grilles indicatives (AFAR, base 39h, 2024)",
    chunkText:
      "À titre indicatif (grilles AFAR / SPI, base 39h, après avenant janv 2024), les salaires hebdomadaires bruts des techniciens caméra cinéma Titre II sont approximativement : Cadreur (OPV) : ~1 837 €/semaine ; Chef opérateur (DOP) : négocié au-dessus du minimum, souvent au forfait ; 1er assistant caméra : ~1 400 €/semaine ; 2e assistant caméra : ~1 150 €/semaine. Ces montants sont des minimums conventionnels : l'employeur ne peut pas descendre en dessous. Vérifiez les grilles actualisées sur lespi.org ou afar-fiction.com.",
    plainText:
      "salaires caméra cinéma 1837 euros cadreur 1400 1er assistant 1150 2e assistant hebdomadaire grille AFAR SPI",
    keywords: [
      "salaire cadreur", "salaire assistant caméra", "1837", "1400", "1150",
      "grille salaire cinéma", "minima hebdomadaires",
    ],
    legalTags: ["salaire", "grille_salaire", "camera", "cinema"],
    jobTitles: ["cadreur", "premier assistant caméra", "deuxième assistant caméra"],
    salaryData: [
      {
        jobTitle: "Cadreur / Opérateur de prises de vues",
        sector: "cinema",
        idcc: "3097",
        amountGross: 1837,
        currency: "EUR",
        period: "week_39h",
        effectiveDate: "2024-03-01",
        notes: "Minimum indicatif après avenant 23 jan 2024 (+20€). Source AFAR. À vérifier sur lespi.org.",
      },
      {
        jobTitle: "Premier assistant caméra (1er AC)",
        sector: "cinema",
        idcc: "3097",
        amountGross: 1400,
        currency: "EUR",
        period: "week_39h",
        effectiveDate: "2024-03-01",
        notes: "Minimum indicatif Titre II. Source AFAR. À vérifier sur lespi.org.",
      },
      {
        jobTitle: "Deuxième assistant caméra (2e AC)",
        sector: "cinema",
        idcc: "3097",
        amountGross: 1150,
        currency: "EUR",
        period: "week_39h",
        effectiveDate: "2024-03-01",
        notes: "Minimum indicatif Titre II. Source AFAR. À vérifier sur lespi.org.",
      },
    ],
    sourceUrl: "https://www.afar-fiction.com/spip.php?article28=&lang=fr",
    effectiveDate: "2024-03-01",
    lastCheckedAt: CHECKED,
    extensionStatus: "inconnu",
  },
  {
    id: "3097-indemnites-repas-2026",
    sourceId: SRC_ARR2026,
    idcc: "3097",
    sector: "cinema",
    title: "Indemnités repas et casse-croûte 2026",
    chunkText:
      "En production cinématographique (IDCC 3097), les indemnités de repas au 1er janvier 2026 sont : indemnité repas = 18,19 € brut ; indemnité de casse-croûte (journée continue sans pause) = 7,39 € brut. L'indemnité repas est due lorsque le technicien n'est pas nourri par la production. Le casse-croûte est une indemnité complémentaire versée lors des tournages sans pause repas d'au moins 30 minutes (journée continue). Ces montants sont exonérés de charges sociales dans la limite URSSAF.",
    plainText:
      "indemnité repas 18.19 euros casse-croûte 7.39 euros 2026 cinéma journée continue sans pause",
    keywords: ["indemnité repas", "repas", "casse-croûte", "18,19", "7,39", "journée continue"],
    legalTags: ["repas", "indemnite"],
    salaryData: [
      {
        jobTitle: "Indemnité repas",
        sector: "cinema",
        idcc: "3097",
        amountGross: 18.19,
        currency: "EUR",
        period: "indemnite",
        effectiveDate: "2026-01-01",
        notes: "Indemnité repas IDCC 3097 au 1er janvier 2026",
      },
      {
        jobTitle: "Indemnité casse-croûte",
        sector: "cinema",
        idcc: "3097",
        amountGross: 7.39,
        currency: "EUR",
        period: "indemnite",
        effectiveDate: "2026-01-01",
        notes: "Indemnité casse-croûte (journée continue) IDCC 3097 au 1er janvier 2026",
      },
    ],
    sourceUrl: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053378949",
    effectiveDate: "2026-01-01",
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-vhss-prevention",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "VHSS — Prévention et harcèlement en production cinématographique",
    chunkText:
      "La CCN Cinéma (IDCC 3097) impose à l'employeur une obligation de prévention des violences, du harcèlement sexuel et des agissements sexistes (VHSS). Un référent VHSS doit être désigné sur chaque tournage. Les signalements doivent être traités confidentiellement. Les syndicats (SNTPCT, CGT Spectacle) et l'association Collectif 50/50 proposent des ressources et accompagnement. Aucun technicien ne peut être écarté ou sanctionné pour avoir signalé ou témoigné de faits de harcèlement.",
    plainText:
      "VHSS violences harcèlement sexuel agissements sexistes référent prévention cinéma signalement SNTPCT",
    keywords: ["VHSS", "harcèlement sexuel", "sexisme", "référent VHSS", "prévention", "cinéma"],
    legalTags: ["vhss", "prevention"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "3097-mineurs",
    sourceId: SRC,
    idcc: "3097",
    sector: "cinema",
    title: "Mineurs — autorisation de tournage (cinéma)",
    chunkText:
      "L'emploi de mineurs sur un tournage cinématographique (IDCC 3097) requiert une autorisation individuelle délivrée par le préfet du département du lieu de tournage. Cette autorisation est demandée par l'employeur au moins 8 jours avant le début du tournage. Les conditions : âge minimum 3 ans pour les scènes de jeu, présence permanente du représentant légal ou d'un tuteur agréé, repos obligatoires selon l'âge, interdiction de présence entre 22h et 7h pour les mineurs de moins de 16 ans. Un compte de caisse des congés est ouvert au nom de l'enfant.",
    plainText:
      "mineurs enfants tournage cinéma autorisation préfectorale tuteur 8 jours représentant légal 22h 7h",
    keywords: ["mineurs", "enfants", "autorisation préfectorale", "tuteur", "tournage cinéma"],
    legalTags: ["mineurs", "prevention"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
];
