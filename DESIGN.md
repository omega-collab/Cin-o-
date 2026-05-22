# CinéO — Design System v1.0

> Référence unique pour tout développement UI sur CinéO. Chaque décision ici est définitive.
> Stack : Next.js 14 · TypeScript · Tailwind CSS · lucide-react · Supabase
> Version : v0.2.0 — 22 mai 2026

---

## 1. Principes directeurs

1. **Lisibilité terrain** — l'app s'utilise en plein soleil caraïbéen ou sur set la nuit. Contraste fort, surfaces sombres, texte grand.
2. **Densité maîtrisée** — technicien pressé = information visible au premier coup d'œil. Pas de scrolling pour trouver l'essentiel.
3. **Outil, pas vitrine** — sobre et fonctionnel d'abord. Chaque décoration doit justifier son pixel.
4. **Une main suffit** — cibles tactiles ≥ 44×44px, interactions principales dans le pouce inférieur.
5. **Zéro emoji dans le code** — `lucide-react` uniquement pour les icônes, SVG custom pour le logo.

---

## 2. Couleurs

### Palette principale

| Token Tailwind    | Hex       | OKLCH approx.           | Usage                                      |
|-------------------|-----------|-------------------------|--------------------------------------------|
| `appBg`           | `#071018` | `oklch(0.10 0.02 235)`  | Fond global, jamais remplacé               |
| `surface`         | `#0D1622` | `oklch(0.14 0.025 230)` | Cards, panneaux, formulaires               |
| `surfaceElevated` | `#111C29` | `oklch(0.17 0.028 228)` | Dropdowns, tooltips, modals                |
| `cyan`            | `#00E0D0` | `oklch(0.82 0.14 186)`  | Accent unique — bouton primaire, focus, actif |
| `cyanSoft`        | `rgba(0,224,208,0.16)` | —           | Fond actif nav, badges sélectionnés        |
| `textPrimary`     | `#F5F7FA` | `oklch(0.97 0.005 230)` | Titres, labels importants                  |
| `textSoft`        | `#C9D2E3` | `oklch(0.85 0.02 230)`  | Corps de texte, descriptions               |
| `muted`           | `#9FB3C8` | `oklch(0.73 0.03 225)`  | Placeholders, métadonnées, secondaires     |
| `stroke`          | `rgba(255,255,255,0.10)` | —          | Bordures de cartes et inputs               |

### Palette sémantique

| Token          | Hex       | Usage                                    |
|----------------|-----------|------------------------------------------|
| `success`      | `#22C55E` | Confirmation, badge "Terminé", checkmark |
| `successSoft`  | `rgba(34,197,94,0.15)` | Fond badge success         |
| `warning`      | `#F5A623` | Alerte modérée, badge "En cours"         |
| `warningSoft`  | `rgba(245,166,35,0.15)` | Fond badge warning         |
| `danger`       | `#EF4444` | Erreur, alerte critique, destructif      |
| `dangerSoft`   | `rgba(239,68,68,0.15)` | Fond badge danger           |
| `info`         | `#3B82F6` | Information, toast info                  |
| `infoSoft`     | `rgba(59,130,246,0.15)` | Fond badge info            |
| `night`        | `#A855F7` | Heures de nuit (badge uniquement)        |
| `nightSoft`    | `rgba(168,85,247,0.15)` | Fond badge nuit            |

> **Tokens legacy supprimés du code** : `redSoft` → `danger`, `orangeSoft` → `warning`, `blueSoft` → `info`, `violetSoft` → `night`. Migration complète en v0.2.0. Les tokens legacy restent dans `tailwind.config.ts` pour compat descendante mais **aucune nouvelle occurrence n'est autorisée**.

### Règles impératives

- **Jamais `#000` ou `#fff` purs.** Toute surface noire est tintée bleu (`#071018`). Tout blanc est cassé (`#F5F7FA`).
- L'accent cyan **ne dépasse jamais 10% de la surface visible** (hors écran login hero).
- Contraste WCAG : 4.5:1 minimum pour le corps de texte, 3:1 pour les grands titres et icônes.
- La couleur seule ne transmet jamais une information critique — toujours icône + couleur.

---

## 3. Typographie

### Famille

