"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, FileText, Image, AlertCircle, Loader2 } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import type { UploadedDoc } from "@/lib/types/shoot";

const TYPE_LABELS: Record<UploadedDoc["type"], string> = {
  feuille_service: "Feuille de service",
  jour_a_jour: "Jour-à-jour",
  implantation: "Implantation",
  autre: "Autre",
};

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
      {/* Drop zone */}
      {docs.length < 3 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="glass-card rounded-app border-2 border-dashed border-stroke hover:border-cyan/40 transition-colors p-8 flex flex-col items-center gap-3 cursor-pointer"
        >
          <Upload className="w-8 h-8 text-muted" />
          <div className="text-center">
            <p className="text-sm text-textSoft font-medium">Déposer ou cliquer pour importer</p>
            <p className="text-xs text-muted mt-1">PDF, JPG, PNG — max 20 Mo · {3 - docs.length} emplacement(s) libre(s)</p>
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

      {/* Doc list */}
      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="glass-card rounded-app p-3 flex items-center gap-3">
              {doc.mediaType?.startsWith("image/") ? (
                <Image className="w-4 h-4 text-muted shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{doc.filename}</p>
                <select
                  value={doc.type}
                  onChange={(e) => {
                    const newType = e.target.value as UploadedDoc["type"];
                    useShootStore.setState((s) => ({
                      shoot: {
                        ...s.shoot,
                        uploadedDocs: s.shoot.uploadedDocs.map((d) =>
                          d.id === doc.id ? { ...d, type: newType } : d
                        ),
                      },
                    }));
                  }}
                  className="mt-1 text-xs bg-white/5 border border-stroke rounded-lg px-2 py-0.5 text-muted focus:outline-none"
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k} className="bg-appBg">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted shrink-0">
                {(doc.size / 1024).toFixed(0)} Ko
              </p>
              <button
                onClick={() => removeDoc(doc.id)}
                className="text-muted hover:text-redSoft shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => clearDocs()}
              className="glass-card text-muted text-xs px-3 py-1.5 rounded-full"
            >
              Tout supprimer
            </button>
          </div>
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
