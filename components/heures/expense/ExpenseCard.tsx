"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Receipt } from "lucide-react";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import { getCategoryDef, PAYMENT_METHODS } from "@/lib/data/expenseCategories";
import type { ExpenseEntry, ExpenseFlag } from "@/lib/types/expense";

function FlagBadge({ flag }: { flag: ExpenseFlag }) {
  const cfg = {
    error:   { Icon: AlertCircle,   cls: "text-danger bg-red-500/10 border-red-500/20" },
    warning: { Icon: AlertTriangle, cls: "text-warning bg-orange-500/10 border-orange-500/20" },
    info:    { Icon: Info,          cls: "text-info bg-blue-500/10 border-blue-500/20" },
  }[flag.severity];
  const { Icon, cls } = cfg;
  return (
    <div className={`flex items-start gap-1.5 text-[10px] px-2 py-1 rounded-lg border ${cls}`}>
      <Icon className="w-3 h-3 shrink-0 mt-0.5" />
      <span>{flag.message}</span>
    </div>
  );
}

export function ExpenseCard({ entry }: { entry: ExpenseEntry }) {
  const [expanded, setExpanded] = useState(false);
  const deleteEntry = useExpenseStore((s) => s.deleteEntry);
  const cat = getCategoryDef(entry.category);
  const paymentLabel = PAYMENT_METHODS.find((p) => p.value === entry.paymentMethod)?.label ?? entry.paymentMethod;

  const worstSeverity = entry.flags.reduce<"" | "info" | "warning" | "error">((acc, f) => {
    if (f.severity === "error") return "error";
    if (f.severity === "warning" && acc !== "error") return "warning";
    if (f.severity === "info" && !acc) return "info";
    return acc;
  }, "");

  const flagColor = worstSeverity === "error" ? "border-red-500/40" : worstSeverity === "warning" ? "border-orange-500/40" : "";

  return (
    <div className={`glass-card rounded-2xl overflow-hidden ${flagColor ? `border ${flagColor}` : ""}`}>
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <cat.icon className="w-5 h-5 shrink-0 text-muted" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{entry.description}</p>
          <p className="text-[10px] text-muted mt-0.5">{cat.label} · {entry.date}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-white">{entry.amountTTC.toFixed(2)} €</p>
        </div>
        {entry.flags.length > 0 && (
          <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${
            worstSeverity === "error" ? "bg-red-500 text-white" : worstSeverity === "warning" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
          }`}>
            {entry.flags.length}
          </span>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0" />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-stroke/50">
          <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div><span className="text-muted">Règlement</span><p className="text-textSoft">{paymentLabel}</p></div>
          </div>

          {entry.notes && <p className="text-xs text-muted italic">{entry.notes}</p>}

          {/* Receipt */}
          {entry.receiptUri ? (
            <img src={entry.receiptUri} alt="Justificatif" className="w-full max-h-48 object-contain rounded-xl bg-white/5" />
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted py-2 px-3 rounded-xl bg-white/5">
              <Receipt className="w-3.5 h-3.5" /> Pas de justificatif
            </div>
          )}

          {/* Flags */}
          {entry.flags.length > 0 && (
            <div className="space-y-1">
              {entry.flags.map((f, i) => <FlagBadge key={i} flag={f} />)}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => deleteEntry(entry.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-danger bg-red-500/8 border border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> Supprimer cette dépense
          </button>
        </div>
      )}
    </div>
  );
}
