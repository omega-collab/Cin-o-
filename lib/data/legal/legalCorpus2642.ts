import type { LegalDocumentChunk } from "./legalTypes";

const SRC = "ccn-pav-2642-legifrance";
const SRC_AV20 = "ccn-pav-2642-avenant-20-salaires-2025";
const SRC_AV19 = "ccn-pav-2642-avenant-19-juillet-2024";
const SRC_AV17 = "ccn-pav-2642-avenant-17-salaires-2024";
const URL_BASE = "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000018828041";
const CHECKED = "2026-05-21";

export const CHUNKS_2642: LegalDocumentChunk[] = [
  {
    id: "2642-champ-application",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Champ d'application — IDCC 2642",
    article: "Art. 1",
    chunkText:
      "La Convention Collective Nationale de la Production Audiovisuelle (IDCC 2642, brochure n° 3346) s'applique aux entreprises ayant pour activité principale la production d'œuvres audiovisuelles : fictions télévisées, téléfilms, séries, émissions de flux, documentaires, programmes d'animation, captations de spectacles, films publicitaires audiovisuels et vidéoclips. Sont exclus : le cinéma de long métrage (IDCC 3097), le spectacle vivant, la radio.",
    plainText:
      "convention collective production audiovisuelle IDCC 2642 champ application fiction télévisée téléfilm série flux documentaire animation captation film publicitaire vidéoclip",
    keywords: ["champ application", "fiction", "flux", "documentaire", "animation", "captation", "publicité", "audiovisuel"],
    legalTags: ["champ_application", "audiovisuel", "fiction", "flux", "documentaire", "animation", "publicite", "captation"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-contrats-cddu",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Contrats — CDDU (catégorie B)",
    article: "Titre III",
    chunkText:
      "La majorité des techniciens en production audiovisuelle sont embauchés en Contrat à Durée Déterminée d'Usage (CDDU), dit « contrat d'usage » ou « contrat intermittent ». Ce contrat est justifié par la nature temporaire inhérente aux productions audiovisuelles. Il n'y a pas de durée maximale légale pour un CDDU unique. La succession de CDDU avec le même employeur est autorisée dans ce secteur (art. L1242-2, 3° du Code du travail). La catégorie B désigne les techniciens sous CDDU ; la catégorie A désigne les permanents (CDI/CDD).",
    plainText:
      "CDDU contrat durée déterminée usage contrat intermittent catégorie B permanent CDI CDD technicien audiovisuel",
    keywords: ["CDDU", "contrat intermittent", "catégorie B", "catégorie A", "CDI", "CDD"],
    legalTags: ["cddu", "cdi", "cdd", "intermittent"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-duree-travail",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Durée du travail — base horaire",
    article: "Titre IV",
    chunkText:
      "La durée de travail de référence en production audiovisuelle est de 39 heures par semaine (35h + 4h structurelles). Pour les CDDU, la rémunération est calculée à la semaine ou à la journée selon le type de production. La journée de tournage est présumée de 10 heures (pause repas incluse), le travail effectif étant de 8 heures. Le décompte commence au premier appel et se termine après le débriefing ou rangement. La pause repas minimum est de 30 minutes non rémunérées.",
    plainText:
      "durée travail 39 heures semaine base horaire journée tournage 10 heures 8 heures pause repas décompte",
    keywords: ["39 heures", "durée du travail", "journée tournage", "temps travail", "pause repas"],
    legalTags: ["temps_travail"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-heures-sup",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Heures supplémentaires — majorations",
    article: "Titre IV",
    chunkText:
      "En production audiovisuelle (IDCC 2642), les heures effectuées au-delà de 8h de travail effectif par journée de tournage sont majorées. Les 4 premières heures supplémentaires journalières sont majorées de 25%, les suivantes de 50%. Pour les semaines : au-delà de 35h, les 4 premières heures sont à +25% (portées à 39h structurelles), les heures supplémentaires réelles au-delà de 39h sont majorées de 25% (jusqu'à 47h) puis 50% (au-delà de 47h). Le maximum hebdomadaire est de 48h.",
    plainText:
      "heures supplémentaires majoration 25% 50% journée semaine maximum 48 heures",
    keywords: ["heures supplémentaires", "heures sup", "majoration 25%", "majoration 50%", "dépassement horaire"],
    legalTags: ["heures_sup", "temps_travail"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-travail-nuit",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Travail de nuit — majoration 50 %",
    article: "Titre IV",
    chunkText:
      "En production audiovisuelle (IDCC 2642), les heures de travail effectuées entre 22h00 et 7h00 sont majorées de 50% du taux horaire. Cette majoration se cumule avec les majorations pour heures supplémentaires et journée continue. Elle est plus favorable qu'en cinéma (IDCC 3097 : +25%). Pour les tournages de nuit, une pause obligatoire de 20 minutes doit être accordée toutes les 6 heures.",
    plainText:
      "travail de nuit majoration 50% heures nuit 22h 7h audiovisuel",
    keywords: ["travail de nuit", "nuit", "majoration nuit", "50%", "heure de nuit"],
    legalTags: ["nuit", "temps_travail"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-repos",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Repos — amplitude et repos quotidien",
    article: "Titre IV",
    chunkText:
      "En production audiovisuelle, le repos minimal entre deux journées de travail est de 11 heures consécutives. L'amplitude maximale journalière (du premier appel au dernier débriefing) est de 13 heures. En cas de dépassement d'amplitude, une majoration de 50% est due sur les heures dépassant 13h. Le repos hebdomadaire minimal est de 35 heures consécutives (24h légales + 11h quotidiennes). Le dimanche et jours fériés peuvent être travaillés avec majoration conventionnelle.",
    plainText:
      "repos journalier 11 heures amplitude 13 heures repos hebdomadaire 35 heures dimanche fériés",
    keywords: ["repos", "amplitude", "repos journalier", "repos hebdomadaire", "dimanche"],
    legalTags: ["repos", "temps_travail"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-salaires-avenant20",
    sourceId: SRC_AV20,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Salaires minima — avenant n° 20 (1er janvier 2025)",
    article: "Avenant n° 20 du 29 novembre 2024",
    chunkText:
      "L'avenant n° 20 du 29 novembre 2024 à la CCN Production Audiovisuelle (IDCC 2642) revalorise les salaires minima au 1er janvier 2025 : +1,5% pour les catégories A (permanents) et B (CDDU). Le plancher mensuel est fixé à 1 828,83 €/mois brut (cat B CDDU). À partir du 1er juillet 2025 : +2,2% pour les CDDU rémunérés ≤ 1 100 €/semaine ; +1% pour les CDDU rémunérés au-delà de 1 100 €/semaine. Cet avenant est étendu par arrêté ministériel.",
    plainText:
      "avenant 20 salaires minima 2025 1828.83 euros mois plancher 1er janvier juillet CDDU catégorie B audiovisuel",
    keywords: ["salaire minimum", "minimum conventionnel", "plancher", "1828.83", "avenant 20", "revalorisation 2025"],
    legalTags: ["salaire", "grille_salaire", "cddu"],
    salaryData: [
      {
        jobTitle: "Plancher mensuel catégorie B CDDU",
        sector: "audiovisuel",
        idcc: "2642",
        amountGross: 1828.83,
        currency: "EUR",
        period: "month_39h",
        effectiveDate: "2025-01-01",
        notes: "Plancher mensuel brut après revalorisation +1,5% au 1er janvier 2025 (avenant n°20)",
      },
    ],
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000051379535",
    effectiveDate: "2025-01-01",
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-fonctions-fiction-flux",
    sourceId: SRC_AV19,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Fonctions et classifications — fiction et flux (avenant n° 19)",
    article: "Avenant n° 19 du 8 juillet 2024",
    chunkText:
      "L'avenant n° 19 du 8 juillet 2024 (IDCC 2642) définit et distingue deux genres : la fiction (téléfilms, séries) et le flux (émissions, magazines, divertissements). Il révise les classifications des fonctions techniques de rang I à VI propres à ces genres. Les fonctions caméra/image sont classées selon leur niveau de responsabilité : le chef opérateur / directeur de la photographie au sommet, suivi du cadreur, du 1er assistant caméra, du 2e assistant caméra, du vidéo-assist / retour image. Chaque fonction a un minima hebdomadaire propre à son rang de classification.",
    plainText:
      "fonctions fiction flux classifications rangs caméra image chef opérateur DOP cadreur assistant caméra retour image vidéo-assist",
    keywords: ["fiction", "flux", "classification", "caméra", "chef opérateur", "cadreur", "assistant caméra", "vidéo-assist", "retour image"],
    legalTags: ["classification", "camera", "image", "fiction", "flux", "audiovisuel"],
    jobTitles: [
      "chef opérateur", "directeur de la photographie", "cadreur", "opérateur de prises de vues",
      "premier assistant caméra", "deuxième assistant caméra", "troisième assistant caméra",
      "vidéo assist", "technicien retour image",
    ],
    sourceUrl: "https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000050219954",
    effectiveDate: "2024-07-01",
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-indemnites-repas",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Indemnités repas et casse-croûte",
    chunkText:
      "En production audiovisuelle (IDCC 2642), une indemnité repas est due lorsque le technicien n'est pas pris en charge par la production. Elle couvre le déjeuner et le dîner. Une indemnité de casse-croûte est due en cas de journée continue (sans pause repas ≥ 30 min). Les montants exacts sont définis par annexe et revalorisés chaque année. Ces indemnités ne sont pas soumises à cotisations sociales dans la limite fixée par l'URSSAF.",
    plainText:
      "indemnité repas casse-croûte déjeuner dîner journée continue défraiement repas",
    keywords: ["indemnité repas", "repas", "casse-croûte", "défraiement", "panier repas"],
    legalTags: ["repas", "indemnite"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-transport-deplacement",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Frais de transport et déplacements",
    chunkText:
      "En production audiovisuelle, les déplacements professionnels sont à la charge de l'employeur. Le transport entre le lieu de résidence et le lieu de tournage est remboursé selon le barème conventionnel si la distance dépasse un certain seuil (généralement 50 km ou hors Île-de-France). En déplacement hors domicile, les frais d'hébergement sont pris en charge. Une indemnité kilométrique est due si le technicien utilise son véhicule personnel sur demande de la production.",
    plainText:
      "transport déplacement remboursement kilométrique hébergement hors domicile distance seuil",
    keywords: ["transport", "déplacement", "frais kilométriques", "hébergement", "hors domicile"],
    legalTags: ["transport", "deplacement", "indemnite"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-vhss-prevention",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "VHSS — Violences, harcèlement, sexisme et discrimination",
    chunkText:
      "La CCN Production Audiovisuelle (IDCC 2642) intègre les obligations légales relatives à la prévention des violences, du harcèlement sexuel, du sexisme et des discriminations (VHSS). L'employeur est tenu de désigner un référent VHSS sur chaque tournage d'une certaine durée. Toute personne victime ou témoin peut signaler les faits sans craindre de représailles. Des procédures de traitement des signalements doivent être formalisées. Les syndicats (SPIAC-CGT, SNAP-CGT) disposent de cellules d'écoute.",
    plainText:
      "VHSS violences harcèlement sexuel sexisme discrimination référent prévention signalement tournage",
    keywords: ["VHSS", "harcèlement sexuel", "sexisme", "discrimination", "référent VHSS", "prévention"],
    legalTags: ["vhss", "prevention"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-mineurs",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Mineurs — conditions de travail",
    chunkText:
      "L'emploi de mineurs dans les productions audiovisuelles est soumis à une réglementation stricte. Une autorisation préfectorale individuelle est obligatoire pour chaque enfant. Des règles strictes s'appliquent : durée de présence limitée selon l'âge (6h/jour pour les 3-6 ans, 8h/jour pour les 6-12 ans), présence obligatoire d'un représentant légal ou tuteur désigné, mise à disposition d'un espace de repos, contrôle médical. Un compte bloqué au nom de l'enfant reçoit le salaire jusqu'à sa majorité.",
    plainText:
      "mineurs enfants autorisation préfectorale tuteur repos médical compte bloqué âge durée",
    keywords: ["mineurs", "enfants", "autorisation préfectorale", "tuteur", "compte bloqué"],
    legalTags: ["mineurs", "prevention"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-prevoyance-sante",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "Prévoyance et santé — AUDIENS",
    chunkText:
      "La prévoyance et la complémentaire santé des techniciens audiovisuels sont gérées par AUDIENS (groupe de protection sociale des secteurs médias, culture, communication). Les cotisations sont réparties entre l'employeur et le salarié selon les accords de branche. AUDIENS couvre : décès, invalidité, incapacité temporaire, et offre une mutuelle adaptée aux intermittents (portabilité de droits entre les contrats). La retraite complémentaire passe par l'AGIRC-ARRCO via AUDIENS.",
    plainText:
      "AUDIENS prévoyance santé mutuelle retraite intermittent cotisations complémentaire",
    keywords: ["prévoyance", "santé", "AUDIENS", "mutuelle", "retraite", "complémentaire santé"],
    legalTags: ["prevoyance", "sante", "intermittent"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
  {
    id: "2642-dom",
    sourceId: SRC,
    idcc: "2642",
    sector: "audiovisuel",
    title: "DOM — Outre-mer, dispositions spécifiques",
    chunkText:
      "Des dispositions spécifiques s'appliquent aux tournages réalisés dans les Départements d'Outre-Mer (DOM : Guadeloupe, Martinique, Guyane, Réunion, Mayotte) dans le cadre de la CCN Production Audiovisuelle (IDCC 2642). Les indemnités de grand déplacement, les frais de voyage et les conditions de séjour font l'objet d'annexes particulières. Le tournage de Tropiques Criminels en Martinique relève de ces dispositions spécifiques.",
    plainText:
      "DOM outre-mer Martinique Guadeloupe Guyane Réunion grand déplacement Tropiques Criminels",
    keywords: ["DOM", "outre-mer", "Martinique", "grand déplacement", "Tropiques Criminels"],
    legalTags: ["dom", "deplacement", "audiovisuel"],
    sourceUrl: URL_BASE,
    lastCheckedAt: CHECKED,
    extensionStatus: "etendu",
  },
];
