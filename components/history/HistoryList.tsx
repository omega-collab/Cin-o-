"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, FileText, TriangleAlert, Clock3, Pin, ChevronDown, ChevronUp, MapPin, Film, Users, UtensilsCrossed } from "lucide-react";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { formatTime } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DeptIcon } from "@/components/ui/DeptIcon";
import type { HistoryEntry } from "@/lib/types";
import type { ArchivedShoot } from "@/lib/types/shoot";

// ── Section journées archivées (Fin de journée admin) ─────────────────────────

function formatArchiveDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArchivedShootCard({ shoot }: { shoot: ArchivedShoot }) {
  const [open, setOpen] = useState(false);
  const archivedDate = formatArchiveDate(shoot.archivedAt);

  return (
    <div className="glass-card rounded-app overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-white/5 transition-colors"
      >
        <Film className="w-4 h-4 text-cyan shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {shoot.projectTitle || "Sans titre"} · J{shoot.shootingDay}
            {shoot.totalDays ? `/${shoot.totalDays}` : ""}
          </p>
          <p className="text-[11px] text-muted truncate">
            {archivedDate} · {shoot.sequences.length} séq. · {shoot.cast.length} comédien(s)
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-stroke/30">
          {shoot.location && (
            <div className="flex items-start gap-2 pt-3">
              <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
              <p className="text-xs text-textSoft">{shoot.location}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-muted uppercase tracking-wider">Call time</p>
              <p className="text-cyan font-mono font-semibold">{shoot.callTime || "—"}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-muted uppercase tracking-wider">Repas</p>
              <p className="text-textSoft font-mono">{shoot.mealTime || "—"}</p>
            </div>
            {shoot.wrapTime && (
              <div className="bg-white/5 rounded-lg px-2.5 py-1.5 col-span-2">
                <p className="text-[10px] text-muted uppercase tracking-wider">Fin prévue</p>
                <p className="text-textSoft font-mono">{shoot.wrapTime}</p>
              </div>
            )}
          </div>

          {shoot.sequences.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3 h-3" />
                Séquences ({shoot.sequences.length})
              </p>
              <ul className="space-y-1">
                {shoot.sequences.map((s) => (
                  <li key={s.id} className="text-xs text-textSoft flex items-start gap-2">
                    <span className="font-mono text-cyan shrink-0">{s.time}</span>
                    <span className="truncate">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {shoot.cast.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                Casting
              </p>
              <p className="text-xs text-textSoft leading-relaxed">
                {shoot.cast.map((c) => c.name).join(" · ")}
              </p>
            </div>
          )}

          {shoot.canteenMenu && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed className="w-3 h-3" />
                Menu du jour
              </p>
              <div className="text-xs text-textSoft space-y-0.5">
                {shoot.canteenMenu.starter && <p>Entrée : {shoot.canteenMenu.starter}</p>}
                {shoot.canteenMenu.main && <p>Plat : {shoot.canteenMenu.main}</p>}
                {shoot.canteenMenu.dessert && <p>Dessert : {shoot.canteenMenu.dessert}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  const archivedShoots = useShootStore((s) => s.shoot.archivedShoots ?? []);
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

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

  // "Jours terminés" = nombre de feuilles archivées via "Fin de journée"
  // dans l'admin. C'est plus fiable que de déduire depuis les actions stock
  // (qui pouvait compter à 0 si aucun dept n'avait fait d'action ce jour-là).
  const joursTournes = archivedShoots.length;
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
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-muted text-xs px-2 py-1"
            aria-label="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>

      {/* Journées archivées via "Fin de journée" Admin */}
      {archivedShoots.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
            Journées de tournage
          </p>
          <div className="space-y-2">
            {archivedShoots.map((shoot) => (
              <ArchivedShootCard key={shoot.id} shoot={shoot} />
            ))}
          </div>
        </div>
      )}

      {/* Stats glass-card */}
      <div className="glass-card rounded-app p-4 grid grid-cols-3 gap-3 text-center">
        {[
          { value: joursTournes, label: "Jours terminés", icon: <CheckCircle2 size={16} className="text-cyan mx-auto mb-1" /> },
          { value: incidents,    label: "Incidents",       icon: <TriangleAlert size={16} className="text-warning mx-auto mb-1" /> },
          { value: rapports,     label: "Rapports",        icon: <FileText size={16} className="text-info mx-auto mb-1" /> },
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
        <div className="flex justify-end gap-2">
          {confirmClear ? (
            <>
              <button
                onClick={() => setConfirmClear(false)}
                className="glass-card text-xs text-muted px-3 py-1.5 rounded-full"
              >
                Annuler
              </button>
              <button
                onClick={() => { clearHistory(); setConfirmClear(false); }}
                className="text-xs text-danger bg-danger/10 border border-danger/20 px-3 py-1.5 rounded-full font-semibold"
              >
                Confirmer la suppression
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="glass-card text-xs text-muted px-3 py-1.5 rounded-full border-stroke"
            >
              Effacer l&apos;historique
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Clock3 className="w-10 h-10 text-muted" />
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
                        className="text-muted shrink-0 mt-0.5"
                        aria-label={dept?.name ?? entry.departmentName}
                      >
                        {dept ? <DeptIcon slug={dept.slug} className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
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
