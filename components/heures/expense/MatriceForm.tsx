"use client";

import { useState } from "react";
import { Plus, Trash2, Download, Printer, Info, ScanLine, X, Camera } from "lucide-react";
import type { MatriceData, MatriceLigne } from "@/lib/types/matrice";
import { MATRICE_DEPTS, PCG_SUGGESTIONS } from "@/lib/types/matrice";
import { buildINTLOUMACSV } from "@/lib/utils/intloumaCSV";
import { useUserStore } from "@/lib/store/useUserStore";
import type { DepartmentSlug } from "@/lib/types";
import { FraisImportModal } from "./FraisImportModal";
import type { ExtractedFrais, ScanPair } from "./FraisImportModal";

// ── constants ─────────────────────────────────────────────────────────────────

const MAX = 18;
const TODAY = new Date().toISOString().split("T")[0]!;
const INPUT = "bg-white/5 border border-stroke rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 w-full";

const DEPT_MAP: Partial<Record<DepartmentSlug, string>> = {
  camera:     "CAMERA",
  electro:    "ELECTRO",
  machino:    "MACHINERIE",
  son:        "SON",
  regie:      "REGIE",
  deco:       "DECOR",
  hmc:        "HMC",
  production: "PRODUCTION",
  cantine:    "CANTINE",
  direction:  "REALISATION",
};

function parse(s: string): number {
  return parseFloat(s.replace(",", ".")) || 0;
}

function newLigne(): MatriceLigne {
  return {
    id: Math.random().toString(36).slice(2),
    date: TODAY,
    fournisseur: "",
    region: "",
    nature: "",
    recuperable: false,
    ttc: "",
    tva: "",
    codeComptable: "",
  };
}

// ── scan history type ─────────────────────────────────────────────────────────

interface FraisScan {
  id: string;
  ligneNum: number;
  ticketPreview: string;
  facturePreview?: string;
  ticketBase64: string;
  ticketMime: string;
  factureBase64?: string;
  factureMime?: string;
  extracted: ExtractedFrais;
}

// ── main component ─────────────────────────────────────────────────────────────

