"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle, Check, Trash2, Plus } from "lucide-react";
import type { DepartmentSlug, StockItem } from "@/lib/types";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      res(result.split(",")[1] ?? "");
    };
    reader.onerror = () => rej(new Error(`Impossible de lire ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function detectMime(file: File): string {
  const map: Record<string, string> = {
    pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png", webp: "image/webp",
  };
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return map[ext] ?? "application/pdf";
}

const STATUS_OPTIONS: { value: StockItem["status"]; label: string }[] = [
  { value: "ok",  label: "OK" },
  { value: "low", label: "Faible" },
  { value: "out", label: "Épuisé" },
];

interface Props {
  slug: DepartmentSlug;
  onClose: () => void;
}

export function StockImportPanel({ slug, onClose }: Props) {
  const setStock = useDepartmentStore((s) => s.setStock);
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.size > 20 * 1024 * 1024) { setError("Fichier trop grand (max 20 Mo)"); return; }
    setLoading(true);
    setError(null);
    setFilename(file.name);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/extract-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType: detectMime(file), filename: file.name }),
      });
      const json = await res.json() as { items?: StockItem[]; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Erreur extraction");
      const extracted = (json.items ?? []).map((item, i) => ({
        ...item,
        id: crypto.randomUUID(),
        status: (item.status === "ok" || item.status === "low" || item.status === "out") ? item.status : "ok",
      } as StockItem));
      setItems(extracted);
      if (extracted.length === 0) setError("Aucun article détecté dans ce document.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function patchItem(id: string, key: keyof StockItem, val: string | number) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [key]: val } : it));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), name: "", quantity: 1, unit: "unité", status: "ok" }]);
  }

  function handleApply() {
    const emptyNames = items.filter((it) => !it.name.trim());
    if (emptyNames.length > 0) {
      setError(
        `${emptyNames.length} article${emptyNames.length > 1 ? "s" : ""} sans nom — renseignez-les ou supprimez-les.`
      );
      return;
    }
    setStock(slug, items);
    onClose();
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="glass-card border-2 border-dashed border-stroke hover:border-cyan/40 transition-colors rounded-app p-5 flex items-center gap-3 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-cyan animate-spin shrink-0" />
        ) : (
          <Upload className="w-5 h-5 text-muted shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium text-textSoft">
            {filename ?? "Importer la feuille de stock"}
          </p>
          <p className="text-xs text-muted">PDF, JPG, PNG — max 20 Mo</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Extracted items — editable */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            {items.length} article{items.length > 1 ? "s" : ""} détecté{items.length > 1 ? "s" : ""} — vérifiez avant d'appliquer
          </p>

          {items.map((it) => (
            <div key={it.id} className="glass-card rounded-2xl p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  value={it.name}
                  onChange={(e) => patchItem(it.id, "name", e.target.value)}
                  placeholder="Nom de l'équipement"
                  className="flex-1 bg-white/5 border border-stroke rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40"
                />
                <button onClick={() => removeItem(it.id)} className="text-muted hover:text-danger">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number" min={0}
                  value={it.quantity}
                  onChange={(e) => patchItem(it.id, "quantity", Number(e.target.value))}
                  className="w-20 bg-white/5 border border-stroke rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40"
                />
                <input
                  value={it.unit}
                  onChange={(e) => patchItem(it.id, "unit", e.target.value)}
                  placeholder="unité"
                  className="w-28 bg-white/5 border border-stroke rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40"
                />
                <select
                  value={it.status}
                  onChange={(e) => patchItem(it.id, "status", e.target.value)}
                  className="flex-1 bg-white/5 border border-stroke rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-appBg">{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-cyan pt-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter un article
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onClose}
          className="flex-1 glass-card rounded-2xl py-3 text-sm text-textSoft font-medium"
        >
          Annuler
        </button>
        <button
          onClick={handleApply}
          disabled={items.length === 0}
          className="flex-1 active-pill rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <Check className="w-4 h-4" />
          Appliquer ({items.length})
        </button>
      </div>
    </div>
  );
}
