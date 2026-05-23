"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FileSpreadsheet, Printer, PenLine, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import { useMatriceStore } from "@/lib/store/useMatriceStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { getCategoryDef, PAYMENT_METHODS } from "@/lib/data/expenseCategories";
import { MATRICE_DEPTS } from "@/lib/types/matrice";
import { escHtml } from "@/lib/utils";
import type { ExpenseEntry } from "@/lib/types/expense";
import type { DepartmentSlug } from "@/lib/types";

const DEPT_MAP: Partial<Record<DepartmentSlug, string>> = {
  camera: "CAMERA", electro: "ELECTRICITE", machino: "MACHINERIE", son: "SON",
  regie: "REGIE", deco: "DECORATION", hmc: "HMC", production: "PRODUCTION",
  cantine: "CANTINE", direction: "REALISATION",
};

const INPUT = "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40";

type ExportPeriod = "semaine" | "mois" | "tout" | "custom";

function getRange(period: ExportPeriod, from: string, to: string) {
  const today = new Date().toISOString().split("T")[0]!;
  const monthStart = today.slice(0, 7) + "-01";
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now); monday.setDate(now.getDate() - day);
  const weekFrom = monday.toISOString().split("T")[0]!;
  switch (period) {
    case "semaine": return { from: weekFrom, to: today };
    case "mois":    return { from: monthStart, to: today };
    case "tout":    return { from: "2000-01-01", to: "2099-12-31" };
    default:        return { from, to };
  }
}

function filterEntries(entries: ExpenseEntry[], from: string, to: string) {
  return entries.filter((e) => e.date >= from && e.date <= to).sort((a, b) => a.date.localeCompare(b.date));
}

function toCSV(entries: ExpenseEntry[]): string {
  const header = ["Date", "Catégorie", "Description", "HT (€)", "TVA (%)", "TVA (€)", "TTC (€)", "Règlement", "Justificatif", "Notes"].join(";");
  const rows = entries.map((e) => {
    const cat = getCategoryDef(e.category).label;
    const pay = PAYMENT_METHODS.find((p) => p.value === e.paymentMethod)?.label ?? e.paymentMethod;
    const tva = (e.amountTTC - e.amountHT).toFixed(2);
    return [e.date, cat, e.description, e.amountHT.toFixed(2), e.vatRate, tva, e.amountTTC.toFixed(2), pay, e.receiptUri ? "Oui" : "Non", e.notes ?? ""].join(";");
  });
  return [header, ...rows].join("\n");
}

// ── Signature pad ──────────────────────────────────────────────────────────────

