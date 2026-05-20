"use client";

import { useState } from "react";
import type { DepartmentSlug } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Modal } from "@/components/ui/Modal";
import { StatusPill } from "@/components/ui/StatusPill";

interface DepartmentDetailProps {
  slug: DepartmentSlug;
}

const INPUT_CLS = "w-full rounded-2xl px-4 text-sm focus:outline-none bg-white/5 border border-stroke text-white min-h-[44px]";
function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium mb-1.5 text-muted">{label}</label>{children}</div>;
}

export function DepartmentDetail({ slug }: DepartmentDetailProps) {
  const hydrated = useHydrated();
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  const stock = useDepartmentStore((s) => s.stock[slug] ?? []);
  const allMovements = useDepartmentStore((s) => s.movements);
  const addMovement = useDepartmentStore((s) => s.addMovement);
  const addHistory = useHistoryStore((s) => s.addEntry);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [movType, setMovType] = useState<"in" | "out">("out");
  const [quantity, setQuantity] = useState(1);
  const [operator, setOperator] = useState("");
  const [notes, setNotes] = useState("");

  if (!hydrated || !dept) return null;

  function openModal(itemId: string) {
    setSelectedItem(itemId);
    setMovType("out");
    setQuantity(1);
    setOperator("");
    setNotes("");
    setModalOpen(true);
  }

  function handleSubmit() {
    const item = stock.find((i) => i.id === selectedItem);
    if (!item || !dept) return;
    addMovement(slug, {
      itemId: selectedItem,
      itemName: item.name,
      type: movType,
      quantity,
      operator: operator || "Inconnu",
      notes,
    });
    addHistory({
      department: slug,
      departmentName: dept.name,
      action: movType === "out" ? "Sortie matériel" : "Retour matériel",
      details: `${item.name} × ${quantity} — ${operator || "Inconnu"}`,
    });
    setModalOpen(false);
  }

  const recentMovements = allMovements.slice(0, 5);

  return (
    <div className="min-h-screen px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-5xl leading-none select-none">{dept.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">{dept.name}</h2>
          <p className="text-sm mt-0.5 text-muted">Gestion du matériel</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="glass-card flex items-center gap-2 px-4 py-3 rounded-2xl mb-5">
        <span className="text-lg">📦</span>
        <span className="text-sm font-medium text-white">
          {stock.length} article{stock.length > 1 ? "s" : ""} en stock
        </span>
      </div>

      {/* Stock list */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted">
          Stock
        </h3>
        <div className="space-y-2">
          {stock.map((item) => (
            <div
              key={item.id}
              className="glass-card flex items-center justify-between gap-3 p-4 rounded-2xl"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.name}</p>
                <p className="text-xs mt-0.5 text-muted">
                  {item.quantity} {item.unit}
                  {item.notes ? ` · ${item.notes}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusPill status={item.status} />
                <button
                  onClick={() => openModal(item.id)}
                  className="active-pill px-3 py-1.5 text-xs font-semibold rounded-xl transition-opacity active:opacity-70"
                >
                  Mouvement
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent movements */}
      {recentMovements.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted">
            Mouvements récents
          </h3>
          <div className="space-y-2">
            {recentMovements.map((mov) => (
              <div
                key={mov.id}
                className="glass-card flex items-center gap-3 px-4 py-2.5 rounded-xl"
              >
                <span className="text-base shrink-0">
                  {mov.type === "out" ? "↗️" : "↙️"}
                </span>
                <span className="flex-1 text-sm text-textSoft">
                  {mov.itemName} × {mov.quantity}
                </span>
                <span className="text-xs text-muted shrink-0">{mov.operator}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movement modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enregistrer un mouvement"
        className="glass-card-strong !rounded-app border-stroke"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["out", "in"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMovType(t)}
                className={`flex-1 text-sm font-medium rounded-xl transition-all min-h-[44px] border ${
                  movType === t
                    ? "active-pill border-cyan"
                    : "border-stroke text-textSoft bg-white/5"
                }`}
              >
                {t === "out" ? "↗ Sortie" : "↙ Retour"}
              </button>
            ))}
          </div>

          <ModalField label="Quantité">
            <input type="number" min={1} value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={INPUT_CLS} />
          </ModalField>
          <ModalField label="Opérateur">
            <input type="text" value={operator} placeholder="Nom prénom"
              onChange={(e) => setOperator(e.target.value)}
              className={INPUT_CLS + " placeholder:text-white/25"} />
          </ModalField>
          <ModalField label="Notes (optionnel)">
            <input type="text" value={notes} placeholder="Détails…"
              onChange={(e) => setNotes(e.target.value)}
              className={INPUT_CLS + " placeholder:text-white/25"} />
          </ModalField>

          <button
            onClick={handleSubmit}
            className="active-pill w-full rounded-2xl font-semibold text-sm transition-opacity active:opacity-80 min-h-[52px]"
          >
            Confirmer
          </button>
        </div>
      </Modal>
    </div>
  );
}
