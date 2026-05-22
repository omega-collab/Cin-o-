# CinéO — Claude Code Configuration

## Projet

**CinéO** est une application mobile-first de gestion de tournage cinéma/TV (équipes intermittentes).
Stack : **Next.js 14 App Router · TypeScript strict · Tailwind CSS · Supabase · Zustand · lucide-react**

Repo : `omega-collab/Cin-o-`
Branche de dev : `claude/setflow-setup-deploy-KNKki`
PR ouverte : #14 (draft)
Version actuelle : **v0.2.0** (commit `8563226`)

---

## Règles impératives

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary — prefer editing existing files
- NEVER create documentation files unless explicitly requested
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- Keep files under 500 lines — extract when nécessaire
- Validate input at system boundaries only
- Default language : **français** dans l'UI, anglais dans le code
- Zéro emoji dans le code — `lucide-react` uniquement (voir DESIGN.md §7)
- ALWAYS run `npx tsc --noEmit` before committing
- ALWAYS run the full TypeScript check, not just the changed files

---

## Skills disponibles — utiliser systématiquement

Invoquer via `Skill({ skill: "nom" })` quand la tâche correspond.

| Skill | Quand l'utiliser |
|-------|-----------------|
| `supabase` | Toute tâche impliquant Supabase (auth, DB, storage, realtime, RLS, migrations, SSR) |
| `supabase-postgres-best-practices` | Écriture / review de requêtes SQL, optimisation schéma |
| `impeccable` | Design UI/UX, redesign composant, audit visuel, polish |
| `gstack` | Vérifier que l'UI fonctionne dans le navigateur, QA, screenshots, tests flows |
| `verify` | Confirmer qu'un fix fonctionne réellement dans l'app |
| `run` | Lancer l'app pour tester une fonctionnalité |
| `code-review` | Review du diff courant avant PR |
| `security-review` | Après tout changement auth, permissions, données utilisateur |
| `sparc:tdd` | Développer avec tests en premier (TDD London School) |
| `sparc:coder` | Implémentation complexe avec spec précise |
| `sparc:reviewer` | Revue qualité code + sécurité post-implémentation |
| `github:pr-manager` | Gérer le cycle de vie de la PR |
| `github:code-review` | Review automatisée multi-agents de la PR |
| `analysis:performance-report` | Détecter les régressions perf |
| `hooks:post-task` | Après chaque tâche réussie (mémorise les patterns) |

---

## Architecture — fichiers clés

### App Router
```
app/
  layout.tsx          # metadata, viewport (zoom activé), Shell
  page.tsx            # root — redirige vers /today ou login
  [section]/page.tsx  # today, departments, calendar, documents, heures, admin, cantine
```

### Stores Zustand (client-side, persistés localStorage + sync Supabase)
```
lib/store/
  useProjectStore.ts  # auth Supabase, projets, syncError, isSyncing
  useShootStore.ts    # feuille de service, séquences, cast, codes dept (codesEnabled + deptCodes)
  useDepartmentStore  # stock, mouvements
  useAccessStore.ts   # départements déverrouillés (Set<DepartmentSlug>)
  useCanteenStore.ts  # menu cantine du jour
  useExpenseStore.ts  # notes de frais (persist key: "cin-o-expense-v1")
  useIntermittentStore# journées de travail, paramètres salaires
  useSettingsStore.ts # thème, langue, taille police
```

### Sync Supabase
```
lib/hooks/useProjectSync.ts  # debounce 1.5s, upsert project_data, signale syncError
lib/supabase/client.ts       # guard env vars manquantes
lib/supabase/types.ts        # Project, Profile, ProjectMember, ProjectData, FraisEntry
```

### Services
```
lib/services/
  auth.service.ts     # verifyDepartmentCode — vérifie contre useShootStore.deptCodes
  storage.service.ts  # upload Supabase Storage bucket "documents"
  document.service.ts # analyse IA (non déployée — retourne erreur honnête)
```

