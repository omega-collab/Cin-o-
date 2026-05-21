"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { DepartmentSlug, MovementType } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Modal } from "@/components/ui/Modal";
import { StatusPill } from "@/components/ui/StatusPill";
import { StockImportPanel } from "./StockImportPanel";
import { Upload, Camera, X, Check, Search, Download, History } from "lucide-react";

interface DepartmentDetailProps {
  slug: DepartmentSlug;
}

const MOVEMENT_TYPES: { value: MovementType; label: string; icon: string; color: string }[] = [
  { value: "depart",     label: "Départ",      icon: "↗",  color: "text-cyan" },
  { value: "retour",     label: "Retour",       icon: "↙",  color: "text-green-400" },
  { value: "reception",  label: "Réception",    icon: "📦", color: "text-blue-400" },
  { value: "emprunt",    label: "Emprunt",      icon: "🤝", color: "text-purple-400" },
  { value: "casse",      label: "Casse",        icon: "💥", color: "text-redSoft" },
  { value: "defectueux", label: "Défectueux",   icon: "⚠️", color: "text-orangeSoft" },
  { value: "note",       label: "Note",         icon: "📝", color: "text-muted" },
];

const MOV_ICON: Record<string, string> = {
  depart: "↗️", retour: "↙️", reception: "📦", emprunt: "🤝",
  casse: "💥", defectueux: "⚠️", note: "📝", in: "↙️", out: "↗️",
};

const INPUT_CLS = "w-full rounded-2xl px-4 text-sm focus:outline-none bg-white/5 border border-stroke text-white min-h-[44px] placeholder:text-white/25";

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium mb-1.5 text-muted">{label}</label>{children}</div>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = () => rej(new Error("Erreur lecture fichier"));
    reader.readAsDataURL(file);
  });
}

