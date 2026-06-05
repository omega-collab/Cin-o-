"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FullShoot, ShootSequence, CastMember, DeptNote, PlacePoint, ShootAlert, AuditEntry, UploadedDoc, ExtractionResult, NextDayInfo, ArchivedShoot } from "@/lib/types/shoot";
import type { DepartmentSlug } from "@/lib/types";
import { MOCK_SHOOT } from "@/lib/data/mockShoot";
import { useCanteenStore } from "@/lib/store/useCanteenStore";

function makeAudit(action: string, source: AuditEntry["source"], details?: string): AuditEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    details,
    source,
  };
}

function applyExtraction(current: FullShoot, result: ExtractionResult): FullShoot {
  const patch: Partial<FullShoot> = {};

  if (result.projectTitle) patch.projectTitle = result.projectTitle.value;
  if (result.series) patch.series = result.series.value;
  if (result.shootingDay) patch.shootingDay = result.shootingDay.value;
  if (result.totalDays) patch.totalDays = result.totalDays.value;
  if (result.date) patch.date = result.date.value;
  if (result.location) patch.location = result.location.value;
  if (result.callTime) patch.callTime = result.callTime.value;
  if (result.patTime) patch.patTime = result.patTime.value;
  if (result.mealTime) patch.mealTime = result.mealTime.value;
  if (result.wrapTime) patch.wrapTime = result.wrapTime.value;
  if (result.weather) patch.weather = result.weather.value;
  if (result.logeLocation) patch.logeLocation = result.logeLocation.value;
  if (result.canteenLocation) patch.canteenLocation = result.canteenLocation.value;
  if (result.deptCallTimes) patch.deptCallTimes = result.deptCallTimes.value as Partial<Record<DepartmentSlug, string>>;
  if (result.sequences) patch.sequences = result.sequences.value;
  if (result.cast) patch.cast = result.cast.value;
  if (result.deptNotes) patch.deptNotes = result.deptNotes.value;
  if (result.places) patch.places = result.places.value;
  if (result.alerts) patch.alerts = result.alerts.value;

  // Merge nextDays: incoming data updates matching dates, unknown dates are kept.
  // This preserves calendar entries from earlier imports (J+4, J+5…) when a newer
  // sheet only mentions J+1 to J+3. The current shoot date is always excluded.
  if (result.nextDays) {
    const incoming = result.nextDays.value;
    const currentDate = patch.date ?? current.date;
    const incomingDates = new Set<string>(incoming.map((d) => d.date));
    const merged = [
      ...current.nextDays.filter(
        (d) => !incomingDates.has(d.date) && d.date !== currentDate
      ),
      ...incoming.filter((d) => d.date !== currentDate),
    ].sort((a, b) => a.date.localeCompare(b.date));
    patch.nextDays = merged;
  }

  return { ...current, ...patch };
}

interface ShootStore {
  shoot: FullShoot;
  pendingExtraction: ExtractionResult | null;

  // Doc management
  addDoc: (doc: UploadedDoc) => void;
  removeDoc: (id: string) => void;
  clearDocs: () => void;
  // Attach OCR text to an existing uploaded doc (after the first OCR pass)
  // so it can be reused for targeted re-extraction without re-OCR-ing.
  setDocOcrText: (id: string, ocrText: string) => void;

  // Extraction
  setExtractionStatus: (status: FullShoot["extractionStatus"], error?: string) => void;
  setPendingExtraction: (result: ExtractionResult | null) => void;
  applyPendingExtraction: () => void;

