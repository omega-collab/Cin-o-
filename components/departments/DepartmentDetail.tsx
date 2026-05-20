"use client";

import { useState } from "react";
import type { DepartmentSlug } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Modal } from "@/components/ui/Modal";

interface DepartmentDetailProps {
  slug: DepartmentSlug;
}

const STATUS_CONFIG = {
  ok: { label: "OK", bg: "rgba(0,212,180,0.15)", color: "#00D4B4" },
  low: { label: "Bas", bg: "rgba(251,146,60,0.15)", color: "#FB923C" },
  out: { label: "Vide", bg: "rgba(239,68,68,0.15)", color: "#EF4444" },
} as const;

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
    <div
      className="min-h-screen px-4 pt-6 pb-10"
      style={{ backgroundColor: "#0B0C14" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-5xl leading-none select-none">{dept.icon}</span>
        <div>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ color: "#FFFFFF" }}
          >
            {dept.name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            Gestion du matériel
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
        style={{ backgroundColor: "#1C1D2B" }}
      >
        <span className="text-lg">📦</span>
        <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
          {stock.length} article{stock.length > 1 ? "s" : ""} en stock
        </span>
      </div>

      {/* Stock list */}
      <div className="space-y-2 mb-6">
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Stock
        </h3>
        {stock.map((item) => {
          const pill = STATUS_CONFIG[item.status];
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
              style={{
                backgroundColor: "#13141F",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: "#FFFFFF" }}>
                  {item.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {item.quantity} {item.unit}
                  {item.notes ? ` · ${item.notes}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Status pill */}
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: pill.bg, color: pill.color }}
                >
                  {pill.label}
                </span>
                {/* Movement button */}
                <button
                  onClick={() => openModal(item.id)}
                  className="text-xs font-semibold px-3 rounded-full transition-opacity active:opacity-70"
                  style={{
                    backgroundColor: "#00D4B4",
                    color: "#0B0C14",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Mouvement
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent movements */}
      {recentMovements.length > 0 && (
        <div className="space-y-2">
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Mouvements récents
          </h3>
          {recentMovements.map((mov) => (
            <div
              key={mov.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: "#13141F" }}
            >
              <span className="text-base shrink-0">
                {mov.type === "out" ? "↗️" : "↙️"}
              </span>
              <span className="flex-1 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                {mov.itemName} × {mov.quantity}
              </span>
              <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                {mov.operator}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Movement modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enregistrer un mouvement"
        className="!bg-[#13141F] !rounded-2xl border border-white/10"
      >
        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["out", "in"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMovType(t)}
                className="flex-1 text-sm font-medium rounded-xl transition-all"
                style={{
                  minHeight: "44px",
                  backgroundColor:
                    movType === t ? "#00D4B4" : "rgba(255,255,255,0.06)",
                  color: movType === t ? "#0B0C14" : "rgba(255,255,255,0.6)",
                  border: "1px solid",
                  borderColor:
                    movType === t ? "#00D4B4" : "rgba(255,255,255,0.08)",
                }}
              >
                {t === "out" ? "↗ Sortie" : "↙ Retour"}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Quantité
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl px-4 text-sm focus:outline-none"
              style={{
                backgroundColor: "#1C1D2B",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: "44px",
              }}
            />
          </div>

          {/* Operator */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Opérateur
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="Nom prénom"
              className="w-full rounded-xl px-4 text-sm focus:outline-none placeholder:text-white/25"
              style={{
                backgroundColor: "#1C1D2B",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: "44px",
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Notes (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails…"
              className="w-full rounded-xl px-4 text-sm focus:outline-none placeholder:text-white/25"
              style={{
                backgroundColor: "#1C1D2B",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: "44px",
              }}
            />
          </div>

          {/* Confirm */}
          <button
            onClick={handleSubmit}
            className="w-full rounded-xl font-semibold text-sm transition-opacity active:opacity-80"
            style={{
              backgroundColor: "#00D4B4",
              color: "#0B0C14",
              minHeight: "52px",
            }}
          >
            Confirmer
          </button>
        </div>
      </Modal>
    </div>
  );
}
