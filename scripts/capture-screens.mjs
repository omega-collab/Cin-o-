// Script de capture d'écran de l'app CinéO pour la vidéo Remotion.
// Lance un Chromium headless en viewport mobile (390×844), pré-remplit
// localStorage pour skipper auth/onboarding, et capture chaque écran clé
// en PNG haute résolution (deviceScaleFactor 2) dans remotion/captures/.
//
// Usage : node scripts/capture-screens.mjs
// Pré-requis : npm run dev déjà en route sur :3000

import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
// Les captures sont écrites dans /public/captures/ pour être servies via
// staticFile() par Remotion.
const OUT_DIR = path.join(ROOT, "public", "captures");

const CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";

// Shoot mock prêt-à-publier (clone simplifié de lib/data/mockShoot.ts —
// on garde uniquement ce qui est affichable en UI, sans transcriptions
// scènes/scénario lourdes, et on force isPublished:true pour afficher la
// feuille du jour sur /).
const MOCK_PUBLISHED_SHOOT = {
  date: new Date().toISOString().slice(0, 10),
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
  deptCallTimes: { camera: "08:00", electro: "07:30", regie: "06:30", hmc: "07:00", son: "08:00" },
  sequences: [
    { id: "s1", time: "08:30", label: "Séq. 802 – Découverte du corps de Théo", location: "EXT. PLAGE CORPS DE GARDE – MATIN", cast: ["Mélissa", "Gaëlle", "Tahina"], script: "Aube grise sur la plage. Mélissa marche vers la silhouette allongée. Gros plan sur son visage." },
    { id: "s2", time: "10:45", label: "Séq. 808 – Fouille de la cabane du pêcheur", location: "EXT. CABANE PÊCHEUR", cast: ["Mélissa", "Gaëlle"], script: "Mélissa et Gaëlle forcent la porte. Découverte du portefeuille." },
    { id: "s3", time: "13:30", label: "Séq. 815 – Discussion avec l'oncle de Théo", location: "EXT. TERRASSE", cast: ["Mélissa", "Oncle Théo"], script: "Long silence. Paul écrase sa cigarette." },
    { id: "s4", time: "15:00", label: "Séq. 816 – Mélissa part, Gaëlle reste", location: "EXT. PARKING PLAGE", cast: ["Mélissa", "Gaëlle"], script: "Mélissa démarre. Plan en contre-plongée sur Gaëlle." },
    { id: "s5", time: "16:00", label: "Séq. 801DR – Plan drone", location: "EXT. VUE AÉRIENNE PLAGE", notes: "Drone 16h00–17h30", script: "Vue aérienne au drone. Lumière dorée du couchant." },
  ],
  cast: [
    { id: "c1", name: "Mélissa", role: "Capitaine Mélissa Sainte-Rose", callTime: "08:00", logeLocation: "Loge A" },
    { id: "c2", name: "Gaëlle", role: "Lt Gaëlle Camara", callTime: "08:00", logeLocation: "Loge B" },
    { id: "c3", name: "Tahina", role: "Inès Roussel", callTime: "08:15" },
    { id: "c4", name: "Oncle Théo", role: "Paul Magnon", callTime: "13:00" },
  ],
  deptNotes: [
    { id: "d1", department: "Électro", content: "Groupe électro côté nord, 150 m du décor", priority: "info" },
    { id: "d2", department: "Régie", content: "Parking VL entrée, PL au fond à droite", priority: "info" },
    { id: "d3", department: "HMC", content: "Loges 103 ZAC Pont Café – 30 min trajet", priority: "warning" },
    { id: "d4", department: "Son", content: "Vent Est 25 km/h – protection micro", priority: "warning" },
  ],
  places: [
    { id: "p1", label: "Décor principal", description: "Plage Corps de Garde", distance: "Référence" },
    { id: "p2", label: "Parking VL", description: "Entrée principale plage", distance: "50 m" },
    { id: "p3", label: "Parking PL", description: "Côté nord, accès camions", distance: "80 m" },
    { id: "p4", label: "Cantine", description: "Parking Tam-Tam Beach", distance: "200 m" },
    { id: "p5", label: "HMC / Loges", description: "103 ZAC Pont Café", distance: "3 km" },
  ],
  alerts: [
    { id: "a1", severity: "warning", message: "Vent soutenu – risques sonores et sécurité drone", department: "Son" },
    { id: "a2", severity: "info", message: "Météo : soleil brumeux, crème solaire recommandée" },
    { id: "a3", severity: "critical", message: "Drone uniquement 16h–17h30 – zone réglementée" },
  ],
  nextDays: [
    { date: "2025-07-18", shootingDay: 35, location: "Commissariat Fort-de-France", callTime: "07:00" },
    { date: "2025-07-19", shootingDay: 36, location: "Appartement Mélissa, Le Lamentin", callTime: "07:30" },
    { date: "2025-07-22", shootingDay: 37, location: "Studio HD intérieur jour", callTime: "08:30" },
  ],
  auditLog: [
    { id: "au1", timestamp: new Date().toISOString(), action: "Feuille de service publiée", source: "publish" },
  ],
  isPublished: true,
  uploadedDocs: [],
  extractionStatus: "done",
  codesEnabled: true,
  deptCodes: { camera: "0712", electro: "9214", regie: "3081", hmc: "5544", son: "1199" },
};