**Primaire** : [Satoshi](https://www.fontshare.com/fonts/satoshi) (Bold 700, Medium 500, Regular 400)
**Monospace** : [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (Regular 400)
**Fallback système** : `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif`

Import dans `app/layout.tsx` :
```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap');
```

### Échelle (ratio 1.25)

| Niveau    | Size   | Line-height | Weight | Tracking | Usage                                     |
|-----------|--------|-------------|--------|----------|-------------------------------------------|
| `display` | 48px   | 56px        | 700    | -0.5%    | Logo CinéO sur l'écran login uniquement   |
| `h1`      | 32px   | 40px        | 700    | 0%       | Titre de page majeur                      |
| `h2`      | 24px   | 32px        | 500    | 0%       | Sous-titre de section                     |
| `h3`      | 20px   | 28px        | 500    | 0%       | Titre de carte, d'onglet                  |
| `body-lg` | 16px   | 24px        | 400    | 0%       | Corps principal, labels de formulaire     |
| `body`    | 14px   | 20px        | 400    | 0%       | Texte courant, listes                     |
| `caption` | 12px   | 16px        | 400    | 0%       | Métadonnées, timestamps, hints            |
| `mono`    | 12px   | 16px        | 400    | 0%       | Codes, Roll/Scene/Take, codes invitation  |

### Règles

- **Tabular nums** sur tous les chiffres d'horaires, durées, montants, codes : `font-variant-numeric: tabular-nums`
- Longueur de ligne corps de texte : **65–72 caractères max** (`max-w-prose` ou `max-w-lg`)
- **Pas de `text-gradient`** sur les titres fonctionnels — blanc plein uniquement.

---

## 4. Espacement

Base unit : **4px**. Toutes les valeurs d'espacement sont des multiples de 4.

| Tailwind   | px  | Usage typique                          |
|------------|-----|----------------------------------------|
| `space-1`  | 4px  | Gap icône/texte, padding badge        |
| `space-2`  | 8px  | Padding interne chip, espace inline   |
| `space-3`  | 12px | Padding input, gap nav items          |
| `space-4`  | 16px | Padding card compact, gap sections    |
| `space-5`  | 20px | Padding card standard                 |
| `space-6`  | 24px | Padding page mobile, gap vertical     |
| `space-8`  | 32px | Espacement entre sections majeures    |
| `space-12` | 48px | Marges hero, safe area buffer         |

**Cibles tactiles** : minimum `44×44px` — appliquer `min-h-[44px] min-w-[44px]` sur tout élément interactif.

---

## 5. Border radius

| Token Tailwind    | Valeur | Usage                                      |
|-------------------|--------|--------------------------------------------|
| `rounded-sm`      | 4px    | Badges inline, chips                       |
| `rounded-md`      | 6px    | Icônes avec fond                           |
| `rounded-lg`      | 8px    | Inputs, small cards                        |
| `rounded-xl`      | 12px   | Boutons, la plupart des composants         |
| `rounded-2xl`     | 16px   | Cards standards, modals                    |
| `rounded-app`     | 26px   | Containers principaux, hero cards          |
| `rounded-full`    | 999px  | Avatars, toggles, pills                    |

---

## 6. Élévation

| Niveau | Token CSS        | Surface                  | Box-shadow                                   | Backdrop-blur |
|--------|------------------|--------------------------|----------------------------------------------|---------------|
| 0      | `surface`        | `#0D1622`                | none                                         | none          |
| 1      | `glass-card`     | gradient `rgba(255,255,255,0.075→0.035)` + border | `0 18px 60px rgba(0,0,0,0.20)` | `blur(18px)` |
| 2      | `glass-card-strong` | gradient `rgba(255,255,255,0.105→0.04)` | `0 18px 60px rgba(0,0,0,0.26)` | `blur(20px)` |
| 3      | overlay          | `rgba(7,16,24,0.85)`     | `0 32px 80px rgba(0,0,0,0.50)`               | `blur(24px)`  |

**Règle** : les cartes niveau 1 (`glass-card`) ne contiennent **jamais** d'autres `glass-card`. Une seule surface par niveau de profondeur.

---

## 7. Iconographie — Suppression totale des emojis

**Système unique : `lucide-react`**
- Stroke width : `2` (défaut Lucide)
- Tailles canoniques : `w-4 h-4` (16px), `w-5 h-5` (20px), `w-6 h-6` (24px)
- Couleur : toujours héritée (`currentColor`), jamais hardcodée

### Mapping emoji → Lucide

| Contexte                  | Emoji retiré | Composant Lucide          | Import                    |
|---------------------------|--------------|---------------------------|---------------------------|
| Logo (nav, header)        | 🎬           | SVG custom `<CineoLogo />` | voir section 8            |
| Page Aujourd'hui          | 🎬           | `<Clapperboard />`        | `lucide-react`            |
| Alerte critique           | 🚨           | `<TriangleAlert />`       | `lucide-react`            |
| Alerte warning            | ⚠️           | `<AlertCircle />`         | `lucide-react`            |
| Repas / Cantine           | 🍽            | `<UtensilsCrossed />`     | `lucide-react`            |
| Café / Pause              | ☕            | `<Coffee />`              | `lucide-react`            |
| Calendrier                | 📅           | `<CalendarDays />`        | `lucide-react`            |
| Soleil / Beau temps       | ☀️           | `<Sun />`                 | `lucide-react`            |
| Nuage / Couvert           | ☁️           | `<Cloud />`               | `lucide-react`            |
| Pluie                     | 🌧️           | `<CloudRain />`           | `lucide-react`            |
| Vent                      | 💨           | `<Wind />`                | `lucide-react`            |
| Chaleur / Chaud           | 🌡️           | `<Thermometer />`         | `lucide-react`            |
| Localisation / Lieu       | 📍           | `<MapPin />`              | `lucide-react`            |
| Équipe / Membres          | 👥           | `<Users />`               | `lucide-react`            |
| Utilisateur               | 👤           | `<User />`                | `lucide-react`            |
| Département Caméra        | 🎥           | `<Film />`                | `lucide-react`            |
| Département Lumière       | 💡           | `<Lightbulb />`           | `lucide-react`            |
| Département Son           | 🎙️           | `<Mic />`                 | `lucide-react`            |
| Département Déco          | 🪑           | `<Armchair />`            | `lucide-react`            |
| Département Costume       | 👗           | `<Shirt />`               | `lucide-react`            |
| Département Maquillage    | 💄           | `<Palette />`             | `lucide-react`            |
| Département Régie         | 📋           | `<ClipboardList />`       | `lucide-react`            |
| Département Production    | 🎬           | `<Clapperboard />`        | `lucide-react`            |
| Stock / Inventaire        | 📦           | `<Package />`             | `lucide-react`            |
| Stock faible              | ⚠️           | `<PackageOpen />`         | `lucide-react`            |
| Rupture stock             | ❌            | `<PackageX />`            | `lucide-react`            |
| Photo / Image             | 📸           | `<Camera />`              | `lucide-react`            |
| Document / Feuille        | 📄           | `<FileText />`            | `lucide-react`            |
| Téléchargement            | ⬇️           | `<Download />`            | `lucide-react`            |
| Upload / Import           | ⬆️           | `<Upload />`              | `lucide-react`            |
| Partage                   | 📤           | `<Share2 />`              | `lucide-react`            |
| Notification / Cloche     | 🔔           | `<Bell />`                | `lucide-react`            |
| Paramètres / Config       | ⚙️           | `<Settings />`            | `lucide-react`            |
| Modifier                  | ✏️           | `<PenLine />`             | `lucide-react`            |
| Supprimer                 | 🗑️           | `<Trash2 />`              | `lucide-react`            |
| Fermer / Annuler          | ❌            | `<X />`                   | `lucide-react`            |
| Valider / OK              | ✅            | `<Check />`               | `lucide-react`            |
| Ajouter                   | ➕            | `<Plus />`                | `lucide-react`            |
| Chercher                  | 🔍           | `<Search />`              | `lucide-react`            |
| Filtrer                   | 🔽           | `<Filter />`              | `lucide-react`            |
| Horaire / Horloge         | 🕐           | `<Clock />`               | `lucide-react`            |
| Timer / Durée             | ⏱️           | `<Timer />`               | `lucide-react`            |
| Code invitation           | #️⃣           | `<Hash />`                | `lucide-react`            |
| Copier                    | 📋           | `<Copy />`                | `lucide-react`            |
| Lien / URL                | 🔗           | `<Link />`                | `lucide-react`            |
| Déconnexion               | 🚪           | `<LogOut />`              | `lucide-react`            |
| Juridique / Contrat       | ⚖️           | `<Scale />`               | `lucide-react`            |
| Euros / Salaire           | 💶           | `<Euro />`                | `lucide-react`            |
| Barème / Tableau          | 📊           | `<BarChart2 />`           | `lucide-react`            |
| Info / Aide               | ℹ️           | `<Info />`                | `lucide-react`            |
| Question / FAQ            | ❓            | `<HelpCircle />`          | `lucide-react`            |
| Historique                | 📜           | `<History />`             | `lucide-react`            |
| Sync / Mise à jour        | 🔄           | `<RefreshCw />`           | `lucide-react`            |
| Verrouillé                | 🔒           | `<Lock />`                | `lucide-react`            |
| Section ouverte           | ▼            | `<ChevronDown />`         | `lucide-react`            |
| Section fermée            | ▶            | `<ChevronRight />`        | `lucide-react`            |

---

## 8. Logo CinéO — Assets officiels

### Identité visuelle

Le logo CinéO est constitué d'un anneau chrome brossé (argent/acier) formant un "C" ouvert, encadrant un objectif de caméra à verre bleu profond avec reflet cyan. Le wordmark associe "CinéO" en blanc, le "O" étant remplacé par cet objectif.

### Fichiers officiels (à placer dans `public/`)

| Fichier                  | Dimensions    | Usage                                          |
|--------------------------|---------------|------------------------------------------------|
| `public/auth-bg.jpg`     | 844×1900 px   | Fond écran de connexion (scène cinématographique) |
| `public/logo-wordmark.png` | 1280×360 px  | Sidebar desktop, header mobile                 |
| `public/icon.png`        | 1024×1024 px  | App icon iOS, favicon source, og:image         |

> **Note** : `logo-wordmark.png` et `icon.png` sont les assets officiels fournis. Idéalement en PNG transparent pour les variantes claires. Le fond recommandé est `#071018`.

### Utilisation dans le code

```tsx
// Sidebar desktop / Header
<img src="/logo-wordmark.png" alt="CinéO" style={{ height: 28 }} className="object-contain" />

// Favicon dans app/layout.tsx
export const metadata = {
  icons: { icon: "/icon.png", apple: "/icon.png" },
};
```

### Variantes et contextes

| Contexte                      | Asset                      | Taille affichée |
|-------------------------------|----------------------------|-----------------|
| Sidebar desktop (header)      | `logo-wordmark.png`        | h-7 (28px)      |
| Header mobile                 | `logo-wordmark.png`        | h-6 (24px)      |
| Écran connexion               | intégré dans `auth-bg.jpg` | —               |
| Favicon / PWA icon            | `icon.png`                 | 32–180px        |
| Onboarding / splash           | `logo-wordmark.png`        | h-10 (40px)     |

### Règles d'usage
- Ne jamais afficher `🎬` comme substitut du logo en production
- L'icône `<Clapperboard />` de lucide-react est réservée au **contenu** (séquences, feuilles de service)
- Fond de l'icône app : `#071018` (jamais blanc)
- Ne pas étirer le logo — `object-contain` toujours
- Zone d'exclusion minimale : 8px de padding autour du logo sur fond neutre

---

## 9. Composants

### Button

```tsx
// Variantes
<button className="active-pill px-5 py-3 rounded-xl text-sm font-semibold">Principal</button>
<button className="border border-cyan/50 text-cyan px-5 py-3 rounded-xl text-sm font-semibold hover:bg-cyan/10 transition-colors">Secondaire</button>
<button className="text-textSoft px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">Tertiaire</button>
<button className="text-danger border border-danger/40 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-danger/10 transition-colors">Destructif</button>
<button className="px-5 py-3 rounded-xl text-sm font-semibold opacity-30 cursor-not-allowed bg-white/5 text-muted" disabled>Désactivé</button>
```

**États** :
- **Default** : voir classes ci-dessus
- **Hover** : transition-colors 150ms
- **Focus** : `focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-appBg`
- **Loading** : remplacer texte par `<Loader2 className="w-4 h-4 animate-spin" />`
- **Disabled** : `opacity-30 cursor-not-allowed pointer-events-none`

**Taille minimale** : `min-h-[44px]` sur mobile. Icône seule : `w-11 h-11`.

### Input

```tsx
// Input standard (underline style — conforme au design system)
<div className="flex items-center gap-3 border-b border-stroke pb-3 focus-within:border-cyan transition-colors">
  <Mail className="w-5 h-5 text-muted shrink-0" />
  <input
    className="flex-1 bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
    placeholder="Email"
  />
</div>

// Input enclosed (variante card)
<input className="w-full bg-surface border border-stroke rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan/40 focus:border-cyan/40 transition-colors" />
```

**États** : default → border-stroke ; focus → border-cyan + ring ; error → border-danger ; disabled → opacity-40.

### Badge / Chip

```tsx
// Statuts projet
const variants = {
  success:  "bg-successSoft text-success border border-success/20",
  warning:  "bg-warningSoft text-warning border border-warning/20",
  danger:   "bg-dangerSoft  text-danger  border border-danger/20",
  info:     "bg-infoSoft    text-info    border border-info/20",
  cyan:     "bg-cyanSoft    text-cyan    border border-cyan/20",
  neutral:  "bg-white/5    text-muted   border border-stroke",
};
// Usage : <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${variants.success}`}>Terminé</span>
```

### Card

```tsx
// Une seule définition — ne jamais imbriquer
<div className="glass-card rounded-2xl p-4">
  {/* contenu */}
</div>

// Card interactive
<button className="glass-card rounded-2xl p-4 w-full text-left hover:border-cyan/30 active:scale-[0.99] transition-all">
  {/* contenu */}
</button>
```

### Toggle / Switch

```tsx
<button
  role="switch"
  aria-checked={checked}
  onClick={() => setChecked(!checked)}
  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-cyan" : "bg-white/10"}`}
>
  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${checked ? "left-7" : "left-1"}`} />
</button>
```

### Toast

```tsx
// Positionné en fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50
<div className="glass-card-strong rounded-2xl px-4 py-3 flex items-start gap-3">
  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
  <div>
    <p className="text-sm font-semibold text-white">Action réussie</p>
    <p className="text-xs text-muted mt-0.5">Description courte</p>
  </div>
  <button onClick={dismiss} className="ml-auto text-muted hover:text-white">
    <X className="w-4 h-4" />
  </button>
</div>
```

Icône par type : success `<CheckCircle text-success>`, error `<TriangleAlert text-danger>`, info `<Info text-info>`, warning `<AlertCircle text-warning>`.

### Avatar

```tsx
// Initiales (défaut si pas de photo)
<div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center shrink-0">
  <span className="text-xs font-bold text-cyan">{initials}</span>
</div>
// Groupe : -space-x-2, les avatars se chevauchent
```

### Skeleton

```tsx
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-white/5 rounded-lg w-3/4" />
  <div className="h-4 bg-white/5 rounded-lg w-1/2" />
</div>
```
Utiliser skeleton (pas spinner) pour les chargements > 200ms.

---

## 10. Patterns métier et flux récents

### Carte de séquence

```
┌─────────────────────────────────────────┐
│ [Clapperboard] Sc. 07  ·  INT BUREAU    │
│ "Dialogue entre Marc et Julie"          │
│ [Clock] 08:30  [Timer] ~15min  [Users] A,B │
└─────────────────────────────────────────┘
```
Classes : `glass-card rounded-2xl p-4 space-y-2`

### Carte d'alerte

```
┌─────────────────────────────────────────┐
│ [TriangleAlert text-danger]  CRITIQUE   │
│ Matériel manquant — 2 boîtes HMI       │
│ [Clock] Il y a 12 min                  │
└─────────────────────────────────────────┘
```
Fond : `bg-danger/8 border border-danger/20` (PAS de border-left).

### Carte de stock

```
┌─────────────────────────────────────────┐
│ [img 40×40]  HMI 1200W  ·  [badge low] │
│              Qté : 2  [PackageOpen]     │
│ Dernière sortie : 14:30 — Équipe A      │
└─────────────────────────────────────────┘
```

### Carte de jour calendrier

```
┌─────────────────────────────────────────┐
│ JEU 23/05  ·  J07/42                   │
│ [MapPin] Studio 3 — Fort-de-France      │
│ [Clock] Call 06:30 → Wrap ~18:00        │
│ [UtensilsCrossed] 12:30  [Sun] 29°C    │
│ [Film] 8 séquences                     │
└─────────────────────────────────────────┘
```

### Badge convention IDCC

```tsx
// IDCC 2642 (audiovisuel) — violet
<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
  IDCC 2642
</span>

// IDCC 3097 (cinéma) — cyan
<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">
  IDCC 3097
</span>
```

### Carte LegalDocumentChunk (info juridique)

Structure : titre + tag + texte condensé + bouton "Voir plus" + données salariales si présentes.

```
┌─────────────────────────────────────────┐
│ [Scale] Durée du travail    [IDCC 3097] │
│ Art. L3121-10 · durée-travail           │
│ Durée hebdomadaire de référence : 39h.  │
│ ▼ Voir plus                             │
└─────────────────────────────────────────┘
```
Données salariales (SalaryData) : tableau inline `Poste / Montant / Fréquence / Indicatif`.

### Flux OCR scan frais (multi-étapes)

**Étape 1 — Capture**
```
┌─────────────────────────────────────────┐
│  [Camera] Photo du ticket *             │
│  ┌──────────────────────┐               │
│  │  [Upload] Ajouter    │ ou aperçu     │
│  └──────────────────────┘               │
│  [FileText] Facture (optionnel)         │
│                                         │
│  [ScanLine] Analyser avec l'IA ▶        │
└─────────────────────────────────────────┘
```

**Étape 2 — Vérification**
```
┌─────────────────────────────────────────┐
│  Aperçu ticket (image 80px)             │
│                                         │
│  ┌── Plaque d'immatriculation ──────┐   │
│  │ [Car cyan] AB-123-CD             │  ← auto-détectée (cyan)
│  └──────────────────────────────────┘   │
│                                         │
│  ┌── Plaque d'immatriculation ──────┐   │
│  │ [Car amber] Non détectée         │  ← absente (amber warning)
│  │ [Input] Saisir manuellement      │   │
│  │ [Checkbox] Non-véhicule / bypass │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Date   [2024-01-20]                    │
│  Fournisseur  [TOTAL CAP TAUPIN...]     │
│  Nature  [Carburant ▾]                  │
│  Montant TTC  [67.50 €]                 │
│                                         │
│  [Check] Confirmer                      │
└─────────────────────────────────────────┘
```

Règles :
- Plaque auto-détectée → border cyan + texte cyan + icône Car cyan
- Plaque absente → border amber + fond amber/5 + warning + champ manuel
- Bouton "Confirmer" désactivé si plaque absente et non bypassée
- Bypass "non-véhicule" = checkbox qui libère la confirmation

### Entrée frais (EntryCard — liste Matrice)

```
┌─────────────────────────────────────────┐
│ [1]  TOTAL CAP TAUPIN…   [Pencil] [Trash] │
│      2024-01-20 · Carburant              │
│      AB-123-CD (cyan mono)               │  ← si plaque présente
│                                    67.50 € │
└─────────────────────────────────────────┘
```

Mode édition inline :
```
┌── ring cyan/30 ──────────────────────────┐
│  Date  [input]  Fournisseur  [input]     │
│  Nature [select▾]  TTC [number input]   │
│  Plaque [input]                          │
│  [Enregistrer]  [X]                     │
└─────────────────────────────────────────┘
```

### Matrice note de frais (tableau TTC uniquement)

Colonnes PDF : N° | Date | Fournisseur | Nature dépense | TTC (€) | Plaque
Pas de colonnes TVA/HT — le calcul TVA est géré par le tableur de la production.

Contrôle cohérence avant impression :
```
┌─────────────────────────────────────────┐
│ [AlertTriangle amber] Problèmes détectés │
│  [3] Montant nul ou négatif             │
│  [5] Fournisseur manquant               │
│                                         │
│  [Imprimer quand même]  [Corriger]      │
└─────────────────────────────────────────┘
```

### Écran login (conforme au design)

Structure en 3 zones verticales :
1. **Hero** (60% écran) : fond photographique sombre (set de nuit + projecteur + clap), gradients overlay `from-appBg/0 via-appBg/40 to-appBg`
2. **Brand** : `CineoWordmark` taille display, tagline, ligne cyan "Conçu pour les équipes cinéma & TV"
3. **Form card** : `glass-card rounded-app p-6`, inputs underline, bouton `active-pill` full-width, lien S'inscrire, lien "Comment ça marche ?"

### Bandeau erreur sync (WifiOff)

Affiché dans `Header.tsx` quand `useProjectStore.syncError` est non-null.

```tsx
<div className="flex items-center gap-1.5 text-[11px] text-warning bg-warning/10 border border-warning/20 rounded-xl px-3 py-1.5 mb-2">
  <WifiOff className="w-3 h-3 shrink-0" />
  {syncError}
</div>
```
- Effacé automatiquement (`setSyncError(null)`) dès que la prochaine sauvegarde réussit.
- Jamais de `danger` ici — c'est un avertissement réseau, pas une erreur bloquante.

### Panneau codes d'accès département (AdminCodesPanel)

```
┌─────────────────────────────────────────┐
│ [Lock cyan]  Protection par code        │
│ Les départements configurés exigent…    │
│                              [toggle ●] │
├─────────────────────────────────────────┤
│ Codes par département        [Eye]      │
│ Laisser vide = accès libre              │
│                                         │
│ [Film]  Caméra         [••••••••]       │
│ [Zap]   Électro        [        ]       │
│ [Mic]   Son            [••••]           │
│  …                                      │
│                                         │
│ [active-pill]  Enregistrer les codes   │
└─────────────────────────────────────────┘
```

Comportement :
- Toggle off → `lockAll()` immédiat (réinitialise tous les accès)
- Enregistrer → `setDeptCodes()` + `lockAll()` (force re-vérification)
- Input `type="password"` par défaut, bouton Eye pour révéler
- Vide = département en accès libre même si codes globalement activés

### Écran de déverrouillage département (DepartmentRoute)

Auto-unlock silencieux si `codesEnabled = false` ou si aucun code n'est configuré pour ce département. L'écran de saisie n'est affiché que si les deux conditions sont réunies.

```
┌─────────────────────────────────────────┐
│         [Lucide dept icon cyan]         │
│              Caméra                     │
│          Accès protégé par code         │
│                                         │
│   [●●●●●●   ]   ← input password       │
│                                         │
│   [active-pill]  Accéder                │
│        ← Retour                         │
└─────────────────────────────────────────┘
```

---

## 11. Motion

| Usage                | Duration | Easing                              |
|----------------------|----------|-------------------------------------|
| Micro-interactions   | 120ms    | `ease-out`                          |
| Transitions standard | 200ms    | `cubic-bezier(0.4, 0, 0.2, 1)`      |
| Entrées modals/sheets| 280ms    | `cubic-bezier(0.34, 1.12, 0.64, 1)` |
| Sorties modals       | 180ms    | `cubic-bezier(0.4, 0, 1, 1)`        |
| Skeleton pulse       | 1500ms   | `ease-in-out` (Tailwind `animate-pulse`) |

**Propriétés animées uniquement** : `opacity`, `transform` (translate/scale/rotate), `color`, `background-color`, `border-color`, `box-shadow`.

**Interdit** : animer `width`, `height`, `top`, `left`, `margin`, `padding`, `max-height` (sauf accordion avec transition sur `grid-template-rows`).

**Accessibilité** : entourer toute animation de `@media (prefers-reduced-motion: no-preference)` ou utiliser `motion-safe:` en Tailwind.

Micro-interaction bouton primaire : `active:scale-[0.97] transition-transform duration-100`.

---

## 12. États vides, chargement, erreur

### Empty state

```tsx
<div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
    <IconName className="w-7 h-7 text-muted" />
  </div>
  <p className="text-sm font-semibold text-white">Aucun élément</p>
  <p className="text-xs text-muted max-w-[240px]">Description de ce qui manque et comment y remédier.</p>
  {/* CTA optionnel */}
  <button className="active-pill px-4 py-2 rounded-xl text-sm font-semibold mt-1">Ajouter</button>
</div>
```

### Loading

- Actions ponctuelles (< 200ms attendus) : `<Loader2 className="w-4 h-4 animate-spin" />`
- Chargements de listes (> 200ms) : skeleton (voir composant Skeleton)
- Plein écran : spinner centré seul `w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin`

### Error

```tsx
<div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-danger/20 bg-danger/5">
  <TriangleAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" />
  <div>
    <p className="text-sm font-semibold text-white">Quelque chose s'est mal passé</p>
    <p className="text-xs text-textSoft mt-0.5 leading-relaxed">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="text-xs text-cyan mt-2 flex items-center gap-1">
        <RefreshCw className="w-3 h-3" /> Réessayer
      </button>
    )}
  </div>
</div>
```

---

## 13. Accessibilité

| Règle                  | Standard        | Implémentation Tailwind                              |
|------------------------|-----------------|------------------------------------------------------|
| Contraste texte corps  | WCAG 4.5:1      | `text-white` sur `surface` → 12.5:1 ✓                |
| Contraste texte muted  | WCAG 3:1        | `text-muted` (#9FB3C8) sur `appBg` → 3.8:1 ✓        |
| Focus visible          | WCAG 2.4.7      | `focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-appBg outline-none` |
| Cibles tactiles        | Apple HIG 44px  | `min-h-[44px] min-w-[44px]` sur tout interactif      |
| Icônes seules          | WCAG 1.1.1      | `aria-label="Description"` obligatoire               |
| Rôles ARIA             | WCAG 4.1.2      | `role="switch"` toggle, `role="dialog"` modal        |
| Navigation clavier     | WCAG 2.1.1      | Focus trap dans modals (`react-focus-trap` ou natif) |
| Mouvement réduit       | WCAG 2.3.3      | `motion-safe:` préfixe sur toutes les animations     |

---

## 14. Tailwind config complète

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        appBg:          "#071018",
        surface:        "#0D1622",
        surfaceElevated:"#111C29",
        // Stroke
        stroke:         "rgba(255,255,255,0.10)",
        // Brand
        cyan:           "#00E0D0",
        cyanSoft:       "rgba(0,224,208,0.16)",
        // Text
        textSoft:       "#C9D2E3",
        muted:          "#9FB3C8",
        // Semantic
        success:        "#22C55E",
        successSoft:    "rgba(34,197,94,0.15)",
        warning:        "#F5A623",
        warningSoft:    "rgba(245,166,35,0.15)",
        danger:         "#EF4444",
        dangerSoft:     "rgba(239,68,68,0.15)",
        info:           "#3B82F6",
        infoSoft:       "rgba(59,130,246,0.15)",
        // Nuit
        night:          "#A855F7",
        nightSoft:      "rgba(168,85,247,0.15)",
        // Legacy — compat descendante, INTERDIT dans le nouveau code
        blueSoft:       "#2D8CFF",
        orangeSoft:     "#F5A623",
        redSoft:        "#EF4444",
        violetSoft:     "#A855F7",
      },
      fontFamily: {
        sans: ["Satoshi", "-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display": ["48px", { lineHeight: "56px", fontWeight: "700", letterSpacing: "-0.005em" }],
        "h1":      ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "h2":      ["24px", { lineHeight: "32px", fontWeight: "500" }],
        "h3":      ["20px", { lineHeight: "28px", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body":    ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      boxShadow: {
        soft:    "0 18px 60px rgba(0,0,0,0.35)",
        glow:    "0 0 25px rgba(0,224,208,0.18)",
        overlay: "0 32px 80px rgba(0,0,0,0.50)",
      },
      borderRadius: {
        app: "26px",
      },
      backdropBlur: {
        card:    "18px",
        strong:  "20px",
        overlay: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 15. Anti-patterns — Ce qui est interdit

| ❌ Interdit                                          | ✅ Remplacement                                       |
|------------------------------------------------------|-------------------------------------------------------|
| `border-l-4 border-cyan` sur les cartes d'alerte     | Fond teinté + icône colorée                           |
| `text-gradient` (`background-clip: text`)            | `text-white font-bold` sur fond sombre                |
| `glass-card` imbriqué dans `glass-card`              | Une seule surface ; le contenu est plat               |
| Emojis dans le code (🎬 ☀️ 🚨 etc.)                  | `lucide-react` — voir mapping section 7               |
| `#000` ou `#fff` purs comme couleur                  | `appBg #071018` / `#F5F7FA`                           |
| Animer `width`, `height`, `margin`                   | `opacity` + `transform` uniquement                    |
| Bouton sans état `focus-visible`                     | `focus-visible:ring-2 focus-visible:ring-cyan`        |
| Zone interactive sans `min-h-[44px]`                 | Ajouter la contrainte de taille                       |
| `aria-label` manquant sur icône seule                | `aria-label="..."` obligatoire                        |
| Modal comme premier réflexe d'interaction            | Inline / sheet / état conditionnel d'abord            |
| Grid de cartes identiques icon+titre+texte           | Listes, tableaux ou patterns métier spécifiques       |
| Spinner pendant plus de 2 secondes                   | Skeleton après 200ms                                  |
| Couleur seule pour transmettre un état               | Icône + couleur + texte                               |
| `text-gradient` sur les classes Tailwind custom      | Supprimer `.text-gradient` de globals.css             |

---

## 16. Checklist de revue composant

Avant tout merge d'un composant UI :

- [ ] Contraste texte ≥ 4.5:1 (vérifier avec browser DevTools accessibility)
- [ ] Aucun emoji dans le JSX — `lucide-react` à la place
- [ ] Focus visible sur tous les éléments interactifs (`focus-visible:ring-2 ring-cyan`)
- [ ] Cibles tactiles ≥ 44×44px sur mobile
- [ ] `aria-label` sur toutes les icônes seules (sans texte visible)
- [ ] Pas de `glass-card` dans un `glass-card`
- [ ] Pas de `border-left`/`border-right` coloré > 1px comme accent
- [ ] `motion-safe:` sur toutes les animations (respecte `prefers-reduced-motion`)
- [ ] Empty state défini si le composant peut être vide
- [ ] État loading défini si le composant fait un appel async
- [ ] État error défini si l'appel peut échouer
- [ ] Composant testé en plein soleil (fond très clair en fond d'écran physique)

---

*CinéO Design System v1.2 — 22 mai 2026 — Ajouts : token night/nightSoft, bandeau sync WifiOff, panneau codes département, migration tokens legacy complète (redSoft/orangeSoft/blueSoft/violetSoft → danger/warning/info/night)*