export function DepartmentDetail({ slug }: DepartmentDetailProps) {
  const hydrated = useHydrated();
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  const stock = useDepartmentStore((s) => s.stock[slug] ?? []);
  const allMovements = useDepartmentStore((s) => s.movements);
  const addMovement = useDepartmentStore((s) => s.addMovement);
  const addHistory = useHistoryStore((s) => s.addEntry);
  const userRole = useUserStore((s) => s.role);
  const userDept = useUserStore((s) => s.department);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [movType, setMovType] = useState<MovementType>("depart");
  const [quantity, setQuantity] = useState(1);
  const [operator, setOperator] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [stockSearch, setStockSearch] = useState("");

  if (!hydrated || !dept) return null;

  const deptMovements = allMovements.filter((m) => m.deptSlug === slug);
  const recentMovements = deptMovements.slice(0, 8);

  const filteredStock = stockSearch.trim()
    ? stock.filter((item) =>
        item.name.toLowerCase().includes(stockSearch.trim().toLowerCase())
      )
    : stock;

  function openModal(itemId: string) {
    setSelectedItem(itemId);
    setMovType("depart");
    setQuantity(1);
    const deptName = dept?.name ?? "";
    setOperator(userRole && userDept === slug ? `${userRole} — ${deptName}` : "");
    setNotes("");
    setPhoto(null);
    setPhotoError(null);
    setModalOpen(true);
  }

  async function handlePhotoFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Photo trop grande (max 2 Mo)");
      return;
    }
    setPhotoError(null);
    const dataUrl = await fileToBase64(file);
    setPhoto(dataUrl);
  }

  function handleQuantityChange(raw: string) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    setQuantity(Math.max(0, Math.floor(n)));
  }

  function handleSubmit() {
    const item = stock.find((i) => i.id === selectedItem);
    if (!item || !dept) return;

    const typeLabel = MOVEMENT_TYPES.find((t) => t.value === movType)?.label ?? movType;

    addMovement(slug, {
      itemId: selectedItem,
      itemName: item.name,
      type: movType,
      quantity,
      operator: operator.trim() || "Inconnu",
      notes: notes || undefined,
      photo: photo ?? undefined,
    });
    addHistory({
      department: slug,
      departmentName: dept.name,
      action: typeLabel,
      details: `${item.name} × ${quantity} — ${operator.trim() || "Inconnu"}`,
    });
    setModalOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  function exportCSV() {
    const headers = ["Nom", "Quantité", "Unité", "Statut", "Notes"];
    const rows = stock.map((item) => [
      item.name,
      item.quantity,
      item.unit,
      item.status,
      item.notes ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-${slug}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-10">
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-cyan text-appBg text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-glow">
          <Check className="w-4 h-4" />
          Mouvement enregistré
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <span className="text-5xl leading-none select-none">{dept.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{dept.name}</h2>
            <p className="text-sm mt-0.5 text-muted">Gestion du matériel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stock.length > 0 && (
            <button
              onClick={exportCSV}
              className="glass-card flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-muted"
              title="Exporter le stock en CSV"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          )}
          <button
            onClick={() => setImportOpen(true)}
            className="glass-card flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-cyan"
          >
            <Upload className="w-3.5 h-3.5" />
            Importer
          </button>
        </div>
      </div>

      {importOpen && (
        <div className="mb-5">
          <StockImportPanel slug={slug} onClose={() => setImportOpen(false)} />
        </div>
      )}

      <div className="glass-card flex items-center gap-2 px-4 py-3 rounded-2xl mb-5">
        <span className="text-lg">📦</span>
        <span className="text-sm font-medium text-white">
          {stock.length} article{stock.length !== 1 ? "s" : ""} en stock
        </span>
      </div>

      {stock.length === 0 && (
        <div className="glass-card rounded-app p-6 text-center space-y-3 mb-5">
          <Upload className="w-8 h-8 text-muted mx-auto" />
          <div>
            <p className="text-sm font-semibold text-white">Aucun stock configuré</p>
            <p className="text-xs text-muted mt-1">
              Importez votre feuille de stock matériel pour commencer la traçabilité.
            </p>
          </div>
          <button
            onClick={() => setImportOpen(true)}
            className="active-pill px-4 py-2 text-sm font-semibold rounded-2xl"
          >
            Importer la feuille de stock
          </button>
        </div>
      )}

      {stock.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Stock</h3>
          </div>

          {/* D2: Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input
              type="search"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full bg-white/5 border border-stroke rounded-2xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan/40"
            />
          </div>

          <div className="space-y-2">
            {filteredStock.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">Aucun article trouvé.</p>
            ) : (
              filteredStock.map((item) => (
                <div key={item.id} className="glass-card flex items-center justify-between gap-3 p-4 rounded-2xl">
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
                      className="active-pill px-3 py-1.5 text-xs font-semibold rounded-xl"
                    >
                      Mouvement
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {recentMovements.length > 0 && (
        <div>
          {/* D3: header with "Voir tout" link */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Mouvements récents
            </h3>
            {deptMovements.length > 8 && (
              <Link
                href={`/departments/${slug}/history`}
                className="flex items-center gap-1 text-xs text-cyan"
              >
                <History className="w-3 h-3" />
                Tout voir ({deptMovements.length})
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {recentMovements.map((mov) => (
              <div key={mov.id} className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-base shrink-0">{MOV_ICON[mov.type] ?? "📝"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-textSoft">{mov.itemName}</span>
                    {mov.notes && (
                      <p className="text-xs text-muted truncate mt-0.5">{mov.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted shrink-0">{mov.operator}</span>
                </div>
                {mov.photo && (
                  <img
                    src={mov.photo}
                    alt="Photo du mouvement"
                    className="w-full max-h-48 object-cover border-t border-stroke"
                  />
                )}
              </div>
            ))}
          </div>
          {deptMovements.length > 8 && (
            <Link
              href={`/departments/${slug}/history`}
              className="mt-3 flex items-center justify-center gap-2 text-xs text-muted py-3 glass-card rounded-2xl"
            >
              <History className="w-3.5 h-3.5" />
              Historique complet — {deptMovements.length} mouvement{deptMovements.length > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enregistrer un mouvement"
        className="glass-card-strong !rounded-app border-stroke"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-1.5">
            {MOVEMENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setMovType(t.value)}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs border transition-all ${
                  movType === t.value
                    ? "border-cyan bg-cyanSoft text-cyan font-semibold"
                    : "border-stroke bg-white/5 text-textSoft"
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                <span className="leading-tight text-center">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Quantité">
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={INPUT_CLS}
              />
            </ModalField>
            <ModalField label="Opérateur">
              <input
                type="text"
                value={operator}
                placeholder="Nom prénom"
                maxLength={100}
                onChange={(e) => setOperator(e.target.value)}
                className={INPUT_CLS}
              />
            </ModalField>
          </div>

          <ModalField label="Note">
            <input
              type="text"
              value={notes}
              placeholder="Détails, référence, observations…"
              onChange={(e) => setNotes(e.target.value)}
              className={INPUT_CLS}
            />
          </ModalField>

          <ModalField label="Photo (optionnel — max 2 Mo)">
            {/* D4: show error when photo too large */}
            {photoError && (
              <p className="text-xs text-redSoft mb-1.5">{photoError}</p>
            )}
            {photo ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={photo} alt="Aperçu" className="w-full max-h-40 object-cover" />
                <button
                  onClick={() => { setPhoto(null); setPhotoError(null); }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full min-h-[44px] border border-dashed border-stroke rounded-2xl flex items-center justify-center gap-2 text-sm text-muted hover:border-cyan/40 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Ajouter une photo
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) void handlePhotoFile(e.target.files[0]); e.target.value = ""; }}
            />
          </ModalField>

          <button
            onClick={handleSubmit}
            className="active-pill w-full rounded-2xl font-semibold text-sm min-h-[52px]"
          >
            Confirmer
          </button>
        </div>
      </Modal>
    </div>
  );
}
