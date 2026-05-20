"use client";

import { useState, useMemo } from "react";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { formatTime } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/data/departments";
import type { HistoryEntry } from "@/lib/types";

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

  const groups = useMemo(
    () => groupEntriesByDate(filteredEntries),
    [filteredEntries]
  );

  if (!hydrated) {
    return (
      <div
        className="min-h-screen px-4 pt-6"
        style={{ backgroundColor: "#0B0C14" }}
      >
        <div
          className="h-8 w-40 rounded-lg animate-pulse mb-4"
          style={{ backgroundColor: "#13141F" }}
        />
        <div
          className="h-12 w-full rounded-xl animate-pulse"
          style={{ backgroundColor: "#13141F" }}
        />
      </div>
    );
  }

  // Stats derived from all entries (not filtered)
  const joursTournes = new Set(entries.map((e) => e.timestamp.slice(0, 10))).size;
  const incidents = entries.filter((e) =>
    e.action.toLowerCase().includes("incident")
  ).length;
  const rapports = entries.filter((e) =>
    e.action.toLowerCase().includes("rapport")
  ).length;

  return (
    <div
      className="min-h-screen px-4 pt-6 pb-10"
      style={{ backgroundColor: "#0B0C14" }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="font-bold"
          style={{ color: "#FFFFFF", fontSize: "24px" }}
        >
          Historique
        </h2>
        {entries.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs px-3 rounded-full transition-opacity active:opacity-60"
            style={{
              color: "rgba(255,255,255,0.4)",
              minHeight: "36px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Effacer
          </button>
        )}
      </div>

      {/* Stats pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { label: "Jours tournés", value: joursTournes, icon: "🎬" },
          { label: "Incidents", value: incidents, icon: "⚠️" },
          { label: "Rapports", value: rapports, icon: "📄" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full shrink-0"
            style={{
              backgroundColor: "#13141F",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span className="text-base leading-none">{stat.icon}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: "#FFFFFF" }}
            >
              {stat.value}
            </span>
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div
        className="flex items-center gap-2 px-4 mb-5 rounded-xl"
        style={{
          backgroundColor: "#13141F",
          border: "1px solid rgba(255,255,255,0.07)",
          minHeight: "48px",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
        >
          <circle
            cx="8.5"
            cy="8.5"
            r="5.75"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M13 13L17 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une action…"
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-white/25"
          style={{ color: "#FFFFFF" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs transition-opacity active:opacity-60"
            style={{ color: "rgba(255,255,255,0.35)", minHeight: "36px", minWidth: "36px" }}
            aria-label="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>

      {/* Empty state */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl leading-none" role="img" aria-label="horloge">
            🕐
          </span>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            {search ? "Aucun résultat trouvé" : "Aucune activité enregistrée"}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {groups.map(({ dateLabel, items }) => (
            <div key={dateLabel}>
              {/* Sticky date header */}
              <div
                className="sticky top-0 z-10 px-1 py-2 mb-1"
                style={{ backgroundColor: "#0B0C14" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {dateLabel}
                </p>
              </div>

              {/* Entries for this day */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  backgroundColor: "#13141F",
                }}
              >
                {items.map((entry, idx) => {
                  const dept = DEPARTMENTS.find(
                    (d) => d.slug === entry.department
                  );
                  const isLast = idx === items.length - 1;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 px-4 py-3"
                      style={{
                        borderBottom: isLast
                          ? "none"
                          : "1px solid rgba(255,255,255,0.05)",
                        minHeight: "56px",
                      }}
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
                        <p
                          className="text-sm font-medium leading-tight"
                          style={{ color: "#FFFFFF" }}
                        >
                          {entry.action}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {entry.departmentName} · {entry.details}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <span
                        className="text-xs shrink-0 mt-0.5"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
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