  // Manual edits
  updateField: (patch: Partial<Omit<FullShoot, "sequences" | "cast" | "deptNotes" | "places" | "alerts" | "nextDays" | "auditLog" | "uploadedDocs">>) => void;
  setSequences: (seqs: ShootSequence[]) => void;
  // Merge incoming { id, script } pairs into existing sequences. Used by
  // the "Re-extraire le texte jour-à-jour" admin button so a partial result
  // (some sequences matched, others not) updates only what changed.
  patchSequenceScripts: (scripts: { id: string; script: string }[]) => void;
  setCast: (cast: CastMember[]) => void;
  setDeptNotes: (notes: DeptNote[]) => void;
  setPlaces: (places: PlacePoint[]) => void;
  setAlerts: (alerts: ShootAlert[]) => void;
  setNextDays: (days: NextDayInfo[]) => void;
  // Merge incoming PDT days with existing nextDays (preserves unknown dates,
  // excludes the current shoot.date). Use this when importing a PDT so earlier
  // imports of further-out days aren't wiped.
  mergeNextDays: (days: NextDayInfo[]) => void;
  // Patch a single nextDay entry by date — used by the manual edit flow on
  // the calendar so the user can complete days that the PDT OCR missed.
  updateNextDay: (date: string, patch: Partial<NextDayInfo>) => void;

  // Publish
  publish: () => void;
  unpublish: () => void;

  // Dept codes
  setCodesEnabled: (v: boolean) => void;
  setDeptCodes: (codes: Partial<Record<DepartmentSlug, string>>) => void;

  // Project customization (permissions + accent colour). Accepte un patch
  // ou une fonction (current → patch) pour les updates atomiques (matrice).
  setCustomization: (
    patch:
      | Partial<NonNullable<FullShoot["customization"]>>
      | ((current: NonNullable<FullShoot["customization"]>) => Partial<NonNullable<FullShoot["customization"]>>)
  ) => void;

  // Reset
  resetToMock: () => void;
  resetFull: () => void;

  // Fin de journée : archive le shoot courant et reset les champs FDS
  // (séquences, cast, notes, alertes, lieux, dates, etc.) tout en préservant
  // archivedShoots, customization, codesEnabled, deptCodes et les stocks.
  // Reset aussi le menu cantine via useCanteenStore.
  endDay: (userId?: string) => void;
}

const INITIAL: FullShoot = {
  date: "",
  projectTitle: "",
  shootingDay: 1,
  location: "",
  callTime: "08:00",
  mealTime: "12:30",
  sequences: [],
  cast: [],
  deptNotes: [],
  places: [],
  alerts: [],
  nextDays: [],
  auditLog: [],
  isPublished: false,
  uploadedDocs: [],
  extractionStatus: "idle",
  codesEnabled: false,
  deptCodes: {},
  deptCallTimes: {},
  customization: {
    restrictionsEnabled: false, // OFF par défaut → app identique à avant
    permissions: {},
    accentColor: null,
  },
  archivedShoots: [],
};

