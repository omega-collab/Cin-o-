"use client";

import { useState } from "react";
import { Download, Printer, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import { getCategoryDef, PAYMENT_METHODS } from "@/lib/data/expenseCategories";
import type { ExpenseEntry } from "@/lib/types/expense";

type ExportPeriod = "semaine" | "mois" | "tout" | "custom";

function getRange(period: ExportPeriod, from: string, to: string) {
  const today = new Date().toISOString().split("T")[0]!;
  const monthStart = today.slice(0, 7) + "-01";
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now); monday.setDate(now.getDate() - day);
  const weekFrom = monday.toISOString().split("T")[0]!;
  switch (period) {
    case "semaine": return { from: weekFrom, to: today };
    case "mois":    return { from: monthStart, to: today };
    case "tout":    return { from: "2000-01-01", to: "2099-12-31" };
    default:        return { from, to };
  }
}

function filterEntries(entries: ExpenseEntry[], from: string, to: string) {
  return entries.filter((e) => e.date >= from && e.date <= to).sort((a, b) => a.date.localeCompare(b.date));
}

function toCSV(entries: ExpenseEntry[]): string {
  const header = ["Date", "Catégorie", "Description", "HT (€)", "TVA (%)", "TVA (€)", "TTC (€)", "Règlement", "Justificatif", "Notes", "Alertes"].join(";");
  const rows = entries.map((e) => {
    const cat = getCategoryDef(e.category).label;
    const pay = PAYMENT_METHODS.find((p) => p.value === e.paymentMethod)?.label ?? e.paymentMethod;
    const tva = (e.amountTTC - e.amountHT).toFixed(2);
    const flags = e.flags.map((f) => f.message).join(" | ");
    const hasReceipt = e.receiptUri ? "Oui" : "Non";
    return [e.date, cat, e.description, e.amountHT.toFixed(2), e.vatRate, tva, e.amountTTC.toFixed(2), pay, hasReceipt, e.notes ?? "", flags].join(";");
  });
  return [header, ...rows].join("\n");
}

export function ExpenseExport() {
  const entries = useExpenseStore((s) => s.entries);
  const [period, setPeriod] = useState<ExportPeriod>("mois");
  const [customFrom, setCustomFrom] = useState(new Date().toISOString().split("T")[0]!.slice(0, 7) + "-01");
  const [customTo,   setCustomTo]   = useState(new Date().toISOString().split("T")[0]!);

  const { from, to } = getRange(period, customFrom, customTo);
  const filtered = filterEntries(entries, from, to);
  const totalHT  = filtered.reduce((s, e) => s + e.amountHT, 0);
  const totalTVA = filtered.reduce((s, e) => s + (e.amountTTC - e.amountHT), 0);
  const totalTTC = filtered.reduce((s, e) => s + e.amountTTC, 0);
  const hasErrors = filtered.some((e) => e.flags.some((f) => f.severity === "error"));

  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `notes-de-frais_${from}_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function printView() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rows = filtered.map((e) => {
      const cat = getCategoryDef(e.category).label;
      const flags = e.flags.length > 0 ? `<br><small style="color:#d97706">${e.flags.map((f) => f.message).join(" · ")}</small>` : "";
      return `<tr><td>${e.date}</td><td>${cat}</td><td>${e.description}${flags}</td><td style="text-align:right">${e.amountHT.toFixed(2)} €</td><td style="text-align:right">${e.vatRate} %</td><td style="text-align:right;font-weight:bold">${e.amountTTC.toFixed(2)} €</td><td>${e.receiptUri ? "Oui" : "—"}</td></tr>`;
    }).join("");
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Notes de frais</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px;padding:20px}
    table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border:1px solid #ddd;vertical-align:top}
    th{background:#f5f5f5;font-weight:bold}tfoot td{font-weight:bold;background:#f9f9f9}
    h1{font-size:18px;margin-bottom:4px}p{color:#666;margin:0 0 16px}</style></head>
    <body><h1>Notes de frais</h1><p>Période : ${from} → ${to} · ${filtered.length} dépense(s)</p>
    <table><thead><tr><th>Date</th><th>Catégorie</th><th>Description</th><th>HT</th><th>TVA</th><th>TTC</th><th>Just.</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="3">TOTAUX</td><td style="text-align:right">${totalHT.toFixed(2)} €</td><td style="text-align:right">${totalTVA.toFixed(2)} €</td><td style="text-align:right">${totalTTC.toFixed(2)} €</td><td></td></tr></tfoot>
    </table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  }

  const PERIODS: { id: ExportPeriod; label: string }[] = [
    { id: "semaine", label: "Semaine" },
    { id: "mois",    label: "Mois"    },
    { id: "tout",    label: "Tout"    },
    { id: "custom",  label: "Période" },
  ];

  return (
    <div className="space-y-4">
      {/* Sélection période */}
      <div>
        <label className="text-xs text-muted block mb-2">Période d&apos;export</label>
        <div className="flex gap-1.5">
          {PERIODS.map(({ id, label }) => (
            <button key={id} onClick={() => setPeriod(id)} className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${period === id ? "active-pill" : "glass-card text-muted"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {period === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted block mb-1">Du</label>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Au</label>
            <input type="date" value={customTo}   onChange={(e) => setCustomTo(e.target.value)}   className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
        </div>
      )}

      {/* Résumé */}
      {filtered.length > 0 && (
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <p className="text-xs text-muted font-semibold uppercase tracking-widest mb-3">Récapitulatif</p>
          <div className="flex justify-between text-xs"><span className="text-muted">Dépenses</span><span className="text-white">{filtered.length}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted">Total HT</span><span className="text-white">{totalHT.toFixed(2)} €</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted">TVA</span><span className="text-white">{totalTVA.toFixed(2)} €</span></div>
          <div className="flex justify-between text-sm border-t border-stroke/50 pt-2"><span className="text-white font-semibold">Total TTC</span><span className="text-cyan font-bold">{totalTTC.toFixed(2)} €</span></div>
          {hasErrors && (
            <p className="text-xs text-redSoft pt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Certaines dépenses ont des erreurs — vérifier avant d&apos;envoyer.
            </p>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-muted text-sm py-4">Aucune dépense sur cette période.</p>
      )}

      {/* Boutons export */}
      <div className="space-y-2">
        <button
          onClick={downloadCSV}
          disabled={filtered.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold glass-card text-textSoft disabled:opacity-30 active:scale-95 transition-transform"
        >
          <FileSpreadsheet className="w-4 h-4" /> Exporter en CSV
        </button>
        <button
          onClick={printView}
          disabled={filtered.length === 0}
          className="active-pill w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Printer className="w-4 h-4" /> Imprimer / Sauvegarder en PDF
        </button>
      </div>
    </div>
  );
}
