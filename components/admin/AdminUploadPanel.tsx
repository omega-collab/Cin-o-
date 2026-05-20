"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import type { UploadedDoc } from "@/lib/types/shoot";

const TYPE_LABELS: Record<UploadedDoc["type"], string> = {
  feuille_service: "Feuille de service",
  jour_a_jour: "Jour-à-jour",
  implantation: "Implantation",
  autre: "Autre",
};

const TYPE_DESC: Record<UploadedDoc["type"], string> = {
  feuille_service: "Horaires, lieux, séquences, notes depts",
  jour_a_jour: "Détail scène par scène, casting précis",
  implantation: "Plan des lieux, distances, stationnement",
  autre: "",
};

const DOC_SLOTS: { type: UploadedDoc["type"]; icon: string; required: boolean }[] = [
  { type: "feuille_service", icon: "📋", required: true },
  { type: "jour_a_jour", icon: "🎬", required: true },
  { type: "implantation", icon: "🗺️", required: false },
];

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      res(result.split(",")[1] ?? "");
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

function guessDocType(filename: string): UploadedDoc["type"] {
  const name = filename.toLowerCase();
  if (name.includes("jour") || name.includes("jaj")) return "jour_a_jour";
  if (name.includes("implant") || name.includes("plan")) return "implantation";
  if (name.includes("feuille") || name.includes("service") || name.includes("fs")) return "feuille_service";
  return "feuille_service";
}

export function AdminUploadPanel({ onNext }: { onNext: () => void }) {
  const { shoot, addDoc, removeDoc, clearDocs, setExtractionStatus, setPendingExtraction } = useShootStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docs = shoot.uploadedDocs;

  async function handleFiles(files: FileList) {
    if (docs.length + files.length > 3) {
      setError("Maximum 3 documents.");
      return;
    }
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      if (file.size > 20 * 1024 * 1024) {
        setError(`${file.name} dépasse 20 Mo.`);
        continue;
      }
      const base64 = await fileToBase64(file);
      const doc: UploadedDoc = {
        id: crypto.randomUUID(),
        filename: file.name,
        type: guessDocType(file.name),
        uploadedAt: new Date().toISOString(),
        size: file.size,
        base64,
        mediaType: file.type || "application/pdf",
      };
      addDoc(doc);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }

  async function handleExtract() {
    if (docs.length === 0) return;
    setExtracting(true);
    setError(null);
    setExtractionStatus("extracting");

    try {
      const payload = docs.map((d) => ({
        base64: d.base64 ?? "",
        mediaType: d.mediaType ?? "application/pdf",
        filename: d.filename,
      }));

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docs: payload }),
      });

      const json = await res.json() as { result?: unknown; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Erreur extraction");

      setPendingExtraction(json.result as Parameters<typeof setPendingExtraction>[0]);
      setExtractionStatus("review");
      onNext();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
      setExtractionStatus("error", msg);
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Guide 3 documents */}
      <div className="space-y-2">
        {DOC_SLOTS.map((slot) => {
          const loaded = docs.find((d) => d.type === slot.type);
          return (
            <div
              key={slot.type}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                loaded
                  ? "bg-cyanSoft/20 border-cyan/30"
                  : "glass-card border-stroke"
              }`}
            >
              <span className="text-xl shrink-0">{slot.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${loaded ? "text-cyan" : "text-white"}`}>
                  {TYPE_LABELS[slot.type]}
                  {slot.required && <span className="text-redSoft ml-1 text-xs">*</span>}
                </p>
                <p className="text-xs text-muted truncate">{TYPE_DESC[slot.type]}</p>
              </div>
              {loaded ? (
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs text-muted truncate max-w-[80px]">{loaded.filename}</p>
                  <button onClick={() => removeDoc(loaded.id)} className="text-muted hover:text-redSoft">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-xs text-cyan glass-card px-2.5 py-1 rounded-lg shrink-0"
                >
                  Importer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Drop zone (si doc "autre" ou ajout supplémentaire) */}
      {docs.length < 3 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="glass-card rounded-app border-2 border-dashed border-stroke hover:border-cyan/40 transition-colors p-5 flex items-center gap-3 cursor-pointer"
        >
          <Upload className="w-5 h-5 text-muted shrink-0" />
          <div>
            <p className="text-sm text-textSoft font-medium">Déposer un document</p>
            <p className="text-xs text-muted">PDF, JPG, PNG — max 20 Mo</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Reset rapide */}
      {docs.length > 0 && (
        <div className="flex justify-end">
          <button onClick={() => clearDocs()} className="text-xs text-muted">
            Tout effacer
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-redSoft/10 border border-redSoft/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-redSoft shrink-0 mt-0.5" />
          <p className="text-sm text-redSoft">{error}</p>
        </div>
      )}

      {/* Extract button */}
      <button
        onClick={handleExtract}
        disabled={docs.length === 0 || extracting}
        className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
      >
        {extracting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Extraction en cours…
          </>
        ) : (
          "Extraire avec Claude AI"
        )}
      </button>

      {shoot.extractionStatus === "error" && (
        <p className="text-xs text-muted text-center">
          En cas d'échec, les données peuvent être saisies manuellement dans l'onglet Révision.
        </p>
      )}
    </div>
  );
}