// Profil mock à injecter dans localStorage avant chaque navigation.
// Force le user à être "production" (admin) avec onboarding done, et
// active le projet de démo (cf mockClient.ts MOCK_PROJECT.id).
const LOCAL_STORAGE_SEED = {
  "cin-o-user": JSON.stringify({
    state: {
      department: "production",
      role: "Directeur de production",
      avatarId: null,
      onboardingDone: true,
    },
    version: 1,
  }),
  "cineo-project": JSON.stringify({
    state: { activeProjectId: "00000000-0000-0000-0000-000000000010" },
    version: 0,
  }),
  "cin-o-shoot": JSON.stringify({
    state: { shoot: MOCK_PUBLISHED_SHOOT, pendingExtraction: null },
    version: 3,
  }),
  // Déverrouille tous les départements pour montrer le détail sans bloc code.
  "cin-o-access": JSON.stringify({
    state: { unlockedDepartments: ["camera", "electro", "machino", "son", "regie", "deco", "hmc", "production", "cantine", "mise-en-scene"] },
    version: 1,
  }),
  // Quelques jours travaillés mock pour rendre la vue Heures plus parlante.
  "cin-o-intermittent": JSON.stringify({
    state: {
      workDays: [
        { id: "w1", date: "2026-06-15", startTime: "08:00", endTime: "19:30", lunchStart: "12:30", lunchEnd: "13:30", convention: "2642", role: "Chef opérateur caméra" },
        { id: "w2", date: "2026-06-16", startTime: "07:30", endTime: "20:00", lunchStart: "13:00", lunchEnd: "14:00", convention: "2642", role: "Chef opérateur caméra" },
        { id: "w3", date: "2026-06-17", startTime: "06:00", endTime: "21:00", lunchStart: "12:00", lunchEnd: "13:00", convention: "2642", role: "Chef opérateur caméra" },
        { id: "w4", date: "2026-06-18", startTime: "08:00", endTime: "18:00", lunchStart: "12:30", lunchEnd: "13:30", convention: "2642", role: "Chef opérateur caméra" },
      ],
      salarySettings: { hourlyRate: 24.5, conventionDefault: "2642" },
    },
    version: 1,
  }),
  // Quelques notes de frais mock — chaque entrée doit avoir flags:[] et createdAt
  "cin-o-expense-v1": JSON.stringify({
    state: {
      entries: [
        { id: "f1", date: "2026-06-15", supplier: "Total Sainte-Luce", nature: "Carburant Renault Trafic", amountTTC: 84.30, plate: "AB-123-CD", category: "carburant", flags: [], createdAt: "2026-06-15T20:00:00Z" },
        { id: "f2", date: "2026-06-16", supplier: "Carrefour Le Lamentin", nature: "Restauration équipe régie", amountTTC: 142.80, category: "repas", flags: [], createdAt: "2026-06-16T20:00:00Z" },
        { id: "f3", date: "2026-06-17", supplier: "Péage Trois-Îlets", nature: "Péage A1 aller-retour", amountTTC: 6.40, plate: "AB-123-CD", category: "peage", flags: [], createdAt: "2026-06-17T19:00:00Z" },
        { id: "f4", date: "2026-06-18", supplier: "Hôtel La Suite", nature: "Hébergement nuit 18/06", amountTTC: 95.00, category: "hebergement", flags: [], createdAt: "2026-06-18T20:00:00Z" },
      ],
    },
    version: 1,
  }),
  // Cantine pré-remplie pour la capture.
  "cin-o-canteen": JSON.stringify({
    state: {
      menu: {
        date: new Date().toISOString().slice(0, 10),
        location: "Parking Tam-Tam Beach, Sainte-Luce",
        shootLocation: "Plage Corps de Garde",
        mealTime: "12:30",
        starter: "Salade créole, accras de morue",
        main: "Colombo de poulet, riz parfumé",
        side: "Gratin de christophine",
        dessert: "Tarte coco · ananas frais",
      },
    },
    version: 2,
  }),
  // Heures : on laisse vide, l'écran affiche le formulaire.
  "cin-o-shift-pointage-v1": JSON.stringify({
    state: {
      currentShift: null,
      todayShifts: [],
    },
  }),
};

