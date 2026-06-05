"use client";

import { useState } from "react";
import { PenLine, BarChart2, Euro, Scale, Receipt } from "lucide-react";
import { WorkDayForm } from "./WorkDayForm";
import { WorkDayHistory } from "./WorkDayHistory";
import { SalarySettings } from "./SalarySettings";
import { LegalInfo } from "./LegalInfo";
import { FraisView } from "./FraisView";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import { useWorkDaysSync } from "@/lib/hooks/useWorkDaysSync";

type Tab = "saisie" | "historique" | "salaire" | "frais" | "juridique";

export function HeuresView() {
  const [tab, setTab] = useState<Tab>("saisie");
  // Pull les workdays du user au mount de la page (RLS user-scope).
  // Les insertions hors-ligne dans le store local sont préservées par le merge.
  useWorkDaysSync();
  const errorCount = useExpenseStore((s) =>
    s.entries.reduce((n, e) => n + e.flags.filter((f) => f.severity === "error").length, 0)
  );

  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "saisie",     label: "Saisie",    Icon: PenLine   },
    { id: "historique", label: "Historique",Icon: BarChart2 },
    { id: "salaire",    label: "Salaire",   Icon: Euro      },
    { id: "frais",      label: "Frais",     Icon: Receipt   },
    { id: "juridique",  label: "Juridique", Icon: Scale     },
  ];

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-app p-1 flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              tab === id ? "active-pill" : "text-muted"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === "frais" && errorCount > 0 && (
              <span className="absolute top-1 right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                {errorCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "saisie"     && <WorkDayForm />}
      {tab === "historique" && <WorkDayHistory />}
      {tab === "salaire"    && <SalarySettings />}
      {tab === "frais"      && <FraisView />}
      {tab === "juridique"  && <LegalInfo />}
    </div>
  );
}
