"use client";

import { useRef, useState } from "react";
import {
  X, Camera, Loader2, AlertCircle, AlertTriangle, ReceiptText,
  ChevronLeft, Check, Car,
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────

export interface ExtractedFrais {
  date?: string;
  fournisseur?: string;
  nature?: string;
  montantTTC?: number;
  plaqueImmat?: string | null;
  // legacy fields kept for backwards compat
  montantTVA?: number;
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

const NATURES = ["Carburant", "Repas équipe", "Hôtel", "Péage", "Matériel", "Fournitures", "Transport", "Autre"] as const;
const INP = "bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 w-full";

// ── component ─────────────────────────────────────────────────────────────────

export function FraisImportModal({ onClose, onConfirm }: Props) {
  const [step, setStep] = useState<"capture" | "processing" | "review">("capture");
  const [ticket, setTicket] = useState<PhotoData | null>(null);
  const [extracted, setExtracted] = useState<ExtractedFrais>({});
  const [error, setError] = useState<string | null>(null);
  const [plaqueManuelle, setPlaqueManuelle] = useState("");
  const [plaqueIgnored, setPlaqueIgnored] = useState(false);
  const ticketRef = useRef<HTMLInputElement>(null);

  const naturesVehicule = ["Carburant", "Péage", "Transport"];
  const needsPlaque = naturesVehicule.includes(extracted.nature ?? "");
  const plaqueAbsente = needsPlaque && !extracted.plaqueImmat && !plaqueManuelle && !plaqueIgnored;
  const plaqueEffective = extracted.plaqueImmat ?? plaqueManuelle ?? null;

  async function handleCapture(file: File) {
    try {
      const data = await compressPhoto(file);
      setTicket(data);
      setError(null);
    } catch {
      setError("Impossible de lire l'image.");
    }
  }

  async function analyse() {
    if (!ticket) return;
    setError(null);
    setStep("processing");
    try {
      const body = { ticketBase64: ticket.base64, ticketMime: ticket.mime };
      const res  = await fetch("/api/extract-frais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { result?: ExtractedFrais; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? `Erreur ${res.status}`);

      const result = json.result ?? {};
      setExtracted(result);
      setPlaqueManuelle(result.plaqueImmat ?? "");
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'analyse");
      setStep("capture");
    }
  }

  function field<K extends keyof ExtractedFrais>(k: K, v: ExtractedFrais[K]) {
    setExtracted((e) => ({ ...e, [k]: v }));
  }

  function confirm() {
    if (!ticket) return;
    onConfirm(
      { ...extracted, plaqueImmat: plaqueEffective },
      {
        ticketBase64: ticket.base64,
        ticketMime:   ticket.mime,
        ticketPreview: ticket.preview,
      }
    );
    onClose();
  }

  const canConfirm = !!extracted.fournisseur && (extracted.montantTTC ?? 0) > 0 && !plaqueAbsente;

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
              {step === "capture" ? "Scanner un justificatif"
                : step === "processing" ? "Analyse…"
                : "Vérifier les informations"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted p-1 -m-1"><X className="w-5 h-5" /></button>
        </div>

        {/* ── STEP : capture ──────────────────────────────────────────────── */}
        {step === "capture" && (
          <>
            <p className="text-xs text-muted leading-relaxed">
              Photographiez votre ticket ou facture. L&apos;IA extrait automatiquement
              le fournisseur, la nature, le montant TTC et la plaque d&apos;immatriculation.
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
                className="w-full rounded-2xl border-2 border-dashed border-cyan/40 flex flex-col items-center justify-center gap-2 py-10 active:scale-95 transition-transform"
                style={{ background: "rgba(0,224,208,0.05)" }}
              >
                <Camera className="w-8 h-8 text-cyan" />
                <p className="text-sm font-semibold text-cyan">Photographier le justificatif</p>
                <p className="text-xs text-muted">Ou importer depuis la galerie</p>
              </button>
            )}
            <input
              ref={ticketRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleCapture(f); e.target.value = ""; } }}
            />

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
            <p className="text-sm text-textSoft">Lecture du ticket en cours…</p>
            <p className="text-xs text-muted text-center px-4">
              L&apos;IA extrait le fournisseur, la nature et le montant
            </p>
          </div>
        )}

        {/* ── STEP : review ───────────────────────────────────────────────── */}
        {step === "review" && (
          <div className="space-y-3">
            <p className="text-xs text-muted">Corrigez si nécessaire.</p>

            {ticket && (
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img src={ticket.preview} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Plaque d'immatriculation — bloc critique */}
            <div className={`rounded-2xl p-3 space-y-2 border ${!extracted.plaqueImmat && !plaqueManuelle ? "border-amber-400/40 bg-amber-400/5" : "border-stroke bg-white/3"}`}>
              <div className="flex items-center gap-1.5">
                <Car className={`w-4 h-4 shrink-0 ${!extracted.plaqueImmat && !plaqueManuelle ? "text-amber-400" : "text-cyan"}`} />
                <p className={`text-xs font-semibold ${!extracted.plaqueImmat && !plaqueManuelle ? "text-amber-300" : "text-white"}`}>
                  Plaque d&apos;immatriculation
                </p>
              </div>

              {extracted.plaqueImmat ? (
                <p className="text-sm font-mono font-bold text-cyan">{extracted.plaqueImmat}</p>
              ) : (
                <>
                  {!plaqueIgnored && (
                    <>
                      <p className="text-[10px] text-amber-300 leading-relaxed">
                        Non détectée sur le document. La plaque est requise par la production.
                        Vérifiez le document ou saisissez-la.
                      </p>
                      <input
                        type="text"
                        value={plaqueManuelle}
                        onChange={(e) => setPlaqueManuelle(e.target.value.toUpperCase())}
                        className={INP}
                        placeholder="HA 010 EP"
                        autoComplete="off"
                      />
                      <button
                        onClick={() => setPlaqueIgnored(true)}
                        className="text-[10px] text-muted underline underline-offset-2"
                      >
                        Le document n&apos;est pas un frais véhicule — ignorer
                      </button>
                    </>
                  )}
                  {plaqueIgnored && (
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted">Sans plaque — frais non-véhicule</p>
                      <button onClick={() => setPlaqueIgnored(false)} className="text-[10px] text-cyan">
                        Annuler
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="text-[10px] text-muted block mb-0.5">Date</label>
              <input type="date" value={extracted.date ?? ""} onChange={(e) => field("date", e.target.value)} className={INP} />
            </div>

            {/* Fournisseur */}
            <div>
              <label className="text-[10px] text-muted block mb-0.5">Fournisseur *</label>
              <input
                type="text"
                value={extracted.fournisseur ?? ""}
                onChange={(e) => field("fournisseur", e.target.value)}
                className={INP}
                placeholder="STATION TOTAL, IBIS HOTELS…"
              />
            </div>

            {/* Nature */}
            <div>
              <label className="text-[10px] text-muted block mb-0.5">Nature de la dépense *</label>
              <select value={extracted.nature ?? ""} onChange={(e) => field("nature", e.target.value)} className={INP}>
                <option value="">Choisir…</option>
                {NATURES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Montant TTC */}
            <div>
              <label className="text-[10px] text-muted block mb-0.5">Montant TTC (€) *</label>
              <input
                type="text"
                inputMode="decimal"
                value={extracted.montantTTC !== undefined ? String(extracted.montantTTC) : ""}
                onChange={(e) => field("montantTTC", parseFloat(e.target.value.replace(",", ".")) || undefined)}
                className={`${INP} text-lg font-bold text-cyan`}
                placeholder="0.00"
              />
            </div>

            {/* Avertissement si données incomplètes */}
            {plaqueAbsente && (
              <div className="flex items-start gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Saisissez la plaque d&apos;immatriculation ou confirmez que ce n&apos;est pas un frais véhicule.</span>
              </div>
            )}

            <button
              onClick={confirm}
              disabled={!canConfirm}
              className="active-pill w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Check className="w-4 h-4" /> Ajouter à la note de frais
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