async function seed(page) {
  await page.addInitScript((data) => {
    try {
      for (const [k, v] of Object.entries(data)) {
        window.localStorage.setItem(k, v);
      }
    } catch (e) {
      // ignore
    }
  }, LOCAL_STORAGE_SEED);
}

async function capture(page, url, file, opts = {}) {
  const fullPath = path.join(OUT_DIR, file);
  try {
    console.log(`\n  → ${url}`);
    await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 30000 });
    // laisse les animations finir
    await page.waitForTimeout(opts.wait ?? 1200);
    if (opts.beforeShot) {
      try { await opts.beforeShot(page); } catch (e) { console.warn(`    beforeShot fail: ${e.message}`); }
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: fullPath, fullPage: false });
    console.log(`    OK → ${file}`);
    return true;
  } catch (e) {
    console.warn(`    SKIP ${file} : ${e.message}`);
    return false;
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log("[capture] launching Chromium…");
  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  // Viewport mobile (iPhone-ish) — 1080×1920 final mais on rend à 390×844 dans
  // le browser puis on prend deviceScaleFactor:3 → 1170×2532 pour avoir une
  // résolution suffisante après redimensionnement à 1080×1920 par Remotion.
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 CinéO-Capture/1.0",
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  await seed(page);

  // Bootstrap : visite la home une 1re fois pour que ProjectGate charge les
  // projets (Supabase mock retourne le projet de démo) et hydrate les stores.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const results = [];

  // 01 Aujourd'hui (route /)
  results.push({ file: "01-today.png", ok: await capture(page, "/", "01-today.png") });

  // 02 Today scrolled : capture la richesse de la feuille de service
  // (notes par département, séquence en cours, planning du jour).
  results.push({
    file: "02-pointage.png",
    ok: await capture(page, "/", "02-pointage.png", {
      beforeShot: async (p) => {
        await p.evaluate(() => {
          // Cherche "SÉQUENCE EN COURS" ou tout autre repère de la moitié basse
          const node = document.evaluate(
            "//*[contains(text(), 'SÉQUENCE EN COURS') or contains(text(), 'Séq.')]",
            document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
          ).singleNodeValue;
          if (node) (node).scrollIntoView({ block: "start", behavior: "instant" });
          else window.scrollTo({ top: 900, behavior: "instant" });
        });
      },
    }),
  });

  // 03 Departments grid
  results.push({ file: "03-departments.png", ok: await capture(page, "/departments", "03-departments.png") });

  // 04 Department detail (camera)
  results.push({ file: "04-department-dept.png", ok: await capture(page, "/departments/camera", "04-department-dept.png") });

  // 05 Calendrier
  results.push({ file: "05-calendar.png", ok: await capture(page, "/calendrier", "05-calendar.png") });

  // 06 Cantine
  results.push({ file: "06-cantine.png", ok: await capture(page, "/cantine", "06-cantine.png") });

  // 07 Heures (onglet saisie par défaut)
  results.push({ file: "07-heures.png", ok: await capture(page, "/heures", "07-heures.png") });

  // 08 Frais : ouvrir l'onglet "frais" (cible le bouton hors-nav)
  results.push({
    file: "08-frais.png",
    ok: await capture(page, "/heures", "08-frais.png", {
      beforeShot: async (p) => {
        await p.evaluate(() => {
          const btn = Array.from(document.querySelectorAll("button"))
            .find((b) => b.textContent?.trim().toLowerCase() === "frais" && !b.closest("nav"));
          if (btn) btn.click();
        });
      },
    }),
  });

  // 09 Admin dashboard
  results.push({ file: "09-admin-dashboard.png", ok: await capture(page, "/admin", "09-admin-dashboard.png") });

  // Helper : clique sur un onglet admin en ciblant les boutons à l'intérieur
  // du container "glass-card rounded-app p-1 flex gap-1" (sinon collision avec
  // la bottom nav). On cherche un match exact (trim) sur le textContent.
  const clickAdminTab = async (p, label) => {
    await p.waitForTimeout(400); // s'assure que l'admin panel est monté
    const clicked = await p.evaluate((lbl) => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const tabBtn = buttons.find((b) => {
        if (b.closest("nav")) return false;
        const txt = (b.textContent || "").trim();
        return txt === lbl;
      });
      if (tabBtn) {
        tabBtn.click();
        return true;
      }
      return false;
    }, label);
    if (!clicked) console.warn(`    clickAdminTab miss: ${label}`);
  };

  // 10 Admin Codes
  results.push({
    file: "10-admin-codes.png",
    ok: await capture(page, "/admin", "10-admin-codes.png", {
      beforeShot: async (p) => { await clickAdminTab(p, "Codes"); },
    }),
  });

  // 11 Admin Projet — on injecte aussi un projet dans le store via mock RPC
  results.push({
    file: "11-admin-project.png",
    ok: await capture(page, "/admin", "11-admin-project.png", {
      beforeShot: async (p) => {
        // Force le projet à apparaître dans le store : on appelle l'API
        // Supabase mockée pour charger les projets, puis on switch sur l'onglet.
        await p.evaluate(async () => {
          // Cherche un global supabase via les modules — fallback : fetch direct ne marchera pas.
          // À défaut, on attend simplement que ProjectGate ait fini de charger.
          await new Promise((r) => setTimeout(r, 800));
        });
        await clickAdminTab(p, "Projet");
      },
      wait: 1500,
    }),
  });

  // 12 Admin Heures (vue équipe)
  results.push({
    file: "12-admin-hours.png",
    ok: await capture(page, "/admin", "12-admin-hours.png", {
      beforeShot: async (p) => { await clickAdminTab(p, "Heures"); },
    }),
  });

  // 13 History
  results.push({ file: "13-history.png", ok: await capture(page, "/history", "13-history.png") });

  // 14 Documents
  results.push({ file: "14-documents.png", ok: await capture(page, "/documents", "14-documents.png") });

  console.log("\n[capture] results");
  for (const r of results) {
    console.log(`  ${r.ok ? "✓" : "✗"} ${r.file}`);
  }

  await browser.close();
  console.log("[capture] done.");
}

main().catch((e) => {
  console.error("[capture] FATAL", e);
  process.exit(1);
});
