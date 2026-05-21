"use client";

import { useState } from "react";
import { Plus, List, Bot, Download, Table2, ScanLine } from "lucide-react";
import { ExpenseForm }   from "./expense/ExpenseForm";
import { ExpenseList }   from "./expense/ExpenseList";
import { ExpenseBot }    from "./expense/ExpenseBot";
import { ExpenseExport } from "./expense/ExpenseExport";
import { MatriceForm }   from "./expense/MatriceForm";
import { FraisImportModal } from "./expense/FraisImportModal";
import type { ExtractedFrais, ScanPair } from "./expense/FraisImportModal";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import { useMatriceStore } from "@/lib/store/useMatriceStore";
import { useFraisEntries } from "@/lib/hooks/useFraisEntries";
import type { ExpenseCategory, VatRate } from "@/lib/types/expense";

type SubTab = "liste" | "bot" | "export" | "matrice";

// ── PCG → ExpenseCategory mapping ─────────────────────────────────────────────

function pcgToCategory(pcg?: string, nature?: string): ExpenseCategory {
  if (pcg === "606300" || nature?.toLowerCase().includes("carburant")) return "carburant";
  if (pcg === "625700" || pcg === "625600" || nature?.toLowerCase().includes("repas")) return "repas";
  if (pcg === "625100" || nature?.toLowerCase().includes("hôtel") || nature?.toLowerCase().includes("hotel")) return "hebergement";
  if (pcg === "625800" || nature?.toLowerCase().includes("péage") || nature?.toLowerCase().includes("parking")) return "peage_parking";
  if (pcg === "625200" || nature?.toLowerCase().includes("transport") || nature?.toLowerCase().includes("taxi")) return "transport";
  if (pcg === "606100" || nature?.toLowerCase().includes("matériel") || nature?.toLowerCase().includes("fourniture")) return "materiel";
  return "divers";
}

function detectVatRate(montantTTC?: number, montantTVA?: number): VatRate {
  if (!montantTTC || !montantTVA || montantTTC === 0) return 20;
  const rate = Math.round((montantTVA / (montantTTC - montantTVA)) * 100);
  if (rate <= 1) return 0;
  if (rate >= 4 && rate <= 6) return 5.5;
  if (rate >= 9 && rate <= 11) return 10;
  return 20;
}

// ── component ─────────────────────────────────────────────────────────────────

export function FraisView() {
  const [subTab, setSubTab]     = useState<SubTab>("liste");
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const entries    = useExpenseStore((s) => s.entries);
  const addEntry   = useExpenseStore((s) => s.addEntry);
  const addLigneFromExtracted = useMatriceStore((s) => s.addLigneFromExtracted);
  const { addEntry: saveToSupabase } = useFraisEntries();

  const errorCount = entries.reduce((s, e) => s + e.flags.filter((f) => f.severity === "error").length, 0);

  const SUBTABS: { id: SubTab; label: string; Icon: React.ElementType }[] = [
    { id: "liste",   label: "Dépenses", Icon: List    },
    { id: "bot",     label: "Vérifier", Icon: Bot     },
    { id: "export",  label: "Exporter", Icon: Download },
    { id: "matrice", label: "Matrice",  Icon: Table2  },
  ];

  function handleImportConfirm(extracted: ExtractedFrais, scan: ScanPair) {
    const ttc = extracted.montantTTC ?? 0;
    const tva = extracted.montantTVA ?? 0;
    const ht  = Math.max(0, ttc - tva);
    const vatRate = detectVatRate(ttc, tva);
    const entryDate = extracted.date ?? new Date().toISOString().split("T")[0]!;

    // 1. Feed the matrice store (auto-fills the Matrice tab)
    addLigneFromExtracted(extracted, {
      ticketPreview: scan.ticketPreview,
      facturePreview: scan.facturePreview,
    });

    // 2. Store in expense store for compliance verification
    addEntry({
      date: entryDate,
      category: pcgToCategory(extracted.codePCG, extracted.nature),
      description: [extracted.fournisseur, extracted.nature].filter(Boolean).join(" — "),
      amountHT: ht,
      vatRate,
      amountTTC: ttc,
      paymentMethod: "cb",
      receiptUri: scan.ticketPreview,
      notes: extracted.lieu ? `Lieu : ${extracted.lieu}` : undefined,
    });

    // 3. Persist in Supabase (user-owned, RLS protected)
    void saveToSupabase({
      project_id: null,
      date: entryDate,
      fournisseur: extracted.fournisseur ?? "",
      nature: extracted.nature ?? "",
      montant_ttc: ttc,
      plaque_immat: extracted.plaqueImmat ?? null,
      releve_numero: null,
    });
  }

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="glass-card rounded-xl p-0.5 flex gap-0.5">
        {SUBTABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { setSubTab(id); setShowForm(false); }}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[11px] font-medium transition-all ${subTab === id ? "active-pill" : "text-muted"}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {id === "bot" && errorCount > 0 && (
              <span className="absolute top-1 right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                {errorCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions onglet Dépenses */}
      {subTab === "liste" && !showForm && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="active-pill flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
          >
            <ScanLine className="w-4 h-4" /> Scanner ticket
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold glass-card text-textSoft active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> Saisie manuelle
          </button>
        </div>
      )}

      {/* Bouton ajout (onglets Vérifier / Exporter) */}
      {subTab !== "liste" && subTab !== "matrice" && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="active-pill w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter une dépense
        </button>
      )}

      {/* Formulaire inline */}
      {showForm && subTab !== "matrice" && (
        <div className="glass-card rounded-2xl p-4">
          <ExpenseForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Contenu */}
      {subTab === "liste"   && <ExpenseList />}
      {subTab === "bot"     && <ExpenseBot />}
      {subTab === "export"  && <ExpenseExport />}
      {subTab === "matrice" && <MatriceForm />}

      {/* Import modal */}
      {showImport && (
        <FraisImportModal
          onClose={() => setShowImport(false)}
          onConfirm={handleImportConfirm}
        />
      )}
    </div>
  );
}
