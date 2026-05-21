"use client";

import { useState } from "react";
import { Plus, List, Bot, Download, X, Table2 } from "lucide-react";
import { ExpenseForm }   from "./expense/ExpenseForm";
import { ExpenseList }   from "./expense/ExpenseList";
import { ExpenseBot }    from "./expense/ExpenseBot";
import { ExpenseExport } from "./expense/ExpenseExport";
import { MatriceForm }   from "./expense/MatriceForm";
import { useExpenseStore } from "@/lib/store/useExpenseStore";

type SubTab = "liste" | "bot" | "export" | "matrice";

export function FraisView() {
  const [subTab, setSubTab]     = useState<SubTab>("liste");
  const [showForm, setShowForm] = useState(false);
  const entries = useExpenseStore((s) => s.entries);
  const errorCount = entries.reduce((s, e) => s + e.flags.filter((f) => f.severity === "error").length, 0);

  const SUBTABS: { id: SubTab; label: string; Icon: React.ElementType }[] = [
    { id: "liste",   label: "Dépenses", Icon: List    },
    { id: "bot",     label: "Vérifier", Icon: Bot     },
    { id: "export",  label: "Exporter", Icon: Download },
    { id: "matrice", label: "Matrice",  Icon: Table2  },
  ];

  const showAddButton = subTab !== "matrice" && !showForm;

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

      {/* Bouton ajout (sauf onglet Matrice) */}
      {showAddButton && (
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
    </div>
  );
}
