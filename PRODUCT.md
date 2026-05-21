# CinéO — Product Context

> Référence produit pour tous les agents IA travaillant sur CinéO.
> Ne pas modifier sauf après validation du responsable produit.

---

## Identité

**Nom** : CinéO
**Register** : product (l'UI sert un outil métier — la conception est au service de la fonction)
**Version** : 1.0 — Mai 2026
**Stack** : Next.js 14 · TypeScript · Tailwind CSS · Supabase (eu-west-3) · Zustand · lucide-react · Mistral OCR

---

## Production cible

| Champ              | Valeur                                         |
|--------------------|------------------------------------------------|
| Titre              | Films « Tropiques Criminels » Saison 8         |
| Société            | FEDERATION STUDIO France                       |
| SIRET              | 922 429 097 00012                              |
| Adresse            | 10 rue Royale, 75008 Paris                     |
| Lieu de tournage   | Martinique (Caraïbes)                          |
| Durée              | ~42 jours de tournage                          |
| Contact admin      | lydia.bareille@orange.fr                       |

---

## Utilisateurs

### Persona principal

**L'intermittent du spectacle** — technicien de tournage (caméra, lumière, son, régie, déco, HMC) qui :
- utilise l'app sur mobile en plein soleil caraïbéen ou sur set la nuit
- a les mains occupées, consulte vite, une main suffit
- doit saisir ses heures, frais, noter des alertes matériel
- change de production toutes les semaines/mois
- connaît les conventions collectives (IDCC 2642 ou 3097) mais ne les maîtrise pas toutes

### Persona secondaire

**Le chef de département** — supervise son équipe, valide les feuilles de service, vérifie les alertes.

### Persona tertiaire

**La direction de production** — valide les notes de frais, consulte les feuilles de tournage.

---

## Conventions collectives

| Convention | IDCC  | Secteur                          | Spécificités                                  |
|------------|-------|----------------------------------|-----------------------------------------------|
| Audiovisuel | 2642 | Production audiovisuelle (TV)    | Nuit +50%, salaire plancher 1 828,83€/mois   |
| Cinéma      | 3097 | Production cinématographique     | Nuit +25%, durée de référence 39h/sem        |

L'utilisateur choisit sa convention dans les réglages (`ConventionType = "cinema" | "audiovisuel"`).

---

## Fonctionnalités — État au 21 mai 2026

### Auth & Onboarding
- Connexion / inscription Supabase Auth
- Onboarding : sélection département + poste (12 départements)
- Profil persisté dans `useUserStore` (Zustand persist)
- Avatars prédéfinis sélectionnables

### Feuille de tournage (`/`) — `useShootStore`
- Séquences du jour : scène, lieu (INT/EXT), casting, notes techniques
- Alertes équipe : niveaux critical/warning/info
- Météo et conditions de tournage
- Documents : upload et OCR via Mistral pour extraction automatique
- Pistes audio
- Import PDF/image → extraction automatique (ExtractionResult)

### Heures intermittent (`/heures`) — Tab "Heures"
- Saisie journalière : heure de début/fin, pause repas optionnelle
- Calcul automatique : heures normales, heures sup, heures de nuit, heures anticipées
- Coefficient journalier calculé selon la convention choisie
- Aperçu salaire (optionnel, masquable)
- Historique persisté dans `useIntermittentStore`

### Frais (`/heures`) — Tab "Frais"
- **Scanner ticket** : photo ticket + photo facture (optionnel) → OCR Mistral → extraction 4 champs
  - Date, Fournisseur (nom du commerce), Nature de la dépense, Montant TTC
  - Vérification plaque d'immatriculation : blocage si absente (saisie manuelle ou bypass "non-véhicule")
- **Saisie manuelle** : formulaire ExpenseForm
- Persistence Supabase : table `frais_entries`, RLS user_id = auth.uid()
- Onglet "Vérifier" : ExpenseBot avec contrôle de cohérence TVA/flags
- Onglet "Exporter" : ExpenseExport
- **Matrice note de frais** (`useMatriceStore` + `useFraisEntries`) :
  - Source de vérité Supabase
  - Colonnes : Date / Fournisseur / Nature / TTC (pas de TVA/HT — géré par le tableur prod)
  - Édition inline et suppression individuelle (RLS)
  - Contrôle de cohérence avant PDF (champs vides, montants nuls)
  - Export CSV + impression PDF
  - Téléchargement matrice Excel originale (`MATRICE NOTE de FRAIS LB.xls`)

### Info juridique (`/heures`) — Tab "Info"
- Moteur de recherche sur corpus IDCC 2642 + 3097 (27 chunks)
- Expansion de synonymes, scoring multi-champ
- Thèmes : contrats CDDU, durée du travail, majorations, salaires minima, métiers caméra, VHSS, mineurs
- Données salariales structurées : cadreur, 1er/2e/3e assistant caméra
- Badge convention dynamique (IDCC 2642 violet / IDCC 3097 cyan)
- Accordéons par catégorie, cartes expandables

### Calendrier (`/calendrier`)
- Vue mensuelle des jours de tournage
- Filtres par département

### Cantine (`/cantine`) — `useCanteenStore`
- Gestion des repas d'équipe
- Comptage par catégorie

### Départements (`/departments`)
- Vue par département avec membres et alertes
- Sous-pages `/departments/[slug]` et `/departments/[slug]/history`

### Documents (`/documents`)
- Upload de fichiers de production
- Visualisation et organisation

### Historique (`/history`)
- `useHistoryStore`
- Journal des actions

### Paramètres
- Thème (dark/light), taille police, langue (fr/en)
- Fond écran connexion (6 variantes photographiques)

---

## Architecture technique

### Supabase (eu-west-3 — projet `nrosyhsufmuuexvmnfvj`)

| Table           | RLS                                  | Usage                            |
|-----------------|--------------------------------------|----------------------------------|
| `profiles`      | owner = user_id                      | Profils utilisateurs             |
| `projects`      | owner ou membre                      | Projets de production            |
| `project_members` | owner/admin/member               | Membres du projet                |
| `project_data`  | membres du projet                    | Données feuille de tournage      |
| `frais_entries` | user_id = auth.uid() (select/insert/update/delete) | Notes de frais |

### API Routes (Edge)
- `/api/extract-frais` — OCR ticket + facture → 4 champs + plaque immat (Mistral)
- `/api/ocr` — OCR générique
- `/api/extract-stock` — extraction inventaire matériel

### Stores Zustand (localStorage persist)
- `cin-o-user` — profil utilisateur local
- `cin-o-intermittent` — jours de travail + réglages convention
- `cin-o-expense-v1` — dépenses locales (compliance check)
- `cin-o-matrice-v1` — en-tête relevé (nom, numéro, date) + méta scans
- `cin-o-shoot` — feuille de tournage
- `cin-o-daily` — données journalières
- `cin-o-history` — historique local
- `cin-o-settings` — paramètres UI

### Bibliothèques légales (lib/data/legal/)
- `legalTypes.ts` — `LegalDocumentChunk`, `SalaryData`, `LegalTag`, synonymes
- `legalSources.ts` — 14 sources IDCC 2642/3097 avec attribution
- `legalCorpus2642.ts` — 14 chunks IDCC 2642
- `legalCorpus3097.ts` — 13 chunks IDCC 3097
- `legalSearch.ts` — moteur de recherche avec scoring

---

## Ton et voix

- **Langue** : 100% français dans l'UI (labels, messages, erreurs)
- **Ton** : direct, professionnel, terrain — pas de jargon tech, pas de condescendance
- **Urgence** : en tournage, chaque seconde compte — messages courts, actions claires
- **Anti-patterns copy** : "Veuillez...", "S'il vous plaît...", "Votre...", formulations administratives
- Confirmation courte : "Enregistré" pas "Vos données ont bien été sauvegardées avec succès"

---

## Anti-références design

- SaaS cream (fond blanc + bleu ciel + cards arrondies = outil RH générique)
- Dashboard analytics avec métriques hero (big number + gradient)
- Glassmorphism décoratif (blur sur blur)
- Neon cyberpunk (fond noir + texte vert/magenta)
- Material Design flat (Google Workspace)

---

## Déploiement

- **Hébergeur** : Netlify
- **URL prod** : https://celebrated-nasturtium-de0545.netlify.app
- **Branche principale** : `main`
- **Branche développement** : `claude/setflow-setup-deploy-KNKki`
- **PR active** : #14

---

*CinéO Product Context v1.0 — 21 mai 2026*
