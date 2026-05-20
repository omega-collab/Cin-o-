"use client";

import { useState } from "react";
import type { DepartmentSlug } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusPill } from "@/components/ui/StatusPill";

interface DepartmentDetailProps {
  slug: DepartmentSlug;
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
    setQuantity(1);
    setOperator("");
    setNotes("");
  }

  const recentMovements = allMovements.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{dept.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{dept.name}</h2>
          <p className="text-slate-500 text-sm">
            {stock.length} article{stock.length > 1 ? "s" : ""} en stock
          </p>
        </div>
      </div>

      {/* Stock list */}
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
          Stock
        </h3>
        {stock.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                <p className="text-slate-500 text-xs">
                  {item.quantity} {item.unit}
                  {item.notes && ` · ${item.notes}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusPill status={item.status} />
                <Button size="sm" variant="secondary" onClick={() => openModal(item.id)}>
                  Mouvement
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent movements */}
      {recentMovements.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
            Mouvements récents
          </h3>
          {recentMovements.map((mov) => (
            <div key={mov.id} className="text-sm flex gap-2 items-center text-slate-600">
              <span>{mov.type === "out" ? "↗️" : "↙️"}</span>
              <span className="flex-1">{mov.itemName} × {mov.quantity}</span>
              <span className="text-slate-400 text-xs">{mov.operator}</span>
            </div>
          ))}
        </div>
      )}

      {/* Movement modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enregistrer un mouvement">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["out", "in"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMovType(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  movType === t
                    ? "bg-purple-600 text-white border-purple-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t === "out" ? "↗️ Sortie" : "↙️ Retour"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantité
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Opérateur
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="Nom prénom"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Confirmer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
