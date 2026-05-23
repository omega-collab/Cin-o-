import type { FullShoot } from "@/lib/types/shoot";

export const MOCK_SHOOT: FullShoot = {
  date: "2025-07-17",
  projectTitle: "TROPIQUES CRIMINELS",
  series: "Saison 7 – Bloc 2",
  shootingDay: 34,
  totalDays: 38,
  location: "Plage Corps de Garde, 97228 Sainte-Luce",
  callTime: "08:30",
  mealTime: "12:30",
  wrapTime: "17:30",
  weather: "Soleil brumeux, 26°–32°C, vent Est 25 km/h",
  logeLocation: "103 ZAC Pont Café",
  canteenLocation: "Parking Tam-Tam Beach",
  sequences: [
    {
      id: "s1",
      time: "08:30",
      label: "Séq. 802 – Découverte du corps de Théo",
      location: "EXT. PLAGE CORPS DE GARDE – MATIN",
      cast: ["Mélissa", "Gaëlle", "Tahina"],
      script:
        "Aube grise sur la plage. Le vent soulève le sable. Mélissa marche d'un pas lent vers la silhouette allongée près du brise-lames.\n\nGaëlle la suit, talkie en main. Tahina cadre la scène à distance.\n\nMÉLISSA (à voix basse) : « C'est lui. C'est bien Théo. »\n\nGros plan sur le visage de Mélissa, le regard fixe. Travelling arrière qui révèle l'étendue de la plage déserte. Mouettes en fond sonore.",
    },
    {
      id: "s2",
      time: "10:45",
      label: "Séq. 808 – Fouille de la cabane du pêcheur",
      location: "EXT. CABANE PÊCHEUR – MATIN",
      cast: ["Mélissa", "Gaëlle"],
      script:
        "Mélissa et Gaëlle forcent la porte de la cabane. Intérieur sombre, odeur de poisson séché.\n\nElles ouvrent placards et tiroirs. Mélissa découvre un portefeuille avec une carte de club et des clés.\n\nGAËLLE : « Théo venait ici régulièrement, on dirait. »\nMÉLISSA : « Et il avait quelque chose à cacher. »\n\nCaméra épaule, lumière naturelle filtrant par les interstices des planches. Plan rapproché sur les objets découverts.",
    },
    {
      id: "s3",
      time: "13:30",
      label: "Séq. 815 – Discussion avec l'oncle de Théo",
      location: "EXT. TERRASSE – APRÈS-MIDI",
      cast: ["Mélissa", "Oncle Théo"],
      script:
        "Terrasse face à la mer. Paul Magnon, l'oncle de Théo, est assis face à Mélissa. Il fume lentement, le regard perdu sur l'horizon.\n\nMÉLISSA : « Quand l'avez-vous vu pour la dernière fois ? »\nPAUL : « Dimanche soir. Il devait passer me prendre lundi matin. Il n'est jamais venu. »\n\nLong silence. Paul écrase sa cigarette.\n\nPAUL (presque pour lui-même) : « Je lui avais dit de ne plus traîner avec ces gens-là. »\n\nPlan large sur la terrasse, puis gros plan sur les mains tremblantes de Paul. La caméra reste fixe pour laisser respirer le moment.",
    },
    {
      id: "s4",
      time: "15:00",
      label: "Séq. 816 – Mélissa part, Gaëlle reste",
      location: "EXT. PARKING PLAGE – APRÈS-MIDI",
      cast: ["Mélissa", "Gaëlle"],
      script:
        "Parking de la plage. Mélissa monte dans la voiture de service. Gaëlle reste appuyée contre une autre voiture, talkie à la main.\n\nMÉLISSA : « Tu m'appelles dès que tu as quelque chose sur la carte de club. »\nGAËLLE : « Compris. Roule prudemment. »\n\nMélissa démarre. Plan en contre-plongée sur Gaëlle qui regarde la voiture s'éloigner, puis sort un téléphone et compose un numéro.",
    },
    {
      id: "s5",
      time: "16:00",
      label: "Séq. 801DR – Plan drone",
      location: "EXT. VUE AÉRIENNE PLAGE – SOIR",
      notes: "Drone 16h00–17h30",
      script:
        "Vue aérienne au drone. La plage de Corps de Garde dans la lumière dorée du couchant.\n\nLe drone s'élève progressivement, révélant l'ensemble du décor : la cabane isolée, le parking, la silhouette des enquêteurs minuscule sur le sable.\n\nMouvement circulaire lent, puis arrêt suspendu au-dessus de la baie. Pas de dialogue. Musique d'ambiance à l'image.",
    },
  ],
  cast: [
    { id: "c1", name: "Mélissa", role: "Capitaine Mélissa Sainte-Rose", callTime: "08:00", logeLocation: "Loge A" },
    { id: "c2", name: "Gaëlle", role: "Lt Gaëlle Camara", callTime: "08:00", logeLocation: "Loge B" },
    { id: "c3", name: "Tahina", role: "Inès Roussel", callTime: "08:15" },
    { id: "c4", name: "Oncle Théo", role: "Paul Magnon", callTime: "13:00" },
  ],
  deptNotes: [
    { id: "d1", department: "Électro", content: "Groupe électro côté nord, 150 m du décor", priority: "info" },
    { id: "d2", department: "Régie", content: "Parking VL côté entrée principale, PL au fond à droite", priority: "info" },
    { id: "d3", department: "HMC", content: "Loges aux 103 ZAC Pont Café – prévoir 30 min trajet", priority: "warning" },
    { id: "d4", department: "Son", content: "Vent Est 25 km/h – prévoir protection micro", priority: "warning" },
  ],
  places: [
    { id: "p1", label: "Décor principal", description: "Plage Corps de Garde", distance: "Référence" },
    { id: "p2", label: "Parking VL", description: "Entrée principale plage", distance: "50 m" },
    { id: "p3", label: "Parking PL", description: "Côté nord, accès camions", distance: "80 m" },
    { id: "p4", label: "Cantine", description: "Parking Tam-Tam Beach", distance: "200 m" },
    { id: "p5", label: "HMC / Loges", description: "103 ZAC Pont Café", distance: "3 km" },
    { id: "p6", label: "Groupe électro", description: "Zone nord du décor", distance: "150 m" },
  ],
  alerts: [
    { id: "a1", severity: "warning", message: "Vent soutenu – risques sonores et sécurité drone", department: "Son" },
    { id: "a2", severity: "info", message: "Météo : soleil brumeux, crème solaire recommandée" },
    { id: "a3", severity: "critical", message: "Drone uniquement 16h–17h30 – zone réglementée" },
  ],
  nextDays: [
    { date: "2025-07-18", shootingDay: 35, location: "Commissariat Fort-de-France", callTime: "07:00" },
    { date: "2025-07-19", shootingDay: 36, location: "Appartement Mélissa, Le Lamentin", callTime: "07:30" },
  ],
  auditLog: [
    { id: "au1", timestamp: "2025-07-17T06:00:00Z", action: "Données démo chargées", source: "manual" },
  ],
  isPublished: false,
  uploadedDocs: [],
  extractionStatus: "idle",
  codesEnabled: false,
  deptCodes: {},
};
