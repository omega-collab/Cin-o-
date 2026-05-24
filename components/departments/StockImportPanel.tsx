"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle, Check, Trash2, Plus, FileText } from "lucide-react";
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

interface ProcessedFile {
  name: string;
  count: number;
  status: "done" | "error";
  error?: string;
}

interface Props {
  slug: DepartmentSlug;
  onClose: () => void;
}

export function StockImportPanel({ slug, onClose }: Props) {
  const setStock = useDepartmentStore((s) => s.setStock);
  const mergeStock = useDepartmentStore((s) => s.mergeStock);
  const existingCount = useDepartmentStore((s) => (s.stock[slug] ?? []).length);
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  // Default to "merge" — user's request: add to stock progressively
  const [mergeMode, setMergeMode] = useState<"merge" | "replace">("merge");

  async function processOne(file: File): Promise<{ items: StockItem[]; error?: string }> {
    if (file.size > 20 * 1024 * 1024) {
      return { items: [], error: "Fichier trop grand (max 20 Mo)" };
    }
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/extract-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType: detectMime(file), filename: file.name }),
      });
      const json = await res.json() as { items?: StockItem[]; error?: string };
      if (!res.ok || json.error) {
        return { items: [], error: json.error ?? `Erreur ${res.status}` };
      }
      const extracted = (json.items ?? []).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        status: (item.status === "ok" || item.status === "low" || item.status === "out") ? item.status : "ok",
      } as StockItem));
      return { items: extracted };
    } catch (err) {
      return { items: [], error: err instanceof Error ? err.message : "Erreur inconnue" };
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setLoading(true);
    setError(null);

    const processed: ProcessedFile[] = [];
    let allItems: StockItem[] = [...items];

    for (const file of list) {
      const { items: newItems, error: fileError } = await processOne(file);
      if (fileError) {
        processed.push({ name: file.name, count: 0, status: "error", error: fileError });
      } else {
        processed.push({ name: file.name, count: newItems.length, status: "done" });
        allItems = [...allItems, ...newItems];
      }
    }

    setProcessedFiles((prev) => [...prev, ...processed]);
    setItems(allItems);
    setLoading(false);

    if (processed.every((p) => p.status === "error")) {
      setError("Aucun fichier exploité.");
    } else if (allItems.length === 0) {
      setError("Aucun article détecté dans les documents importés.");
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

  function clearStaged() {
    setItems([]);
    setProcessedFiles([]);
    setError(null);
  }

  function handleApply() {
    const emptyNames = items.filter((it) => !it.name.trim());
    if (emptyNames.length > 0) {
      setError(
        `${emptyNames.length} article${emptyNames.length > 1 ? "s" : ""} sans nom — renseignez-les ou supprimez-les.`
      );
      return;
    }
    if (mergeMode === "merge") {
      mergeStock(slug, items);
    } else {
      setStock(slug, items);
    }
    onClose();
  }

  return (
    <div className="space-y-4">
      {/* Drop zone — multi-file */}
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
            {loading ? "Analyse en cours…" : "Importer une ou plusieurs feuilles"}
          </p>
          <p className="text-xs text-muted">
            PDF, JPG, PNG · max 20 Mo · imprimé ou manuscrit
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {/* Processed files list */}
      {processedFiles.length > 0 && (
        <div className="space-y-1">
          {processedFiles.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl ${
                f.status === "error"
                  ? "bg-danger/10 text-danger border border-danger/20"
                  : "bg-cyan/5 text-textSoft border border-stroke"
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="shrink-0 font-mono text-[10px]">
                {f.status === "error" ? f.error : `+${f.count}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Merge / Replace toggle */}
      {items.length > 0 && existingCount > 0 && (
        <div className="glass-card rounded-2xl p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            {existingCount} article{existingCount > 1 ? "s" : ""} déjà en stock — que faire ?
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setMergeMode("merge")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                mergeMode === "merge"
                  ? "bg-cyanSoft text-cyan border border-cyan/30"
                  : "bg-white/5 text-muted border border-stroke"
              }`}
            >
              Compléter
            </button>
            <button
              onClick={() => setMergeMode("replace")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                mergeMode === "replace"
                  ? "bg-warning/15 text-warning border border-warning/30"
                  : "bg-white/5 text-muted border border-stroke"
              }`}
            >
              Remplacer
            </button>
          </div>
          <p className="text-[10px] text-muted leading-relaxed">
            {mergeMode === "merge"
              ? "Les nouveaux articles s'ajoutent. Si un nom existe déjà, les quantités s'additionnent et le statut le plus restrictif est gardé."
              : "Le stock existant sera entièrement remplacé par cette liste."}
          </p>
        </div>
      )}

      {/* Extracted items — editable */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              {items.length} article{items.length > 1 ? "s" : ""} prêt{items.length > 1 ? "s" : ""} — vérifiez
            </p>
            <button
              onClick={clearStaged}
              className="text-[11px] text-muted underline"
            >
              Tout effacer
            </button>
          </div>

          {items.map((it) => (
            <div key={it.id} className="glass-card rounded-2xl p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  value={it.name}
                  onChange={(e) => patchItem(it.id, "name", e.target.value)}
                  placeholder="Nom de l'équipement"
                  className="flex-1 bg-white/5 border border-stroke rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40"
                />
                <button
                  onClick={() => removeItem(it.id)}
                  className="text-muted hover:text-danger"
                  aria-label="Supprimer cet article de la liste"
                >
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
            <Plus className="w-3.5 h-3.5" /> Ajouter un article manuellement
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
          disabled={items.length === 0 || loading}
          className="flex-1 active-pill rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <Check className="w-4 h-4" />
          {mergeMode === "merge" && existingCount > 0
            ? `Compléter (+${items.length})`
            : `Appliquer (${items.length})`}
        </button>
      </div>
    </div>
  );
}
