"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DepartmentSlug } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { ArrowLeft, Search, Filter, Package, ArrowUpRight, ArrowDownLeft, Handshake, AlertOctagon, TriangleAlert, FileText } from "lucide-react";

const MOV_ICON: Record<string, React.ElementType> = {
  depart: ArrowUpRight, retour: ArrowDownLeft, reception: Package, emprunt: Handshake,
  casse: AlertOctagon, defectueux: TriangleAlert, note: FileText, in: ArrowDownLeft, out: ArrowUpRight,
};

const MOV_LABEL: Record<string, string> = {
  depart: "Départ", retour: "Retour", reception: "Réception",
  emprunt: "Emprunt", casse: "Casse", defectueux: "Défectueux", note: "Note",
  in: "Entrée", out: "Sortie",
};

function frDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  slug: DepartmentSlug;
}

export function DepartmentHistoryView({ slug }: Props) {
  const hydrated = useHydrated();
  const router = useRouter();
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  const allMovements = useDepartmentStore((s) => s.movements);
  const stock = useDepartmentStore((s) => s.stock[slug] ?? []);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const deptMovements = useMemo(
    () => allMovements.filter((m) => m.deptSlug === slug),
    [allMovements, slug]
  );

  const allTypes = useMemo(() => {
    const seen = new Set<string>();
    return deptMovements.map((m) => m.type).filter((t) => (seen.has(t) ? false : seen.add(t) && true));
  }, [deptMovements]);

  const filtered = useMemo(() => {
    return deptMovements.filter((m) => {
      const matchType = filterType === "all" || m.type === filterType;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.itemName.toLowerCase().includes(q) ||
        m.operator.toLowerCase().includes(q) ||
        (m.notes?.toLowerCase().includes(q) ?? false);
      return matchType && matchSearch;
    });
  }, [deptMovements, filterType, search]);

  if (!hydrated || !dept) return null;

  return (
    <div className="min-h-screen px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="glass-card w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4 text-textSoft" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">
            {dept.icon} Historique — {dept.name}
          </h2>
          <p className="text-xs text-muted">{deptMovements.length} mouvement{deptMovements.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher article, opérateur, note…"
          className="w-full bg-white/5 border border-stroke rounded-2xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan/40"
        />
      </div>

      {/* Type filter */}
      {allTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          <button
            onClick={() => setFilterType("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterType === "all" ? "active-pill" : "glass-card text-textSoft"
            }`}
          >
            <Filter className="w-3 h-3 inline mr-1" />
            Tous
          </button>
          {allTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type === filterType ? "all" : type)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterType === type ? "active-pill" : "glass-card text-textSoft"
              }`}
            >
              {(() => { const I = MOV_ICON[type] ?? FileText; return <><I className="inline w-3.5 h-3.5 mr-1" />{MOV_LABEL[type] ?? type}</>; })()}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted mb-3">
        {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        {filterType !== "all" || search ? " (filtrés)" : ""}
      </p>

      {/* Movement list */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-app p-6 text-center">
          <p className="text-sm text-muted">Aucun mouvement trouvé.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((mov) => {
            const item = stock.find((s) => s.id === mov.itemId);
            return (
              <div key={mov.id} className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3">
                  {(() => { const I = MOV_ICON[mov.type] ?? FileText; return <I className="w-4 h-4 shrink-0 mt-0.5 text-muted" />; })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{mov.itemName}</p>
                      <span className="text-xs text-muted shrink-0">{frDateTime(mov.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-cyan font-medium">
                        {MOV_LABEL[mov.type] ?? mov.type}
                      </span>
                      <span className="text-xs text-muted">× {mov.quantity}</span>
                      {item && (
                        <span className="text-xs text-muted">→ stock : {item.quantity} {item.unit}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{mov.operator}</p>
                    {mov.notes && (
                      <p className="text-xs text-textSoft mt-1 italic">{mov.notes}</p>
                    )}
                  </div>
                </div>
                {mov.photo && (
                  <img
                    src={mov.photo}
                    alt="Photo"
                    className="w-full max-h-48 object-cover border-t border-stroke"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
