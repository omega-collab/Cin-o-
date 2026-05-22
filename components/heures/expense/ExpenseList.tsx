"use client";

import { useState } from "react";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import { ExpenseCard } from "./ExpenseCard";
import type { ExpenseEntry } from "@/lib/types/expense";

type Period = "jour" | "semaine" | "mois" | "tout";

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // lundi = 0
  const monday = new Date(now); monday.setDate(now.getDate() - day); monday.setHours(0,0,0,0);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().split("T")[0]!,
    to: sunday.toISOString().split("T")[0]!,
  };
}

function filterByPeriod(entries: ExpenseEntry[], period: Period): ExpenseEntry[] {
  const today = new Date().toISOString().split("T")[0]!;
  const { from, to } = getWeekBounds();
  const monthStart = today.slice(0, 7) + "-01";
  switch (period) {
    case "jour":    return entries.filter((e) => e.date === today);
    case "semaine": return entries.filter((e) => e.date >= from && e.date <= to);
    case "mois":    return entries.filter((e) => e.date >= monthStart);
    default:        return entries;
  }
}

function groupByDate(entries: ExpenseEntry[]): { date: string; items: ExpenseEntry[] }[] {
  const map = new Map<string, ExpenseEntry[]>();
  for (const e of entries) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function TotalsBar({ entries }: { entries: ExpenseEntry[] }) {
  const totalTTC = entries.reduce((s, e) => s + e.amountTTC, 0);
  const flags    = entries.reduce((s, e) => s + e.flags.filter((f) => f.severity === "error").length, 0);
  if (entries.length === 0) return null;
  return (
    <div className="glass-card rounded-2xl p-3 flex items-center justify-between text-xs">
      <span className="text-muted">{entries.length} dépense{entries.length > 1 ? "s" : ""}</span>
      <div className="flex items-center gap-3">
        {flags > 0 && (
          <span className="text-danger font-medium">{flags} erreur{flags > 1 ? "s" : ""}</span>
        )}
        <span className="text-white font-bold text-sm">{totalTTC.toFixed(2)} € TTC</span>
      </div>
    </div>
  );
}

export function ExpenseList() {
  const entries = useExpenseStore((s) => s.entries);
  const [period, setPeriod] = useState<Period>("tout");

  const filtered = filterByPeriod(entries, period);
  const groups   = groupByDate(filtered);

  const PERIODS: { id: Period; label: string }[] = [
    { id: "jour",    label: "Aujourd'hui" },
    { id: "semaine", label: "Semaine"     },
    { id: "mois",    label: "Mois"        },
    { id: "tout",    label: "Tout"        },
  ];

  return (
    <div className="space-y-3">
      {/* Period tabs */}
      <div className="glass-card rounded-xl p-0.5 flex gap-0.5">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPeriod(id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              period === id ? "active-pill" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <TotalsBar entries={filtered} />

      {groups.length === 0 ? (
        <p className="text-center text-muted text-sm py-8">Aucune dépense sur cette période.</p>
      ) : (
        groups.map(({ date, items }) => {
          const dayTotal = items.reduce((s, e) => s + e.amountTTC, 0);
          return (
            <div key={date} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted capitalize">
                  {formatDate(date)}
                </p>
                <p className="text-[10px] text-muted">{dayTotal.toFixed(2)} €</p>
              </div>
              {items.map((e) => <ExpenseCard key={e.id} entry={e} />)}
            </div>
          );
        })
      )}
    </div>
  );
}