export const useShootStore = create<ShootStore>()(
  persist(
    (set, get) => ({
      shoot: INITIAL,
      pendingExtraction: null,

      addDoc: (doc) =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            uploadedDocs: [...s.shoot.uploadedDocs, doc],
          },
        })),

      removeDoc: (id) =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            uploadedDocs: s.shoot.uploadedDocs.filter((d) => d.id !== id),
          },
        })),

      setDocOcrText: (id, ocrText) =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            uploadedDocs: s.shoot.uploadedDocs.map((d) =>
              d.id === id ? { ...d, ocrText } : d
            ),
          },
        })),

      clearDocs: () =>
        set((s) => ({
          shoot: { ...s.shoot, uploadedDocs: [], extractionStatus: "idle", extractionError: undefined },
          pendingExtraction: null,
        })),

      setExtractionStatus: (status, error) =>
        set((s) => ({
          shoot: { ...s.shoot, extractionStatus: status, extractionError: error },
        })),

      setPendingExtraction: (result) => set({ pendingExtraction: result }),

      applyPendingExtraction: () => {
        const { shoot, pendingExtraction } = get();
        if (!pendingExtraction) return;
        const updated = applyExtraction(shoot, pendingExtraction);
        // Keep `pendingExtraction` around after applying so the review screen
        // can still surface confidence badges next to each field. It is
        // cleared on publish (see AdminPublishPanel) or when the user starts
        // a new upload (clearDocs).
        set({
          shoot: {
            ...updated,
            extractionStatus: "done",
            auditLog: [
              ...updated.auditLog,
              makeAudit("Extraction appliquée", "upload", `${shoot.uploadedDocs.length} document(s)`),
            ],
          },
        });
      },

      updateField: (patch) =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            ...patch,
            auditLog: [...s.shoot.auditLog, makeAudit("Champ modifié manuellement", "manual", Object.keys(patch).join(", "))],
          },
        })),

      setSequences: (seqs) =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            sequences: seqs,
            auditLog: [...s.shoot.auditLog, makeAudit("Séquences mises à jour", "manual")],
          },
        })),

      patchSequenceScripts: (scripts) =>
        set((s) => {
          if (scripts.length === 0) return s;
          const byId = new Map(scripts.map((x) => [x.id, x.script]));
          const updated = s.shoot.sequences.map((seq) =>
            byId.has(seq.id) ? { ...seq, script: byId.get(seq.id) } : seq
          );
          return {
            shoot: {
              ...s.shoot,
              sequences: updated,
              auditLog: [
                ...s.shoot.auditLog,
                makeAudit("Texte jour-à-jour extrait", "upload", `${scripts.length} séquence(s)`),
              ],
            },
          };
        }),

      setCast: (cast) =>
        set((s) => ({
          shoot: { ...s.shoot, cast, auditLog: [...s.shoot.auditLog, makeAudit("Casting mis à jour", "manual")] },
        })),

      setDeptNotes: (notes) =>
        set((s) => ({
          shoot: { ...s.shoot, deptNotes: notes, auditLog: [...s.shoot.auditLog, makeAudit("Notes depts mises à jour", "manual")] },
        })),

      setPlaces: (places) =>
        set((s) => ({
          shoot: { ...s.shoot, places, auditLog: [...s.shoot.auditLog, makeAudit("Lieux mis à jour", "manual")] },
        })),

      setAlerts: (alerts) =>
        set((s) => ({
          shoot: { ...s.shoot, alerts, auditLog: [...s.shoot.auditLog, makeAudit("Alertes mises à jour", "manual")] },
        })),

      setNextDays: (days) =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            nextDays: days,
            auditLog: [...s.shoot.auditLog, makeAudit("PDT importé", "upload", `${days.length} jour(s)`)],
          },
        })),

      mergeNextDays: (incoming) =>
        set((s) => {
          const currentDate = s.shoot.date;
          const incomingDates = new Set<string>(incoming.map((d) => d.date));
          const merged = [
            ...s.shoot.nextDays.filter(
              (d) => !incomingDates.has(d.date) && d.date !== currentDate
            ),
            ...incoming.filter((d) => d.date !== currentDate),
          ].sort((a, b) => a.date.localeCompare(b.date));
          return {
            shoot: {
              ...s.shoot,
              nextDays: merged,
              auditLog: [...s.shoot.auditLog, makeAudit("PDT fusionné", "upload", `${incoming.length} jour(s)`)],
            },
          };
        }),

      updateNextDay: (date, patch) =>
        set((s) => {
          const exists = s.shoot.nextDays.some((d) => d.date === date);
          const updated = exists
            ? s.shoot.nextDays.map((d) => (d.date === date ? { ...d, ...patch, date } : d))
            : [
                ...s.shoot.nextDays,
                { date, shootingDay: 0, ...patch } as NextDayInfo,
              ].sort((a, b) => a.date.localeCompare(b.date));
          return {
            shoot: {
              ...s.shoot,
              nextDays: updated,
              auditLog: [...s.shoot.auditLog, makeAudit("Jour modifié manuellement", "manual", date)],
            },
          };
        }),

      publish: () =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            isPublished: true,
            auditLog: [...s.shoot.auditLog, makeAudit("Feuille publiée", "publish")],
          },
          // Extraction flow done — drop the confidence metadata
          pendingExtraction: null,
        })),

      unpublish: () =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            isPublished: false,
            auditLog: [...s.shoot.auditLog, makeAudit("Feuille dépubliée", "publish")],
          },
        })),

      setCodesEnabled: (v) =>
        set((s) => ({ shoot: { ...s.shoot, codesEnabled: v } })),

      setDeptCodes: (codes) =>
        set((s) => ({ shoot: { ...s.shoot, deptCodes: codes } })),

      setCustomization: (patch) =>
        set((s) => {
          const current = {
            restrictionsEnabled: s.shoot.customization?.restrictionsEnabled ?? false,
            permissions: s.shoot.customization?.permissions ?? {},
            accentColor: s.shoot.customization?.accentColor ?? null,
          };
          const resolved = typeof patch === "function" ? patch(current) : patch;
          return {
            shoot: { ...s.shoot, customization: { ...current, ...resolved } },
          };
        }),

      resetToMock: () =>
        set({ shoot: { ...MOCK_SHOOT, isPublished: false }, pendingExtraction: null }),

      resetFull: () =>
        set((s) => ({
          // Préserve l'historique des journées archivées même lors d'un
          // resetFull (ex: "Nouveau projet (tout effacer)" garde quand même
          // les jours déjà clôturés s'il y en a).
          shoot: { ...INITIAL, archivedShoots: s.shoot.archivedShoots ?? [] },
          pendingExtraction: null,
        })),

      endDay: (userId) =>
        set((s) => {
          const current = s.shoot;
          // Rien à archiver si pas de feuille → no-op
          if (!current.projectTitle && current.sequences.length === 0) {
            return s;
          }

          // Snapshot du menu cantine du jour (lu via getState pour éviter
          // d'introduire une dépendance circulaire entre les stores).
          const canteenState = useCanteenStore.getState();
          const m = canteenState.menu;
          const canteenMenu =
            m.starter || m.main || m.dessert || m.special
              ? {
                  starter: m.starter,
                  main: m.main,
                  dessert: m.dessert,
                  special: m.special,
                  mealTime: m.mealTime,
                  mealEndTime: m.mealEndTime,
                }
              : undefined;

          const archive: ArchivedShoot = {
            id: crypto.randomUUID(),
            archivedAt: new Date().toISOString(),
            archivedBy: userId,
            date: current.date,
            projectTitle: current.projectTitle,
            series: current.series,
            shootingDay: current.shootingDay,
            totalDays: current.totalDays,
            location: current.location,
            callTime: current.callTime,
            mealTime: current.mealTime,
            wrapTime: current.wrapTime,
            patTime: current.patTime,
            weather: current.weather,
            logeLocation: current.logeLocation,
            canteenLocation: current.canteenLocation,
            deptCallTimes: current.deptCallTimes,
            sequences: current.sequences,
            cast: current.cast,
            deptNotes: current.deptNotes,
            places: current.places,
            alerts: current.alerts,
            nextDays: current.nextDays,
            auditLog: current.auditLog,
            canteenMenu,
          };

          // Reset cantine pour le lendemain
          canteenState.resetMenu();

          return {
            shoot: {
              // Repart depuis INITIAL pour la FDS, mais préserve tout ce
              // qui est "configuration projet" (permissions, codes,
              // historique archivé).
              ...INITIAL,
              archivedShoots: [archive, ...(current.archivedShoots ?? [])],
              customization: current.customization,
              codesEnabled: current.codesEnabled,
              deptCodes: current.deptCodes,
              auditLog: [
                makeAudit(
                  "Fin de journée — feuille archivée",
                  "manual",
                  `${current.projectTitle || "Sans titre"} · J${current.shootingDay}`
                ),
              ],
            },
            pendingExtraction: null,
          };
        }),
    }),
    {
      name: "cin-o-shoot",
      version: 3,
      partialize: (state) => ({
        pendingExtraction: null,
        shoot: {
          ...state.shoot,
          // Drop heavy base64 payloads but preserve the OCR text so the
          // admin can re-extract the jour-à-jour script after a refresh.
          uploadedDocs: state.shoot.uploadedDocs.map((d) => ({
            id: d.id,
            filename: d.filename,
            type: d.type,
            uploadedAt: d.uploadedAt,
            size: d.size,
            ocrText: d.ocrText,
          })),
          auditLog: state.shoot.auditLog.slice(-100),
        },
      }),
    }
  )
);