export function MatriceForm() {
  const { department, role } = useUserStore();

  const [data, setData] = useState<MatriceData>(() => ({
    numero: "",
    dateReleve: TODAY,
    regionGlobale: "France",
    nom: "",
    departement: department ? (DEPT_MAP[department] ?? "PRODUCTION") : "PRODUCTION",
    emploi: role ?? "",
    lignes: [newLigne()],
  }));

  const [scans, setScans]           = useState<FraisScan[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [scanPreview, setScanPreview] = useState<FraisScan | null>(null);

  // ── data helpers ────────────────────────────────────────────────────────────

  function setField<K extends keyof MatriceData>(k: K, v: MatriceData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function setLigne(id: string, update: Partial<MatriceLigne>) {
    setData((d) => ({
      ...d,
      lignes: d.lignes.map((l) => (l.id === id ? { ...l, ...update } : l)),
    }));
  }

  function addLigne() {
    if (data.lignes.length >= MAX) return;
    setData((d) => ({ ...d, lignes: [...d.lignes, newLigne()] }));
  }

  function removeLigne(id: string) {
    if (data.lignes.length <= 1) return;
    setData((d) => ({ ...d, lignes: d.lignes.filter((l) => l.id !== id) }));
  }

  // ── import via photo ────────────────────────────────────────────────────────

  function handleImportConfirm(extracted: ExtractedFrais, scan: ScanPair) {
    const ligne: MatriceLigne = {
      id: Math.random().toString(36).slice(2),
      date: extracted.date ?? TODAY,
      fournisseur: extracted.fournisseur ?? "",
      region: extracted.lieu ?? "",
      nature: extracted.nature ?? "",
      recuperable: false,
      ttc: extracted.montantTTC !== undefined ? String(extracted.montantTTC) : "",
      tva: extracted.montantTVA !== undefined ? String(extracted.montantTVA) : "",
      codeComptable: extracted.codePCG ?? "",
    };

    setData((d) => {
      // Replace the first empty line if it exists, otherwise append
      const firstEmpty = d.lignes.findIndex((l) => !l.fournisseur && !parse(l.ttc));
      if (firstEmpty >= 0) {
        const next = [...d.lignes];
        next[firstEmpty] = ligne;
        return { ...d, lignes: next };
      }
      if (d.lignes.length >= MAX) return d;
      return { ...d, lignes: [...d.lignes, ligne] };
    });

    setScans((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        ligneNum: data.lignes.length,
        ticketPreview:  scan.ticketPreview,
        facturePreview: scan.facturePreview,
        ticketBase64:   scan.ticketBase64,
        ticketMime:     scan.ticketMime,
        factureBase64:  scan.factureBase64,
        factureMime:    scan.factureMime,
        extracted,
      },
    ]);
  }

  // ── totals ──────────────────────────────────────────────────────────────────

  const totalTTC = data.lignes.reduce((s, l) => s + parse(l.ttc), 0);
  const totalTVA = data.lignes.reduce((s, l) => s + parse(l.tva), 0);
  const totalHT  = totalTTC - totalTVA;

  const canExport =
    data.nom.trim().length > 0 &&
    data.numero.trim().length > 0 &&
    data.lignes.some((l) => parse(l.ttc) > 0);

  // ── CSV export ──────────────────────────────────────────────────────────────

  function downloadCSV() {
    const csv = buildINTLOUMACSV(data);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RDD_${data.nom.replace(/\s+/g, "-").toUpperCase()}_${data.numero}_INTLOUMA.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── print ───────────────────────────────────────────────────────────────────

  function printReleve() {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = data.lignes
      .map((l, i) => {
        const ht = parse(l.ttc) - parse(l.tva);
        if (!parse(l.ttc) && !l.fournisseur && !l.nature) return "";
        return `<tr>
          <td>${i + 1}</td><td>${l.date}</td><td>${l.fournisseur}</td>
          <td>${l.region}</td><td>${l.nature}</td>
          <td style="text-align:center">${l.recuperable ? "OUI" : "NON"}</td>
          <td style="text-align:right">${parse(l.ttc).toFixed(2)}</td>
          <td style="text-align:right">${parse(l.tva).toFixed(2)}</td>
          <td style="text-align:right">${ht.toFixed(2)}</td>
        </tr>`;
      })
      .filter(Boolean)
      .join("");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Relevé de dépenses — ${data.nom}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:10px;padding:16px}
      h2{font-size:13px;margin:4px 0}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0;font-size:10px}
      table{width:100%;border-collapse:collapse;margin-bottom:10px}
      th,td{padding:4px 6px;border:1px solid #bbb;vertical-align:top}
      th{background:#eee;font-weight:bold}tfoot td{font-weight:bold;background:#f5f5f5}
      .company{font-size:10px;font-weight:bold;margin-bottom:2px}
      .sign{margin-top:16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:10px}
      .sign div{border-top:1px solid #999;padding-top:4px}
      .note{color:#c00;font-size:9px;margin-top:12px;font-style:italic}
    </style></head><body>
    <div class="company">FEDERATION STUDIO France — 10 rue Royale 75008 Paris — SIRET 922 429 097 00012</div>
    <h2>RELEVÉ DE DÉPENSES — Films « Tropiques Criminels » Saison 8</h2>
    <div class="meta">
      <div>N° : <strong>${data.numero}</strong> &nbsp; Date : <strong>${data.dateReleve}</strong></div>
      <div>Région : <strong>${data.regionGlobale}</strong></div>
      <div>NOM &amp; PRÉNOM : <strong>${data.nom}</strong></div>
      <div>Département : <strong>${data.departement}</strong> &nbsp; Emploi : <strong>${data.emploi}</strong></div>
    </div>
    <table>
      <thead><tr><th>N°</th><th>Date</th><th>Fournisseur</th><th>Région/lieu</th><th>Nature dépense</th><th>R</th><th>TTC</th><th>TVA</th><th>HT</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr>
        <td colspan="6" style="text-align:right"><strong>TOTAUX EN EUROS</strong></td>
        <td style="text-align:right">${totalTTC.toFixed(2)} €</td>
        <td style="text-align:right">${totalTVA.toFixed(2)} €</td>
        <td style="text-align:right">${totalHT.toFixed(2)} €</td>
      </tr></tfoot>
    </table>
    <p style="font-size:9px;font-style:italic">Je certifie que les dépenses ci-dessus représentent des fonds déboursés uniquement pour les affaires de la société et que les justificatifs sont joints.</p>
    <div class="sign">
      <div>Bénéficiaire<br><br>${data.nom}</div>
      <div>Visa chef département<br><br>&nbsp;</div>
      <div>Direction de production<br><br>&nbsp;</div>
    </div>
    <p class="note">Merci d'envoyer ce document par email à l'Administration : lydia.bareille@orange.fr — Une fois validé par le Directeur de production, le remboursement se fera par virement bancaire.</p>
    </body></html>`);
    win.document.close();
    win.print();
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Info production */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div>
          <p className="text-[10px] text-muted font-semibold uppercase tracking-widest mb-1">Production</p>
          <p className="text-xs text-white font-medium">Films « Tropiques Criminels » Saison 8</p>
          <p className="text-xs text-muted">FEDERATION STUDIO France · SIRET 922 429 097 00012</p>
          <p className="text-xs text-muted mt-0.5">
            Envoi CSV à : <span className="text-cyan">lydia.bareille@orange.fr</span>
          </p>
        </div>

        {/* Download prominent */}
        <a
          href={`/matrices/${encodeURIComponent("MATRICE NOTE de FRAIS LB.xls")}`}
          download
          className="flex items-center gap-3 rounded-2xl p-3 active:scale-95 transition-transform"
          style={{ background: "rgba(0,224,208,0.08)", border: "1px solid rgba(0,224,208,0.25)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-cyan/20 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Matrice Excel originale</p>
            <p className="text-[10px] text-muted truncate">MATRICE NOTE de FRAIS LB.xls</p>
          </div>
          <span className="text-[10px] text-cyan font-semibold shrink-0">XLS</span>
        </a>
      </div>

      {/* Import par photo */}
      <button
        onClick={() => setShowImport(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 active:scale-95 transition-transform"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Camera className="w-5 h-5 text-textSoft" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white">Importer une note de frais</p>
          <p className="text-xs text-muted">Photo ticket CB + facture → remplissage automatique</p>
        </div>
        <ScanLine className="w-4 h-4 text-muted shrink-0" />
      </button>

      {/* Identité */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <p className="text-xs text-muted font-semibold uppercase tracking-widest">Identité</p>
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
          <input type="text" value={data.nom} onChange={(e) => setField("nom", e.target.value)} className={INPUT} placeholder="DUPONT Jean" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Département *</label>
            <select value={data.departement} onChange={(e) => setField("departement", e.target.value)} className={INPUT}>
              {MATRICE_DEPTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Région</label>
            <input type="text" value={data.regionGlobale} onChange={(e) => setField("regionGlobale", e.target.value)} className={INPUT} placeholder="France" />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted block mb-0.5">Emploi</label>
          <input type="text" value={data.emploi} onChange={(e) => setField("emploi", e.target.value)} className={INPUT} placeholder="1er assistant caméra" />
        </div>
      </div>

      {/* Lignes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted font-semibold uppercase tracking-widest">
            Dépenses ({data.lignes.length}/{MAX})
          </p>
          {data.lignes.length >= MAX && (
            <span className="text-[10px] text-amber-400">Max {MAX} — nouveau relevé SVP</span>
          )}
        </div>

        <datalist id="pcg-list">
          {PCG_SUGGESTIONS.map((p) => (
            <option key={p.code} value={p.code}>{p.label}</option>
          ))}
        </datalist>

        {data.lignes.map((l, i) => (
          <LignCard
            key={l.id}
            num={i + 1}
            ligne={l}
            onChange={(u) => setLigne(l.id, u)}
            onDelete={() => removeLigne(l.id)}
            canDelete={data.lignes.length > 1}
          />
        ))}

        {data.lignes.length < MAX && (
          <button
            onClick={addLigne}
            className="w-full py-2.5 rounded-2xl text-xs font-medium text-muted glass-card flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne manuellement
          </button>
        )}
      </div>

      {/* Totaux */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <p className="text-xs text-muted font-semibold uppercase tracking-widest mb-2">Totaux</p>
        <div className="flex justify-between text-xs">
          <span className="text-muted">Total TTC</span>
          <span className="text-white font-mono">{totalTTC.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted">Total TVA</span>
          <span className="text-white font-mono">{totalTVA.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm border-t border-stroke/50 pt-2">
          <span className="text-white font-semibold">Total HT</span>
          <span className="text-cyan font-bold font-mono">{totalHT.toFixed(2)} €</span>
        </div>
      </div>

      {/* Justificatifs scannés */}
      {scans.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted font-semibold uppercase tracking-widest">
            Justificatifs scannés ({scans.length})
          </p>
          {scans.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setScanPreview(sc)}
              className="w-full glass-card rounded-2xl p-3 flex items-center gap-3 active:scale-95 transition-transform"
            >
              <img src={sc.ticketPreview} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
              {sc.facturePreview && (
                <img src={sc.facturePreview} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 -ml-6 border-2 border-background" />
              )}
              <div className="flex-1 min-w-0 text-left ml-1">
                <p className="text-xs font-semibold text-white truncate">{sc.extracted.fournisseur ?? "—"}</p>
                <p className="text-[10px] text-muted">{sc.extracted.nature} · {sc.extracted.montantTTC?.toFixed(2)} €</p>
              </div>
              <span className="text-[10px] font-bold text-cyan shrink-0 bg-cyan/10 px-1.5 py-0.5 rounded-lg">
                #{sc.ligneNum}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Actions export */}
      <div className="space-y-2">
        <button
          onClick={downloadCSV}
          disabled={!canExport}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold glass-card text-textSoft disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Download className="w-4 h-4" /> Exporter CSV (INT LOUMA)
        </button>
        <button
          onClick={printReleve}
          disabled={!canExport}
          className="active-pill w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Printer className="w-4 h-4" /> Imprimer / PDF
        </button>
      </div>

      {/* Note */}
      <div className="glass-card rounded-2xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blueSoft shrink-0 mt-0.5" />
        <p className="text-xs text-textSoft leading-relaxed">
          Remplir chaque semaine et envoyer à <span className="text-cyan">lydia.bareille@orange.fr</span> avec les justificatifs numérotés dans le même ordre. Max 18 lignes par relevé.
        </p>
      </div>

      {/* Modal import */}
      {showImport && (
        <FraisImportModal
          onClose={() => setShowImport(false)}
          onConfirm={handleImportConfirm}
        />
      )}

      {/* Scan preview */}
      {scanPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setScanPreview(null)}
        >
          <div
            className="w-full max-w-sm space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">{scanPreview.extracted.fournisseur ?? "Justificatif"}</p>
              <button onClick={() => setScanPreview(null)} className="text-muted p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <img src={scanPreview.ticketPreview} alt="ticket" className="w-full rounded-2xl" />
            {scanPreview.facturePreview && (
              <img src={scanPreview.facturePreview} alt="facture" className="w-full rounded-2xl" />
            )}

            <div className="glass-card rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Montant TTC</span>
                <span className="text-cyan font-mono font-bold">{scanPreview.extracted.montantTTC?.toFixed(2)} €</span>
              </div>
              {(scanPreview.extracted.montantTVA ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">TVA</span>
                  <span className="text-white font-mono">{scanPreview.extracted.montantTVA?.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Nature</span>
                <span className="text-white">{scanPreview.extracted.nature ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Lieu</span>
                <span className="text-white">{scanPreview.extracted.lieu ?? "—"}</span>
              </div>
              {scanPreview.extracted.codePCG && (
                <div className="flex justify-between">
                  <span className="text-muted">Code PCG</span>
                  <span className="text-white font-mono">{scanPreview.extracted.codePCG}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LignCard ───────────────────────────────────────────────────────────────────

interface LignCardProps {
  num: number;
  ligne: MatriceLigne;
  onChange: (u: Partial<MatriceLigne>) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function LignCard({ num, ligne, onChange, onDelete, canDelete }: LignCardProps) {
  const ht = parse(ligne.ttc) - parse(ligne.tva);
  const s = "bg-white/5 border border-stroke rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-full";

  return (
    <div className="glass-card rounded-2xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-cyan w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center shrink-0">
          {num}
        </span>
        {canDelete && (
          <button onClick={onDelete} className="text-muted hover:text-redSoft p-1 -m-1 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted block mb-0.5">Date</label>
          <input type="date" value={ligne.date} onChange={(e) => onChange({ date: e.target.value })} className={s} />
        </div>
        <div>
          <label className="text-[10px] text-muted block mb-0.5">Fournisseur</label>
          <input type="text" value={ligne.fournisseur} onChange={(e) => onChange({ fournisseur: e.target.value })} className={s} placeholder="Total, Ibis…" />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted block mb-0.5">Nature de la dépense</label>
        <input type="text" value={ligne.nature} onChange={(e) => onChange({ nature: e.target.value })} className={s} placeholder="Carburant, Repas équipe, Péage…" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-muted block mb-0.5">TTC (€)</label>
          <input type="text" inputMode="decimal" value={ligne.ttc} onChange={(e) => onChange({ ttc: e.target.value })} className={s} placeholder="0.00" />
        </div>
        <div>
          <label className="text-[10px] text-muted block mb-0.5">TVA (€)</label>
          <input type="text" inputMode="decimal" value={ligne.tva} onChange={(e) => onChange({ tva: e.target.value })} className={s} placeholder="0.00" />
        </div>
        <div>
          <label className="text-[10px] text-muted block mb-0.5">HT (€)</label>
          <div className="bg-white/3 border border-stroke/50 rounded-lg px-2 py-1 text-xs text-cyan font-mono">
            {ht.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-muted block mb-0.5">Code PCG</label>
          <input
            type="text"
            list="pcg-list"
            value={ligne.codeComptable}
            onChange={(e) => onChange({ codeComptable: e.target.value })}
            className={`${s} font-mono`}
            placeholder="606300"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted block mb-0.5">Lieu</label>
          <input type="text" value={ligne.region} onChange={(e) => onChange({ region: e.target.value })} className={s} placeholder="Paris" />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] text-muted block mb-0.5">TVA récup.</label>
          <button
            onClick={() => onChange({ recuperable: !ligne.recuperable })}
            className={`flex-1 rounded-lg text-xs font-semibold transition-colors border ${ligne.recuperable ? "bg-cyan/20 border-cyan/40 text-cyan" : "bg-white/5 border-stroke text-muted"}`}
          >
            {ligne.recuperable ? "OUI" : "NON"}
          </button>
        </div>
      </div>
    </div>
  );
}
