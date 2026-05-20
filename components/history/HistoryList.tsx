"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, CheckCircle2, FileText } from "lucide-react";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { formatTime } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/data/departments";
import type { HistoryEntry } from "@/lib/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatGroupDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupEntriesByDate(
  entries: HistoryEntry[]
): Array<{ dateLabel: string; items: HistoryEntry[] }> {
  const map = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const day = entry.timestamp.slice(0, 10);
    const existing = map.get(day);
    if (existing) {
      existing.push(entry);
    } else {
      map.set(day, [entry]);
    }
  }
  return Array.from(map.entries()).map(([, items]) => {
    const first = items[0];
    return {
      dateLabel: first ? formatGroupDate(first.timestamp) : "",
      items,
    };
  });
}

// ── main component ────────────────────────────────────────────────────────────

export function HistoryList() {
  const hydrated = useHydrated();
  const entries = useHistoryStore((s) => s.entries);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const [search, setSearch] = useState("");

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.departmentName.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const groups = useMemo(() => groupEntriesByDate(filteredEntries), [filteredEntries]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-2xl h-12 animate-pulse" />
        <div className="glass-card rounded-app h-24 animate-pulse" />
        <div className="glass-card rounded-app h-40 animate-pulse" />
      </div>
    );
  }

  const joursTournes = new Set(entries.map((e) => e.timestamp.slice(0, 10))).size;
  const incidents = entries.filter((e) => e.action.toLowerCase().includes("incident")).length;
  const rapports = entries.filter((e) => e.action.toLowerCase().includes("rapport")).length;

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-2">
        <Search size={15} className="text-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une action…"
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted text-textSoft"
        />
        {search ? (
          <button
            onClick={() => setSearch("")}
            className="text-muted text-xs px-2 py-1"
            aria-label="Effacer"
          >
            ✕
          </button>
        ) : (
          <button className="bg-cyanSoft text-cyan rounded-xl p-1.5">
            <SlidersHorizontal size={14} />
          </button>
        )}
      </div>

      {/* Stats glass-card */}
      <div className="glass-card rounded-app p-4 grid grid-cols-3 gap-3 text-center">
        {[
          { value: joursTournes, label: "Jours terminés", icon: <CheckCircle2 size={16} className="text-cyan mx-auto mb-1" /> },
          { value: incidents,    label: "Incidents",       icon: <span className="text-base leading-none block mb-1">⚠️</span> },
          { value: rapports,     label: "Rapports",        icon: <FileText size={16} className="text-blueSoft mx-auto mb-1" /> },
        ].map((stat) => (
          <div key={stat.label}>
            {stat.icon}
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[11px] text-muted leading-tight mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Clear button */}
      {entries.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={clearHistory}
            className="glass-card text-xs text-muted px-3 py-1.5 rounded-full border-stroke"
          >
            Effacer l&apos;historique
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl leading-none" role="img" aria-label="horloge">🕐</span>
          <p className="text-sm text-muted">
            {search ? "Aucun résultat trouvé" : "Aucun historique"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(({ dateLabel, items }) => (
            <div key={dateLabel}>
              {/* Group header */}
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 px-1">
                {dateLabel}
              </p>

              {/* Group card */}
              <div className="glass-card rounded-app overflow-hidden">
                {items.map((entry, idx) => {
                  const dept = DEPARTMENTS.find((d) => d.slug === entry.department);
                  const isLast = idx === items.length - 1;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-3 p-4 min-h-[56px] ${
                        isLast ? "" : "border-b border-stroke/50"
                      }`}
                    >
                      {/* Dept icon */}
                      <span
                        className="text-xl shrink-0 leading-none mt-0.5 select-none"
                        role="img"
                        aria-label={dept?.name ?? entry.departmentName}
                      >
                        {dept?.icon ?? "📌"}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-tight">{entry.action}</p>
                        <p className="text-xs text-muted mt-0.5 truncate">
                          {entry.departmentName} · {entry.details}
                        </p>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-muted shrink-0 mt-0.5">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
