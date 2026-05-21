"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExpenseEntry, ExpenseFlag, VatRate } from "@/lib/types/expense";

// ── Vérification automatique ────────────────────────────────────────────────
function runChecks(entry: ExpenseEntry, all: ExpenseEntry[]): ExpenseFlag[] {
  const flags: ExpenseFlag[] = [];
  const today = new Date().toISOString().split("T")[0]!;

  // Date dans le futur
  if (entry.date > today) {
    flags.push({ type: "future_date", severity: "error", message: "La date est dans le futur." });
  }

  // Justificatif manquant au-delà de 25 €
  if (entry.amountTTC > 25 && !entry.receiptUri) {
    flags.push({ type: "missing_receipt", severity: "warning", message: "Justificatif absent pour un montant > 25 €." });
  }

  // Doublon : même montant TTC + même date + même catégorie
  const dup = all.find(
    (e) => e.id !== entry.id && e.date === entry.date && e.amountTTC === entry.amountTTC && e.category === entry.category
  );
  if (dup) {
    flags.push({ type: "duplicate", severity: "error", message: "Doublon probable : même montant, même jour, même catégorie." });
  }

  // Montant rond suspect > 20 €
  if (entry.amountTTC > 20 && entry.amountTTC % 10 === 0) {
    flags.push({ type: "round_number", severity: "info", message: "Montant rond — vérifier que ce n'est pas une estimation." });
  }

  // Montant élevé > 500 €
  if (entry.amountTTC > 500) {
    flags.push({ type: "high_amount", severity: "warning", message: "Montant élevé (> 500 €) — vérifier la justification." });
  }

  // Incohérence TVA : écart > 0,10 € entre TTC calculé et TTC saisi
  const expectedTTC = Math.round(entry.amountHT * (1 + entry.vatRate / 100) * 100) / 100;
  if (entry.vatRate > 0 && Math.abs(expectedTTC - entry.amountTTC) > 0.1) {
    flags.push({ type: "vat_mismatch", severity: "error", message: `TVA incohérente : HT ${entry.amountHT} € × ${entry.vatRate}% = ${expectedTTC} € TTC attendu.` });
  }

  // Dépassement plafond journalier (200 € hors hébergement)
  if (entry.category !== "hebergement") {
    const sameDay = all.filter((e) => e.id !== entry.id && e.date === entry.date && e.category !== "hebergement");
    const dayTotal = sameDay.reduce((s, e) => s + e.amountTTC, 0) + entry.amountTTC;
    if (dayTotal > 200) {
      flags.push({ type: "daily_limit", severity: "info", message: `Total journalier hors hébergement dépasse 200 € (${dayTotal.toFixed(2)} €).` });
    }
  }

  return flags;
}

interface ExpenseState {
  entries: ExpenseEntry[];
  addEntry: (entry: Omit<ExpenseEntry, "id" | "flags" | "createdAt">) => void;
  updateEntry: (id: string, patch: Partial<Omit<ExpenseEntry, "id" | "createdAt">>) => void;
  deleteEntry: (id: string) => void;
  recheck: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (raw) => {
        const entry: ExpenseEntry = { ...raw, id: crypto.randomUUID(), flags: [], createdAt: new Date().toISOString() };
        const all = [...get().entries, entry];
        entry.flags = runChecks(entry, all);
        // Recalcule aussi les flags des autres entrées du même jour (ex: plafond)
        const rechecked = all.map((e) => e.id === entry.id ? entry : { ...e, flags: runChecks(e, all) });
        set({ entries: rechecked.sort((a, b) => b.date.localeCompare(a.date)) });
      },

      updateEntry: (id, patch) => {
        const prev = get().entries;
        const updated = prev.map((e) => e.id === id ? { ...e, ...patch } : e);
        const rechecked = updated.map((e) => ({ ...e, flags: runChecks(e, updated) }));
        set({ entries: rechecked });
      },

      deleteEntry: (id) => {
        const remaining = get().entries.filter((e) => e.id !== id);
        const rechecked = remaining.map((e) => ({ ...e, flags: runChecks(e, remaining) }));
        set({ entries: rechecked });
      },

      recheck: () => {
        const all = get().entries;
        set({ entries: all.map((e) => ({ ...e, flags: runChecks(e, all) })) });
      },
    }),
    {
      name: "cin-o-expenses",
      version: 1,
      // Ne pas stocker les receiptUri dans la clé principale pour éviter de dépasser
      // le quota localStorage — ils sont conservés dans l'entrée mais on limite à 50 entrées
      partialize: (s) => ({
        entries: s.entries.slice(0, 200),
      }),
    }
  )
);
