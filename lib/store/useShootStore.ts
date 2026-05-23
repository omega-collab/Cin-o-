"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FullShoot, ShootSequence, CastMember, DeptNote, PlacePoint, ShootAlert, AuditEntry, UploadedDoc, ExtractionResult, NextDayInfo } from "@/lib/types/shoot";
import type { DepartmentSlug } from "@/lib/types";
import { MOCK_SHOOT } from "@/lib/data/mockShoot";

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

  // Extraction
  setExtractionStatus: (status: FullShoot["extractionStatus"], error?: string) => void;
  setPendingExtraction: (result: ExtractionResult | null) => void;
  applyPendingExtraction: () => void;

  // Manual edits
  updateField: (patch: Partial<Omit<FullShoot, "sequences" | "cast" | "deptNotes" | "places" | "alerts" | "nextDays" | "auditLog" | "uploadedDocs">>) => void;
  setSequences: (seqs: ShootSequence[]) => void;
  setCast: (cast: CastMember[]) => void;
  setDeptNotes: (notes: DeptNote[]) => void;
  setPlaces: (places: PlacePoint[]) => void;
  setAlerts: (alerts: ShootAlert[]) => void;
  setNextDays: (days: NextDayInfo[]) => void;
  // Merge incoming PDT days with existing nextDays (preserves unknown dates,
  // excludes the current shoot.date). Use this when importing a PDT so earlier
  // imports of further-out days aren't wiped.
  mergeNextDays: (days: NextDayInfo[]) => void;

  // Publish
  publish: () => void;
  unpublish: () => void;

  // Dept codes
  setCodesEnabled: (v: boolean) => void;
  setDeptCodes: (codes: Partial<Record<DepartmentSlug, string>>) => void;

  // Reset
  resetToMock: () => void;
  resetFull: () => void;
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

      clearDocs: () =>
        set((s) => ({
          shoot: { ...s.shoot, uploadedDocs: [], extractionStatus: "idle", extractionError: undefined },
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
        set({
          shoot: {
            ...updated,
            extractionStatus: "done",
            auditLog: [
              ...updated.auditLog,
              makeAudit("Extraction appliquée", "upload", `${shoot.uploadedDocs.length} document(s)`),
            ],
          },
          pendingExtraction: null,
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

      publish: () =>
        set((s) => ({
          shoot: {
            ...s.shoot,
            isPublished: true,
            auditLog: [...s.shoot.auditLog, makeAudit("Feuille publiée", "publish")],
          },
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

      resetToMock: () =>
        set({ shoot: { ...MOCK_SHOOT, isPublished: false }, pendingExtraction: null }),

      resetFull: () =>
        set({ shoot: INITIAL, pendingExtraction: null }),
    }),
    {
      name: "cin-o-shoot",
      version: 3,
      partialize: (state) => ({
        pendingExtraction: null,
        shoot: {
          ...state.shoot,
          uploadedDocs: [],
          auditLog: state.shoot.auditLog.slice(-100),
        },
      }),
    }
  )
);
