"use client";

import { useRef, useState } from "react";
import { X, Camera, Loader2, AlertCircle, ReceiptText, FileText, ChevronLeft, Check } from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────

export interface ExtractedFrais {
  date?: string;
  fournisseur?: string;
  montantTTC?: number;
  montantTVA?: number;
  nature?: string;
  lieu?: string;
  codePCG?: string;
}

export interface ScanPair {
  ticketBase64: string;
  ticketMime: string;
  ticketPreview: string;
  factureBase64?: string;
  factureMime?: string;
  facturePreview?: string;
}

interface PhotoData {
  base64: string;
  mime: string;
  preview: string;
}

interface Props {
  onClose: () => void;
  onConfirm: (extracted: ExtractedFrais, scan: ScanPair) => void;
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function compressPhoto(file: File): Promise<PhotoData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const preview = canvas.toDataURL("image/jpeg", 0.8);
        resolve({ base64: preview.split(",")[1] ?? "", mime: "image/jpeg", preview });
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const INP = "bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 w-full";

// ── component ─────────────────────────────────────────────────────────────────

export function FraisImportModal({ onClose, onConfirm }: Props) {
  const [step, setStep] = useState<"capture" | "processing" | "review">("capture");
  const [ticket, setTicket]   = useState<PhotoData | null>(null);
  const [facture, setFacture] = useState<PhotoData | null>(null);
  const [extracted, setExtracted] = useState<ExtractedFrais>({});
  const [error, setError]         = useState<string | null>(null);
  const [extractStep, setExtractStep] = useState<string | null>(null);
  const ticketRef  = useRef<HTMLInputElement>(null);
  const factureRef = useRef<HTMLInputElement>(null);

  async function handleCapture(file: File, type: "ticket" | "facture") {
    try {
      const data = await compressPhoto(file);
      if (type === "ticket") setTicket(data);
      else setFacture(data);
    } catch {
      setError("Impossible de lire l'image.");
    }
  }

  async function analyse() {
    if (!ticket) return;
    setError(null);
    setStep("processing");
    try {
      setExtractStep("Lecture du ticket en cours…");
      const body: Record<string, string> = { ticketBase64: ticket.base64, ticketMime: ticket.mime };
      if (facture) { body.factureBase64 = facture.base64; body.factureMime = facture.mime; }

      const res  = await fetch("/api/extract-frais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { result?: ExtractedFrais; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? `Erreur ${res.status}`);

      setExtracted(json.result ?? {});
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'analyse");
      setStep("capture");
    } finally {
      setExtractStep(null);
    }
  }

  function confirm() {
    if (!ticket) return;
    onConfirm(extracted, {
      ticketBase64: ticket.base64,
      ticketMime:   ticket.mime,
      ticketPreview: ticket.preview,
      factureBase64:  facture?.base64,
      factureMime:    facture?.mime,
      facturePreview: facture?.preview,
    });
    onClose();
  }

  function field<K extends keyof ExtractedFrais>(k: K, v: ExtractedFrais[K]) {
    setExtracted((e) => ({ ...e, [k]: v }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto"
        style={{ background: "oklch(0.14 0.02 220)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {step === "review" && (
              <button onClick={() => setStep("capture")} className="text-muted p-1 -ml-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <p className="text-sm font-bold text-white">
              {step === "capture" ? "Importer une dépense" : step === "processing" ? "Analyse…" : "Vérifier les données"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted p-1 -m-1"><X className="w-5 h-5" /></button>
        </div>

        {/* ── STEP : capture ──────────────────────────────────────────────── */}
        {step === "capture" && (
          <>
            <p className="text-xs text-muted leading-relaxed">
              Photographiez votre ticket CB (obligatoire) et la facture si disponible.
              L&apos;IA extrait automatiquement date, montant et fournisseur.
            </p>

            {/* Ticket CB */}
            <div>
              <p className="text-[10px] text-muted font-semibold uppercase tracking-widest mb-2">
                Ticket CB <span className="text-redSoft">*</span>
              </p>
              {ticket ? (
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img src={ticket.preview} alt="ticket" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setTicket(null)}
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 text-white active:scale-90 transition-transform"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-[10px] text-cyan font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
                    <ReceiptText className="w-3 h-3" /> Ticket
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => ticketRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-cyan/40 flex flex-col items-center justify-center gap-2 py-8 active:scale-95 transition-transform"
                  style={{ background: "rgba(0,224,208,0.05)" }}
                >
                  <Camera className="w-7 h-7 text-cyan" />
                  <p className="text-sm font-semibold text-cyan">Photographier le ticket</p>
                  <p className="text-xs text-muted">Ou importer depuis la galerie</p>
                </button>
              )}
              <input
                ref={ticketRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleCapture(f, "ticket"); e.target.value = ""; } }}
              />
            </div>

            {/* Facture */}
            <div>
              <p className="text-[10px] text-muted font-semibold uppercase tracking-widest mb-2">
                Facture <span className="text-muted font-normal normal-case">(optionnel — améliore la TVA)</span>
              </p>
              {facture ? (
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img src={facture.preview} alt="facture" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFacture(null)}
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 text-white active:scale-90 transition-transform"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-[10px] text-orangeSoft font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
                    <FileText className="w-3 h-3" /> Facture
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => factureRef.current?.click()}
                  className="w-full rounded-2xl border border-dashed border-stroke bg-white/3 flex items-center justify-center gap-2 py-3.5 active:scale-95 transition-transform"
                >
                  <Camera className="w-4 h-4 text-muted" />
                  <p className="text-sm text-muted">Photographier la facture</p>
                </button>
              )}
              <input
                ref={factureRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleCapture(f, "facture"); e.target.value = ""; } }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-redSoft">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={analyse}
              disabled={!ticket}
              className="active-pill w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30"
            >
              Analyser avec l&apos;IA
            </button>
          </>
        )}

        {/* ── STEP : processing ───────────────────────────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-cyan animate-spin" />
            <p className="text-sm text-textSoft">{extractStep ?? "Extraction en cours…"}</p>
            <p className="text-xs text-muted text-center px-4">
              L&apos;IA lit vos photos et extrait les informations comptables
            </p>
          </div>
        )}

        {/* ── STEP : review ───────────────────────────────────────────────── */}
        {step === "review" && (
          <div className="space-y-3">
            <p className="text-xs text-muted">Corrigez si nécessaire avant d&apos;ajouter à la matrice.</p>

            {/* Previews */}
            <div className="flex gap-2">
              {ticket && (
                <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img src={ticket.preview} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-[9px] text-cyan font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Ticket</span>
                </div>
              )}
              {facture && (
                <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img src={facture.preview} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-[9px] text-orangeSoft font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Facture</span>
                </div>
              )}
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted block mb-0.5">Date</label>
                <input type="date" value={extracted.date ?? ""} onChange={(e) => field("date", e.target.value)} className={INP} />
              </div>
              <div>
                <label className="text-[10px] text-muted block mb-0.5">TTC (€)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={extracted.montantTTC !== undefined ? String(extracted.montantTTC) : ""}
                  onChange={(e) => field("montantTTC", parseFloat(e.target.value.replace(",", ".")) || undefined)}
                  className={INP}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted block mb-0.5">Fournisseur</label>
              <input type="text" value={extracted.fournisseur ?? ""} onChange={(e) => field("fournisseur", e.target.value)} className={INP} placeholder="TOTAL, IBIS…" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted block mb-0.5">TVA (€)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={extracted.montantTVA !== undefined ? String(extracted.montantTVA) : ""}
                  onChange={(e) => field("montantTVA", parseFloat(e.target.value.replace(",", ".")) || undefined)}
                  className={INP}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted block mb-0.5">Lieu</label>
                <input type="text" value={extracted.lieu ?? ""} onChange={(e) => field("lieu", e.target.value)} className={INP} placeholder="Paris" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted block mb-0.5">Nature de la dépense</label>
              <input type="text" value={extracted.nature ?? ""} onChange={(e) => field("nature", e.target.value)} className={INP} placeholder="Carburant, Repas…" />
            </div>

            <div>
              <label className="text-[10px] text-muted block mb-0.5">Code PCG</label>
              <input
                type="text"
                list="pcg-list"
                value={extracted.codePCG ?? ""}
                onChange={(e) => field("codePCG", e.target.value)}
                className={`${INP} font-mono`}
                placeholder="606300"
              />
            </div>

            <button
              onClick={confirm}
              className="active-pill w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Ajouter à la matrice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
