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

const MIME_NORMALIZE: Record<string, string> = {
  "application/pdf": "application/pdf",
  "application/x-pdf": "application/pdf",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/gif": "image/gif",
  "image/webp": "image/webp",
};

const EXT_MAP: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function detectMediaType(file: File): string {
  if (file.type) {
    const normalized = MIME_NORMALIZE[file.type.toLowerCase()];
    if (normalized) return normalized;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MAP[ext] ?? "application/pdf";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(",");
      res(parts[1] ?? "");
    };
    reader.onerror = () => rej(new Error(`Impossible de lire ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function AdminUploadPanel({ onNext }: { onNext: () => void }) {
  const { shoot, addDoc, removeDoc, clearDocs, setExtractionStatus, setPendingExtraction } = useShootStore();
  // Un input par slot pour forcer le type
  const inputRefs = {
    feuille_service: useRef<HTMLInputElement>(null),
    jour_a_jour: useRef<HTMLInputElement>(null),
    implantation: useRef<HTMLInputElement>(null),
  };
  const dropRef = useRef<HTMLInputElement>(null);

  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const docs = shoot.uploadedDocs;

  async function handleFiles(files: FileList, forcedType?: UploadedDoc["type"]) {
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      if (file.size > 20 * 1024 * 1024) {
        setError(`${file.name} dépasse 20 Mo.`);
        continue;
      }

      let base64: string;
      try {
        base64 = await fileToBase64(file);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur de lecture du fichier.");
        continue;
      }

      if (!base64) {
        setError(`Impossible de lire ${file.name} — fichier vide ou corrompu.`);
        continue;
      }

      const mediaType = detectMediaType(file);
      const type = forcedType ?? "feuille_service";

      // Remplace si un doc du même type existe déjà
      const existing = docs.find((d) => d.type === type);
      if (existing) removeDoc(existing.id);

      const doc: UploadedDoc = {
        id: crypto.randomUUID(),
        filename: file.name,
        type,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        base64,
        mediaType,
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
        type: d.type,
      }));

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docs: payload }),
      });

      const json = await res.json() as { result?: unknown; error?: string; skipped?: string[] };
      if (!res.ok || json.error) throw new Error(json.error ?? "Erreur extraction");

      // E4: display skipped files
      if (json.skipped && json.skipped.length > 0) setSkipped(json.skipped);

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
      {/* Slots par type */}
      <div className="space-y-2">
        {DOC_SLOTS.map((slot) => {
          const loaded = docs.find((d) => d.type === slot.type);
          const ref = inputRefs[slot.type as keyof typeof inputRefs];

          return (
            <div
              key={slot.type}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                loaded ? "bg-cyanSoft/20 border-cyan/30" : "glass-card border-stroke"
              }`}
            >
              <span className="text-xl shrink-0">{slot.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${loaded ? "text-cyan" : "text-white"}`}>
                  {TYPE_LABELS[slot.type]}
                  {slot.required && <span className="text-redSoft ml-1 text-xs">*</span>}
                </p>
                <p className="text-xs text-muted truncate">
                  {loaded ? loaded.filename : TYPE_DESC[slot.type]}
                </p>
              </div>

              {loaded ? (
                <button onClick={() => removeDoc(loaded.id)} className="text-muted hover:text-redSoft shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => ref?.current?.click()}
                  className="text-xs text-cyan glass-card px-2.5 py-1 rounded-lg shrink-0"
                >
                  Importer
                </button>
              )}

              {/* Input dédié à ce slot */}
              <input
                ref={ref}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files, slot.type);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Zone de drop générale */}
      {docs.length < 3 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => dropRef.current?.click()}
          className="glass-card rounded-app border-2 border-dashed border-stroke hover:border-cyan/40 transition-colors p-5 flex items-center gap-3 cursor-pointer"
        >
          <Upload className="w-5 h-5 text-muted shrink-0" />
          <div>
            <p className="text-sm text-textSoft font-medium">Déposer un document</p>
            <p className="text-xs text-muted">Ou cliquer — PDF, JPG, PNG — max 20 Mo</p>
          </div>
          <input
            ref={dropRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>
      )}

      {/* E5: two-step confirmation for clear */}
      {docs.length > 0 && (
        <div className="flex justify-end items-center gap-3">
          {confirmClear ? (
            <>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs text-muted"
              >
                Annuler
              </button>
              <button
                onClick={() => { clearDocs(); setConfirmClear(false); setSkipped([]); }}
                className="text-xs text-redSoft font-semibold"
              >
                Confirmer la suppression
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="text-xs text-muted">
              Tout effacer
            </button>
          )}
        </div>
      )}

      {/* E4: skipped files notice */}
      {skipped.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-orangeSoft/10 border border-orangeSoft/20 rounded-2xl">
          <span className="text-orangeSoft text-sm shrink-0">⚠️</span>
          <div>
            <p className="text-xs text-orangeSoft font-semibold">
              {skipped.length} fichier(s) ignoré(s) par l'OCR
            </p>
            <ul className="mt-1 space-y-0.5">
              {skipped.map((f) => (
                <li key={f} className="text-xs text-muted">{f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-redSoft/10 border border-redSoft/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-redSoft shrink-0 mt-0.5" />
          <p className="text-sm text-redSoft">{error}</p>
        </div>
      )}

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
