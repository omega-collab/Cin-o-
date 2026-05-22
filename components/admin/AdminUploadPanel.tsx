"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, AlertCircle, Loader2, ClipboardList, Film, Map, TriangleAlert } from "lucide-react";
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

const DOC_SLOT_ICONS: Record<string, React.ElementType> = {
  feuille_service: ClipboardList,
  jour_a_jour: Film,
  implantation: Map,
};

const DOC_SLOTS: { type: UploadedDoc["type"]; required: boolean }[] = [
  { type: "feuille_service", required: true },
  { type: "jour_a_jour", required: true },
  { type: "implantation", required: false },
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

  // Par slot : marqué vrai 400ms après un touchend sur poubelle pour bloquer le ghost click iOS
  const touchDeletedSlots = useRef(new Set<string>());
  const [extracting, setExtracting] = useState(false);
  const [extractStep, setExtractStep] = useState<string | null>(null);
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

      // Remplace si un doc du même type existe déjà — lit le state courant (pas la closure)
      const currentDocs = useShootStore.getState().shoot.uploadedDocs;
      const existing = currentDocs.find((d) => d.type === type);
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
    setSkipped([]);
    setExtractionStatus("extracting");

    try {
      // Step 1: OCR each document individually (avoids 6MB Netlify payload limit)
      const texts: Array<{ text: string; filename: string; type: string }> = [];
      const skippedFiles: string[] = [];

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i]!;
        setExtractStep(`Lecture ${i + 1}/${docs.length} — ${doc.filename}…`);

        try {
          const ocrRes = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64: doc.base64 ?? "",
              mediaType: doc.mediaType ?? "application/pdf",
              filename: doc.filename,
            }),
          });

          let ocrJson: { text?: string; error?: string };
          try {
            ocrJson = await ocrRes.json() as typeof ocrJson;
          } catch {
            skippedFiles.push(`${doc.filename} — erreur serveur (${ocrRes.status})`);
            continue;
          }

          if (!ocrRes.ok || ocrJson.error) {
            skippedFiles.push(`${doc.filename} — ${ocrJson.error ?? `erreur ${ocrRes.status}`}`);
            continue;
          }

          if (ocrJson.text) {
            texts.push({ text: ocrJson.text, filename: doc.filename, type: doc.type });
          } else {
            skippedFiles.push(`${doc.filename} — texte vide après OCR`);
          }
        } catch {
          skippedFiles.push(`${doc.filename} — connexion échouée`);
        }
      }

      if (skippedFiles.length > 0) setSkipped(skippedFiles);

      if (texts.length === 0) {
        throw new Error(`Aucun document exploitable.${skippedFiles.length > 0 ? " " + skippedFiles[0] : ""}`);
      }

      // Step 2: Extract structured data from combined OCR text
      setExtractStep("Extraction des données par IA…");

      let extractRes: Response;
      try {
        extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts }),
        });
      } catch {
        throw new Error("Connexion échouée pendant l'extraction — vérifiez votre réseau.");
      }

      let extractJson: { result?: unknown; error?: string };
      try {
        extractJson = await extractRes.json() as typeof extractJson;
      } catch {
        const status = extractRes.status;
        if (status === 504 || status === 524 || status === 408) {
          throw new Error("Délai d'attente dépassé — le serveur a pris trop de temps. Réessayez.");
        }
        throw new Error(`Erreur serveur (${status}) — réessayez.`);
      }

      if (!extractRes.ok || extractJson.error) {
        throw new Error(extractJson.error ?? `Erreur extraction (${extractRes.status})`);
      }

      setPendingExtraction(extractJson.result as Parameters<typeof setPendingExtraction>[0]);
      setExtractionStatus("review");
      onNext();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
      setExtractionStatus("error", msg);
    } finally {
      setExtracting(false);
      setExtractStep(null);
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
              {(() => { const SlotIcon = DOC_SLOT_ICONS[slot.type] ?? ClipboardList; return <SlotIcon className={`w-5 h-5 shrink-0 ${loaded ? "text-cyan" : "text-muted"}`} />; })()}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${loaded ? "text-cyan" : "text-white"}`}>
                  {TYPE_LABELS[slot.type]}
                  {slot.required && <span className="text-danger ml-1 text-xs">*</span>}
                </p>
                <p className="text-xs text-muted truncate">
                  {loaded ? loaded.filename : TYPE_DESC[slot.type]}
                </p>
              </div>

              {loaded ? (
                <button
                  onTouchEnd={() => {
                    // Touch : marque ce slot pour 400ms afin de bloquer le ghost click iOS
                    touchDeletedSlots.current.add(slot.type);
                    setTimeout(() => touchDeletedSlots.current.delete(slot.type), 400);
                    if (ref?.current) ref.current.value = "";
                    removeDoc(loaded.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // iOS génère un click ~300ms après touchend — déjà traité ci-dessus
                    if (touchDeletedSlots.current.has(slot.type)) return;
                    if (ref?.current) ref.current.value = "";
                    removeDoc(loaded.id);
                  }}
                  className="text-muted hover:text-danger shrink-0 w-10 h-10 flex items-center justify-center -mr-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Ghost click iOS : le slot est encore marqué → ignorer
                    if (touchDeletedSlots.current.has(slot.type)) return;
                    ref?.current?.click();
                  }}
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
                className="text-xs text-danger font-semibold"
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
        <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-2xl">
          <TriangleAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-warning font-semibold">
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
        <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
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
            <span className="truncate">{extractStep ?? "Extraction en cours…"}</span>
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