function SignaturePad({ onSign, onClear, signed }: {
  onSign: (dataUrl: string) => void;
  onClear: () => void;
  signed: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  function getPos(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  const drawLine = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = "#00E0D0";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }, []);

  function startDraw(pos: { x: number; y: number }) {
    drawing.current = true;
    lastPos.current = pos;
  }

  function moveDraw(pos: { x: number; y: number }) {
    if (!drawing.current || !lastPos.current) return;
    drawLine(lastPos.current, pos);
    lastPos.current = pos;
  }

  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas) onSign(canvas.toDataURL("image/png"));
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5 text-muted" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            Signature électronique
          </span>
        </div>
        {signed && (
          <div className="flex items-center gap-1 text-[10px] text-success">
            <CheckCircle className="w-3 h-3" /> Signée
          </div>
        )}
      </div>

      <div
        className="relative rounded-xl overflow-hidden"
        style={{ border: signed ? "1.5px solid rgba(34,197,94,0.5)" : "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", height: 100 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onMouseDown={(e) => startDraw(getPos(e.currentTarget, e.clientX, e.clientY))}
          onMouseMove={(e) => moveDraw(getPos(e.currentTarget, e.clientX, e.clientY))}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) startDraw(getPos(e.currentTarget, t.clientX, t.clientY)); }}
          onTouchMove={(e)  => { e.preventDefault(); const t = e.touches[0]; if (t) moveDraw(getPos(e.currentTarget, t.clientX, t.clientY)); }}
          onTouchEnd={endDraw}
        />
        {!signed && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted pointer-events-none select-none">
            Signez ici avec votre doigt
          </p>
        )}
      </div>

      {signed && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 text-[11px] text-muted hover:text-danger transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Effacer la signature
        </button>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export function ExpenseExport() {
  const entries   = useExpenseStore((s) => s.entries);
  const { data, setField } = useMatriceStore();
  const { department, role } = useUserStore();

  const [period,     setPeriod]     = useState<ExportPeriod>("mois");
  const [customFrom, setCustomFrom] = useState(new Date().toISOString().split("T")[0]!.slice(0, 7) + "-01");
  const [customTo,   setCustomTo]   = useState(new Date().toISOString().split("T")[0]!);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signedAt,     setSignedAt]     = useState<string | null>(null);

  const effectiveDept = data.departement || (department ? (DEPT_MAP[department as DepartmentSlug] ?? "PRODUCTION") : "PRODUCTION");
  const effectiveEmploi = data.emploi || role || "";

  const { from, to } = getRange(period, customFrom, customTo);
  const filtered = filterEntries(entries, from, to);
  const totalTTC  = filtered.reduce((s, e) => s + e.amountTTC, 0);
  const totalHT   = filtered.reduce((s, e) => s + e.amountHT, 0);
  const totalTVA  = filtered.reduce((s, e) => s + (e.amountTTC - e.amountHT), 0);
  const hasErrors = filtered.some((e) => e.flags.some((f) => f.severity === "error"));

  const identiteFilled = !!(data.nom?.trim());
  const canExport = identiteFilled && filtered.length > 0;

  function handleSign(url: string) {
    setSignatureUrl(url);
    setSignedAt(new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }));
  }

  function handleClearSig() {
    setSignatureUrl(null);
    setSignedAt(null);
  }

  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NDF_${(data.nom || "NOM").replace(/\s+/g, "-").toUpperCase()}_${data.numero || "001"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printView() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rows = filtered.map((e) => {
      const cat = getCategoryDef(e.category).label;
      return `<tr>
        <td>${escHtml(e.date)}</td>
        <td>${escHtml(cat)}</td>
        <td>${escHtml(e.description)}</td>
        <td style="text-align:right">${e.amountHT.toFixed(2)} €</td>
        <td style="text-align:right">${e.vatRate} %</td>
        <td style="text-align:right;font-weight:bold">${e.amountTTC.toFixed(2)} €</td>
        <td>${e.receiptUri ? "✓" : "—"}</td>
      </tr>`;
    }).join("");

    const sigBlock = signatureUrl && signedAt
      ? `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;display:flex;align-items:flex-end;justify-content:flex-end;gap:24px">
           <div>
             <p style="font-size:10px;color:#888;margin:0 0 4px">Signature du bénéficiaire</p>
             <img src="${escHtml(signatureUrl)}" style="height:60px;border-bottom:1px solid #333" />
             <p style="font-size:10px;color:#555;margin:4px 0 0">Signé le ${escHtml(signedAt)}</p>
           </div>
         </div>`
      : `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;text-align:right">
           <p style="font-size:10px;color:#888">Signature du bénéficiaire :</p>
           <div style="margin-top:32px;border-bottom:1px solid #333;width:200px;display:inline-block"></div>
           <p style="font-size:10px;color:#888;margin-top:4px">Date :</p>
         </div>`;

    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Notes de frais — ${escHtml(data.nom || "NOM")}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#111}
        h1{font-size:16px;margin:0 0 2px}
        .meta{font-size:10px;color:#555;margin-bottom:20px}
        .id-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;font-size:11px}
        .id-grid .lbl{color:#888;font-size:9px;text-transform:uppercase;letter-spacing:.05em}
        table{width:100%;border-collapse:collapse}
        th,td{padding:5px 7px;border:1px solid #ddd;vertical-align:top}
        th{background:#f5f5f5;font-weight:bold;font-size:10px}
        tfoot td{font-weight:bold;background:#f0f9f8}
        @media print{body{padding:0}}
      </style></head>
      <body>
        <h1>Note de frais</h1>
        <p class="meta">Période : ${escHtml(from)} → ${escHtml(to)}</p>
        <div class="id-grid">
          <div><div class="lbl">N° du relevé</div><strong>${escHtml(data.numero) || "—"}</strong></div>
          <div><div class="lbl">Date du relevé</div><strong>${escHtml(data.dateReleve) || "—"}</strong></div>
          <div><div class="lbl">NOM &amp; Prénom</div><strong>${escHtml(data.nom)}</strong></div>
          <div><div class="lbl">Département</div><strong>${escHtml(effectiveDept)}</strong></div>
          <div><div class="lbl">Emploi</div><strong>${escHtml(effectiveEmploi)}</strong></div>
          <div><div class="lbl">Région</div><strong>${escHtml(data.regionGlobale)}</strong></div>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Catégorie</th><th>Description</th><th>HT</th><th>TVA</th><th>TTC</th><th>Just.</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td colspan="3">TOTAUX (${filtered.length} dépense${filtered.length > 1 ? "s" : ""})</td>
            <td style="text-align:right">${totalHT.toFixed(2)} €</td>
            <td></td>
            <td style="text-align:right">${totalTTC.toFixed(2)} €</td>
            <td></td>
          </tr></tfoot>
        </table>
        ${sigBlock}
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  }

  const PERIODS: { id: ExportPeriod; label: string }[] = [
    { id: "semaine", label: "Semaine" },
    { id: "mois",    label: "Mois"    },
    { id: "tout",    label: "Tout"    },
    { id: "custom",  label: "Période" },
  ];

  return (
    <div className="space-y-4">

      {/* ── IDENTITÉ DU RELEVÉ ─────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Identité du relevé</p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted block mb-0.5">N° du relevé *</label>
            <input type="text" value={data.numero} onChange={(e) => setField("numero", e.target.value)} className={INPUT} placeholder="001" />
          </div>
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Date du relevé *</label>
            <input type="date" value={data.dateReleve} onChange={(e) => setField("dateReleve", e.target.value)} className={INPUT} />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted block mb-0.5">NOM & PRÉNOM *</label>
          <input
            type="text"
            value={data.nom}
            onChange={(e) => setField("nom", e.target.value)}
            className={INPUT}
            placeholder="DUPONT Jean"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Département *</label>
            <select value={effectiveDept} onChange={(e) => setField("departement", e.target.value)} className={INPUT}>
              {MATRICE_DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Région</label>
            <input type="text" value={data.regionGlobale} onChange={(e) => setField("regionGlobale", e.target.value)} className={INPUT} placeholder="Martinique" />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted block mb-0.5">Emploi</label>
          <input type="text" value={effectiveEmploi} onChange={(e) => setField("emploi", e.target.value)} className={INPUT} placeholder="1er assistant caméra" />
        </div>

        {/* Signature */}
        <div className="border-t border-stroke/40 pt-3">
          <SignaturePad
            onSign={handleSign}
            onClear={handleClearSig}
            signed={!!signatureUrl}
          />
        </div>
      </div>

      {!identiteFilled && (
        <p className="text-xs text-warning flex items-center gap-1.5 px-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Remplissez votre NOM & PRÉNOM pour activer l&apos;export.
        </p>
      )}

      {/* ── PÉRIODE ──────────────────────────────────────────────────────── */}
      <div>
        <label className="text-xs text-muted block mb-2">Période d&apos;export</label>
        <div className="flex gap-1.5">
          {PERIODS.map(({ id, label }) => (
            <button key={id} onClick={() => setPeriod(id)} className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${period === id ? "active-pill" : "glass-card text-muted"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {period === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted block mb-1">Du</label>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Au</label>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={INPUT} />
          </div>
        </div>
      )}

      {/* ── RÉCAP ────────────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <p className="text-xs text-muted font-semibold uppercase tracking-widest mb-3">Récapitulatif</p>
          <div className="flex justify-between text-xs"><span className="text-muted">Dépenses</span><span className="text-white">{filtered.length}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted">Total HT</span><span className="text-white">{totalHT.toFixed(2)} €</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted">TVA</span><span className="text-white">{totalTVA.toFixed(2)} €</span></div>
          <div className="flex justify-between text-sm border-t border-stroke/50 pt-2">
            <span className="text-white font-semibold">Total TTC</span>
            <span className="text-cyan font-bold">{totalTTC.toFixed(2)} €</span>
          </div>
          {hasErrors && (
            <p className="text-xs text-danger pt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Certaines dépenses ont des erreurs — vérifier avant d&apos;envoyer.
            </p>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-muted text-sm py-2">Aucune dépense sur cette période.</p>
      )}

      {/* ── BOUTONS EXPORT ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <button
          onClick={downloadCSV}
          disabled={!canExport}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold glass-card text-textSoft disabled:opacity-30 active:scale-95 transition-transform"
        >
          <FileSpreadsheet className="w-4 h-4" /> Exporter en CSV
        </button>
        <button
          onClick={printView}
          disabled={!canExport}
          className="active-pill w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Printer className="w-4 h-4" /> Imprimer / Sauvegarder en PDF
        </button>
      </div>
    </div>
  );
}