### Composants principaux
```
components/
  layout/
    Shell.tsx           # hydration guard (spinner, pas return null)
    Header.tsx          # sync error banner (WifiOff + setSyncError)
    Nav.tsx             # onTouchEnd + preventDefault (anti double-tap)
  auth/
    AuthModal.tsx       # login / register / resetPassword
  departments/
    DepartmentRoute.tsx # auto-unlock si codesEnabled=false ou pas de code dept
    DepartmentGrid.tsx  # grille avec DEPT_ICONS (lucide)
    DepartmentDetail.tsx
  admin/
    AdminPanel.tsx      # tabs: dashboard/upload/review/publish/codes (Lock)
    AdminCodesPanel.tsx # toggle global + code par département → sync Supabase auto
  heures/
    WorkDayForm.tsx     # lunchInvalid guard (fin > début requis)
    expense/MatriceForm.tsx   # < 500 lignes, extracted EntryCard + printReleve
    expense/MatriceEntryCard.tsx
  calendar/CalendarView.tsx   # pas de borderTop coloré
  cantine/CanteenStaffInterface.tsx  # direct sur form (pas de PIN)
  documents/DocumentsSection.tsx     # TTL 24h localStorage
```

### Utilitaires
```
lib/utils/
  intermittent.ts   # heures nuit : if (end <= start) end += 24*60
  matricePdf.ts     # printReleve() avec escHtml() (XSS safe)
lib/data/
  departments.ts    # DEPARTMENTS[] avec code: process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE
  departmentIcons.ts # DEPT_ICONS: Record<DepartmentSlug, LucideIcon>
  documents.ts      # ADMIN_CODE = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "PROD"
  expenseCategories.ts # icon: LucideIcon (plus emoji)
  legalChunks.ts    # corpus IDCC 2642/3097
```

### Types
```
lib/types/
  index.ts       # DepartmentSlug, Department, CanteenMenu (mealTime?), DailyShoot
  shoot.ts       # FullShoot (codesEnabled, deptCodes), ShootSequence, etc.
  intermittent.ts
  expense.ts
  matrice.ts
```

---

## Fonctionnalités — état v0.2.0

### Authentification
- Supabase Auth (email/mdp) — login, register, reset password
- Profil : département + rôle + avatar (onboarding obligatoire)
- Projets multi-utilisateurs avec code d'invitation (invite_code)

### Feuille de service (admin)
- Import PDF/doc → OCR (endpoint `/api/extract-frais`)
- Extraction : séquences, cast, lieux, alertes, notes département, jours à venir
- Révision manuelle avant publication
- Sync Supabase temps réel (Realtime postgres_changes)

### Codes d'accès département (nouveau v0.2.0)
- Admin → onglet "Codes" : toggle global `codesEnabled`, code par département
- Stocké dans `shoot.deptCodes` (synced Supabase via shoot_store)
- `DepartmentRoute` : auto-unlock si codes off ou dept non configuré
- `lockAll()` déclenché à chaque modification de codes

### Heures intermittentes
- Calcul IDCC 2642 (audiovisuel) et 3097 (cinéma/SFACT)
- Heures supplémentaires, heures de nuit, heures anticipées, journée continue
- Heures nuit : calcul correct pour passages minuit (23:00→06:00)
- Validation pause déjeuner : fin > début obligatoire

### Notes de frais / Matrice
- OCR ticket via Mistral : date, fournisseur, nature, montantTTC, plaqueImmat
- Plaque immat : détection auto (cyan) ou saisie manuelle / bypass non-véhicule
- Matrice PDF : colonnes TTC uniquement (pas TVA/HT), escHtml() XSS-safe
- Sync Supabase avec RLS (useFraisEntries)

