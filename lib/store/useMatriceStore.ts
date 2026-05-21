import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MatriceData, MatriceLigne } from "@/lib/types/matrice";

export const MAX_LIGNES = 18;

export interface MatriceScanMeta {
  id: string;
  ligneId: string;
  fournisseur?: string;
  nature?: string;
  montantTTC?: number;
  // previews not persisted (localStorage quota)
  ticketPreview?: string;
  facturePreview?: string;
}

export interface ExtractedForMatrice {
  date?: string;
  fournisseur?: string;
  montantTTC?: number;
  montantTVA?: number;
  nature?: string;
  lieu?: string;
  codePCG?: string;
}

function emptyLigne(): MatriceLigne {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split("T")[0]!,
    fournisseur: "",
    region: "",
    nature: "",
    recuperable: false,
    ttc: "",
    tva: "",
    codeComptable: "",
  };
}

const DEFAULT_DATA: MatriceData = {
  numero: "",
  dateReleve: new Date().toISOString().split("T")[0]!,
  regionGlobale: "Martinique",
  nom: "",
  departement: "PRODUCTION",
  emploi: "",
  lignes: [emptyLigne()],
};

interface MatriceState {
  data: MatriceData;
  scansMeta: MatriceScanMeta[];
  setField: <K extends keyof MatriceData>(k: K, v: MatriceData[K]) => void;
  setLigne: (id: string, update: Partial<MatriceLigne>) => void;
  addLigne: () => void;
  removeLigne: (id: string) => void;
  addLigneFromExtracted: (
    extracted: ExtractedForMatrice,
    preview?: { ticketPreview: string; facturePreview?: string }
  ) => void;
  resetLignes: () => void;
}

export const useMatriceStore = create<MatriceState>()(
  persist(
    (set, get) => ({
      data: DEFAULT_DATA,
      scansMeta: [],

      setField: (k, v) =>
        set((s) => ({ data: { ...s.data, [k]: v } })),

      setLigne: (id, update) =>
        set((s) => ({
          data: {
            ...s.data,
            lignes: s.data.lignes.map((l) => (l.id === id ? { ...l, ...update } : l)),
          },
        })),

      addLigne: () =>
        set((s) => {
          if (s.data.lignes.length >= MAX_LIGNES) return s;
          return { data: { ...s.data, lignes: [...s.data.lignes, emptyLigne()] } };
        }),

      removeLigne: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            lignes:
              s.data.lignes.length <= 1
                ? s.data.lignes
                : s.data.lignes.filter((l) => l.id !== id),
          },
        })),

      addLigneFromExtracted: (extracted, preview) =>
        set((s) => {
          const today = new Date().toISOString().split("T")[0]!;
          const newLine: MatriceLigne = {
            id: crypto.randomUUID(),
            date: extracted.date ?? today,
            fournisseur: extracted.fournisseur ?? "",
            region: extracted.lieu ?? s.data.regionGlobale,
            nature: extracted.nature ?? "",
            recuperable: false,
            ttc: extracted.montantTTC !== undefined ? String(extracted.montantTTC) : "",
            tva: extracted.montantTVA !== undefined ? String(extracted.montantTVA) : "",
            codeComptable: extracted.codePCG ?? "",
          };

          const lines = s.data.lignes;
          const firstEmptyIdx = lines.findIndex(
            (l) => !l.fournisseur && !(parseFloat(l.ttc) > 0)
          );

          const newLines =
            firstEmptyIdx >= 0
              ? lines.map((l, i) => (i === firstEmptyIdx ? newLine : l))
              : lines.length < MAX_LIGNES
              ? [...lines, newLine]
              : lines;

          const newScanMeta: MatriceScanMeta = {
            id: crypto.randomUUID(),
            ligneId: newLine.id,
            fournisseur: extracted.fournisseur,
            nature: extracted.nature,
            montantTTC: extracted.montantTTC,
            ticketPreview: preview?.ticketPreview,
            facturePreview: preview?.facturePreview,
          };

          return {
            data: { ...s.data, lignes: newLines },
            scansMeta: [...s.scansMeta, newScanMeta],
          };
        }),

      resetLignes: () =>
        set((s) => ({
          data: { ...s.data, lignes: [emptyLigne()] },
          scansMeta: [],
        })),
    }),
    {
      name: "cin-o-matrice-v1",
      version: 1,
      // Don't persist preview images to avoid localStorage quota issues
      partialize: (s) => ({
        data: s.data,
        scansMeta: s.scansMeta.map(({ ticketPreview: _, facturePreview: __, ...meta }) => meta),
      }),
    }
  )
);
