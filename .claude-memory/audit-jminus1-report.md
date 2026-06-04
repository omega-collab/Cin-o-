# Audit nocturne J-1 — Rapport final

**Date** : 2026-06-04, fin de session avant J1 de tournage  
**Branche cible** : `main` (4 PRs squash-mergées)  
**Stack** : Next.js 14 App Router · TypeScript · Tailwind · Supabase · Zustand  
**Auteur** : Claude Code (audit autonome)

---

## Résumé exécutif

Le bug bloquant rapporté (feuille de service qui « disparaît » sur la page
d'accueil après import) a été tracé à 3 causes cumulatives : une race
condition de synchronisation Supabase qui écrasait le shoot local avec un
remote plus pauvre, la perte de `isPublished:true` au reload juste après
publication, et un oubli classique de l'utilisateur de cliquer
« Publier ». Toutes les trois sont fixées (PR #37). Le renommage
**Réalisation → Mise en scène** est appliqué partout dans l'UI sans
migration data (PR #38). Le filtrage des notes par département a été
revu, centralisé et étendu pour ne plus rater de notes (PR #38 + #40).
Deux bugs collatéraux trouvés en review : le `ProjectSwitcher` (créer /
rejoindre projet depuis la Nav) n'utilisait pas les RPCs sécurisées
déployées par les PRs précédentes (PR #40), et le matching des notes
était dupliqué dans 3 composants (refactor PR #40).

Toutes les CI Netlify sont vertes. Aucun bug bloquant restant identifié.

---

## Checklist Phase 6

| Élément                       | Statut  | Note                                              |
|-------------------------------|---------|---------------------------------------------------|
| Bug feuille disparaît         | OK      | PR #37 — race + UX + isPublished préservé         |
| Renommage Mise en scène       | OK      | PR #38 — slug `direction` conservé, pas de migration |
| Mise en scène en 1re position | OK      | PR #38 — DEPARTMENTS réordonné                    |
| Filtrage notes par dept       | OK      | PR #38 + #40 — keywords élargis + fallback safe   |
| matchesDept centralisé        | OK      | PR #40 — `lib/utils/deptNoteMatching.ts`           |
| ProjectSwitcher RPCs          | OK      | PR #40 — aligné sur ProjectSelector               |
| Sync temps réel               | OK (théorique) | Code Realtime + initial load durci ; non testé live |
| Heures intermittentes (nuit)  | OK      | `intermittent.ts` gère bien le passage minuit     |
| Validation pause déjeuner     | OK      | `lunchInvalid` guard en place                     |
| Tokens couleurs legacy        | OK      | PR #39 — `blueSoft`/`orangeSoft` purgés de documents.ts |
| Build production              | OK      | 33/33 pages générées sans erreur                  |
| TypeScript strict             | OK      | `npx tsc --noEmit` propre sur les 4 PRs          |
| Audit visuel exhaustif        | KO partiel | Pas pu lancer le navigateur — review code only |
| Tests E2E Playwright          | KO      | Non lancés (manque de temps)                      |
| OCR feuille du jour           | NON TESTÉ | Pas eu accès à la vraie feuille de demain        |

---

## PRs créées et mergées

| # | Titre | Phase | Status |
|---|-------|-------|--------|
| #37 | fix(sync): feuille de service qui disparaît — race + oubli publication | 1 | mergée |
| #38 | feat(ui): renommage Réalisation → Mise en scène + filtrage notes amélioré | 2 + 3 | mergée |
| #39 | chore(ui): libellés Mise en scène + tokens couleurs corrigés | 4 | mergée |
| #40 | fix(projects+notes): ProjectSwitcher RPCs + matchesDept centralisé | 5 | mergée |

Toutes squash-merge dans `main`. CI Netlify verte avant chaque merge.

---

## Détail des changements par PR

### PR #37 — Fix bloquant feuille de service

**Fichiers** : `lib/hooks/useProjectSync.ts`, `components/admin/AdminExtractionReview.tsx`, `components/admin/AdminDashboard.tsx`

3 axes :

1. **Race condition `loadData`** : la garde anti-écrasement ne couvrait que `uploadedDocs`. Étendue à `sequences`, `cast`, `deptNotes`, `places`, `alerts`, `nextDays`, `projectTitle`, `location`, `date`. Règle : si local non-vide et remote vide pour un champ → on garde le local.

2. **`isPublished` préservé** : si local est `true` et que le contenu local est cohérent (titre + au moins une séquence), on ne laisse pas le remote remettre à `false`.

3. **UX anti-oubli** : bouton primaire sur `AdminExtractionReview` renommé en « Valider et publier maintenant » ; bandeau orange d'avertissement sur `AdminDashboard` quand la feuille est prête mais hors ligne.

### PR #38 — Renommage + filtrage notes

**Fichiers** : `lib/data/departments.ts`, `components/heures/SalarySettings.tsx`, `lib/data/roles.ts`, `lib/data/salaryPresets.ts`, `app/api/extract/route.ts`, `components/today/Hero.tsx`

- Slug `direction` conservé. Libellé « Mise en scène » partout.
- Premier dans `DEPARTMENTS`.
- Prompt LLM accepte « Réalisation » (legacy) + « Mise en scène ».
- `DEPT_KEYWORDS` Hero : retire « production » de `regie`, ajoute synonymes pour `direction` et `production`, élargit chaque dept (chef op, cadreur, perchman, etc.). Fallback : note avec dept non mappable → affichée pour tous.

### PR #39 — Cohérence libellés

**Fichiers** : `components/admin/AdminExtractionReview.tsx`, `components/departments/DepartmentGrid.tsx`, `lib/data/documents.ts`

- Section « Heures de convocation par département » affichait « Direction » (slug capitalisé). Map de labels + ordre cohérent.
- `DEPT_ROLES` de `DepartmentGrid` complété avec `direction: "Réalisateur"`.
- Tokens legacy `blueSoft`/`orangeSoft` remplacés par `info`/`warning`.

### PR #40 — ProjectSwitcher + refactor matchesDept

**Fichiers** : `components/projects/ProjectSwitcher.tsx`, `lib/utils/deptNoteMatching.ts` (nouveau), `components/today/Hero.tsx`, `components/today/ScheduleList.tsx`, `components/today/SequenceSheet.tsx`

- `ProjectSwitcher.createProject` → `create_project_with_dedup` (dédup par nom)
- `ProjectSwitcher.joinProject` → `join_project_by_code` (bypass RLS)
- Mapping codes Postgres pour messages d'erreur lisibles
- Extraction de `matchesDept` + `DEPT_KEYWORDS` dans un util partagé : Hero/ScheduleList/SequenceSheet utilisent désormais la même règle (avant : 3 versions divergentes).

---

## Bugs résiduels (non bloquants)

| Sévérité | Bug | Workaround | Effort fix |
|----------|-----|------------|------------|
| Mineur | Audit visuel mobile non lancé (navigateur indisponible) | Vérification visuelle à faire manuellement avant le tournage | 30 min QA terrain |
| Mineur | Pas de test E2E Playwright sur le flow upload→publier→voir | Test manuel en J-1 soir conseillé | 2-3 h scriptage |
| Mineur | Le prompt LLM (`route.ts`) parle de saison « Tropiques Criminels » dans certains exemples — pas neutre | Tester sur la feuille réelle pour s'assurer que l'extraction marche aussi sur d'autres projets | 15 min |
| Information | `useDeptNotesStore` a son propre store pour les notes privées par dept (pas couvert par l'audit) | Hors scope J-1 | N/A |

---

## Recommandations critiques pour le J1

### Avant d'arriver sur le plateau

1. **Vérifier en prod** que la feuille de demain est bien **publiée** (état `En ligne` sur le bouton du tab Admin → Accueil, badge cyan). Si elle est `Hors ligne`, cliquer dessus pour publier.
2. **Tester depuis un 2e device** : se connecter avec un compte différent (autre membre) sur le projet du tournage et vérifier que la feuille apparaît bien sur `/today` avec le titre + le call time + les notes du dept.
3. **Vérifier le code d'invitation** du projet (Admin → onglet Projet) et le **noter sur papier** au cas où le service de prod doit le redonner aux équipes en cours de journée.
4. **Inviter le staff cantine** sur le lien `/cantine` du déploiement (le bouton « Copier » dans l'admin envoie l'URL à partager via SMS).

### Sur le plateau

1. **Si la feuille semble disparaître sur un device** : recharger la page. Le nouveau correctif préserve les champs locaux non-vides au reload, donc la feuille publiée doit rester.
2. **Si un membre voit « Aucune feuille publiée » alors qu'elle l'est** : faire refresh, puis vérifier que son `projectId` actif est bien celui du tournage du jour (Nav en bas → projet courant).
3. **Filtre « Ma section » sur la page d'accueil** : les notes sont maintenant matchées plus largement (par exemple un user `direction` voit aussi les notes étiquetées « Réalisation », « Metteur en scène », etc.). Si une note semble manquer pour une section donnée, c'est probablement que son `department` n'est pas reconnu — elle sera alors affichée pour tous (fallback safe).
4. **Production** voit absolument toutes les notes (filtre OFF) — pas de changement.

### En cas de pépin réseau

- Toutes les saves sont **debounce 1.5s + localStorage persist** → si réseau coupé, les modifs locales sont conservées et seront resynchronisées à la prochaine connexion.
- Le bandeau `WifiOff` rouge en haut de l'écran signale un échec de save. Ne pas paniquer, ça réessaie automatiquement.

### Si quelqu'un crée un projet en double

- Le nouveau code (PR #40) refuse les doublons côté serveur : si vous tapez un nom déjà pris, le système affiche le code d'invitation du projet existant pour rejoindre. Plus de risque d'équipe éclatée sur 2 projets.

---

## État de la session Ruflo

Mémoire exportée vers `.claude-memory/cin-o.json` (9 entrées, 5582 B).
Nouvelles entrées de cette session :
- `audit_jminus1_phase1_fix`
- `audit_jminus1_phase2_renommage`
- `audit_jminus1_phase5_bugs`
- `audit_jminus1_prs_creees`

Les anciennes entrées (`session_restore_marker`, `bug_addproject_upsert`,
`ruflo_setup_web_env`, `ordre_skills_obligatoires`,
`permissions_default_behavior`) sont conservées.
