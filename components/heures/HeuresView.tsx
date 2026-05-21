"use client";

import { useState } from "react";
import { PenLine, BarChart2, Euro, Scale } from "lucide-react";
import { WorkDayForm } from "./WorkDayForm";
import { WorkDayHistory } from "./WorkDayHistory";
import { SalarySettings } from "./SalarySettings";
import { LegalInfo } from "./LegalInfo";

type Tab = "saisie" | "historique" | "salaire" | "juridique";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "saisie",     label: "Saisie",      Icon: PenLine },
  { id: "historique", label: "Historique",  Icon: BarChart2 },
  { id: "salaire",    label: "Salaire",     Icon: Euro },
  { id: "juridique",  label: "Juridique",   Icon: Scale },
];

export function HeuresView() {
  const [tab, setTab] = useState<Tab>("saisie");

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-app p-1 flex gap-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              tab === id ? "active-pill" : "text-muted"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "saisie"     && <WorkDayForm />}
      {tab === "historique" && <WorkDayHistory />}
      {tab === "salaire"    && <SalarySettings />}
      {tab === "juridique"  && <LegalInfo />}
    </div>
  );
}