### Cantine
- Formulaire staff (lieu tournage, lieu cantine, heure repas, menu 4 champs)
- Accès direct sans PIN (auth Supabase suffit)
- Sync via useCanteenStore

### Documents
- Catalogue statique + documents uploadés (Supabase Storage)
- Accès restreint : code d'accès avec TTL 24h (localStorage)
- Admin doc : code via NEXT_PUBLIC_DEFAULT_DEPT_CODE

### Calendrier / Planning
- Vue mensuelle des jours de tournage avec statuts
- Pas de borderTop coloré (fond teinté + badge statut uniquement)

### Sync & offline
- Sauvegarde auto debounce 1.5s
- Bandeau WifiOff si sauvegarde échoue
- Message d'erreur si chargement initial échoue

---

## Design tokens — référence rapide

```
appBg #071018 · cyan #00E0D0 · cyanSoft rgba(0,224,208,0.16)
danger #EF4444 · dangerSoft · warning #F5A623 · warningSoft
info #3B82F6 · infoSoft · success #22C55E · successSoft
night #A855F7 · nightSoft   ← heures de nuit uniquement
stroke rgba(255,255,255,0.10) · muted #8E9AAF · textSoft #C9D2E3
```

Tokens legacy (`redSoft`, `orangeSoft`, `blueSoft`, `violetSoft`) : **conservés dans tailwind.config.ts pour compat**, mais **AUCUNE nouvelle occurrence autorisée**.

---

## Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DEFAULT_DEPT_CODE=    # code admin (ADMIN_CODE, PROD_CODE, dept codes)
MISTRAL_API_KEY=                  # OCR frais (server-side uniquement)
```

---

## Versioning — process à suivre quand demandé

### Étapes pour créer une nouvelle version (ex. v0.3.0)

1. **Bumper `package.json`** : `"version": "0.2.0"` → `"0.3.0"`

2. **Commit + push**
   ```bash
   git add package.json
   git commit -m "chore: bump version 0.2.0 → 0.3.0"
   git push -u origin claude/setflow-setup-deploy-KNKki
   ```

3. **Tag annoté local**
   ```bash
   git tag -a v0.3.0 -m "v0.3.0 — [titre résumé]"
   ```
   *(push tag bloqué en 403 — tag reste local, la PR GitHub fait foi)*

4. **Mettre à jour la PR #14** via `mcp__github__update_pull_request`
   - `owner: "omega-collab"`, `repo: "Cin-o-"`, `pullNumber: 14`
   - Titre : `v0.3.0 — [description]`
   - Body : changelog complet avec sections, tableau tokens, plan de test

### Numérotation sémantique
| Type | Incrément | Exemple |
|------|-----------|---------|
| Correctifs / audit | patch | 0.2.0 → 0.2.1 |
| Nouvelles fonctionnalités | minor | 0.2.0 → 0.3.0 |
| Refonte majeure | major | 0.2.0 → 1.0.0 |

---

## Agent Routing — quand spawner des agents

### Swarm (3+ fichiers ou feature transverse)
```javascript
Agent({ subagent_type: "researcher", name: "researcher", run_in_background: true, prompt: "..." })
Agent({ subagent_type: "system-architect", name: "architect", run_in_background: true, prompt: "..." })
Agent({ subagent_type: "coder", name: "coder", run_in_background: true, prompt: "..." })
```

| Task | Agents | Note |
|------|--------|------|
| Bug fix | researcher, coder, tester | |
| Feature | architect, coder, tester, reviewer | |
| Refactor | architect, coder, reviewer | |
| Audit sécurité | security-architect, auditor | Utiliser `security-review` skill |
| UI/UX | impeccable skill + coder | |

**Swarm : OUI** si 3+ fichiers, nouvelle feature, API change, sécurité
**Swarm : NON** si 1-2 fichiers, fix simple, config, questions

### Build & Test
```bash
npx tsc --noEmit          # TOUJOURS avant commit
npm run build             # vérifier build prod
```
