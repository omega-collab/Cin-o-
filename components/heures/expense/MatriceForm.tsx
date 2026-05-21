"use client";

import { useState } from "react";
import { Plus, Trash2, Download, Printer, Info, RotateCcw, X } from "lucide-react";
import type { MatriceLigne } from "@/lib/types/matrice";
import { MATRICE_DEPTS, PCG_SUGGESTIONS } from "@/lib/types/matrice";
import { buildINTLOUMACSV } from "@/lib/utils/intloumaCSV";
import { useUserStore } from "@/lib/store/useUserStore";
import { useMatriceStore, MAX_LIGNES } from "@/lib/store/useMatriceStore";
import type { DepartmentSlug } from "@/lib/types";

// ── constants ─────────────────────────────────────────────────────────────────

const DEPT_MAP: Partial<Record<DepartmentSlug, string>> = {
  camera:     "CAMERA",
  electro:    "ELECTRICITE",
  machino:    "MACHINERIE",
  son:        "SON",
  regie:      "REGIE",
  deco:       "DECORATION",
  hmc:        "HMC",
  production: "PRODUCTION",
  cantine:    "CANTINE",
  direction:  "REALISATION",
};

const INPUT = "bg-white/5 border border-stroke rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 w-full";

function parse(s: string): number {
  return parseFloat(s.replace(",", ".")) || 0;
}

// ── main component ─────────────────────────────────────────────────────────────

export function MatriceForm() {
  const { department, role } = useUserStore();
  const { data, scansMeta, setField, setLigne, addLigne, removeLigne, resetLignes } = useMatriceStore();
  const [confirmReset, setConfirmReset] = useState(false);

  // Init departement/emploi from user profile if fields are empty
  const effectiveDept = data.departement || (department ? (DEPT_MAP[department] ?? "PRODUCTION") : "PRODUCTION");
  const effectiveEmploi = data.emploi || role || "";

  const totalTTC = data.lignes.reduce((s, l) => s + parse(l.ttc), 0);
  const totalTVA = data.lignes.reduce((s, l) => s + parse(l.tva), 0);
  const totalHT  = totalTTC - totalTVA;

  const canExport =
    (data.nom || "").trim().length > 0 &&
    (data.numero || "").trim().length > 0 &&
    data.lignes.some((l) => parse(l.ttc) > 0);

  const filledLines = data.lignes.filter((l) => parse(l.ttc) > 0 || l.fournisseur);

  // ── CSV export ──────────────────────────────────────────────────────────────

  function downloadCSV() {
    const csv = buildINTLOUMACSV({ ...data, departement: effectiveDept, emploi: effectiveEmploi });
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RDD_${(data.nom || "NOM").replace(/\s+/g, "-").toUpperCase()}_${data.numero || "001"}_INTLOUMA.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── print / PDF ─────────────────────────────────────────────────────────────

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
    <title>Note de frais — ${data.nom}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:10px;padding:16px;color:#111}
      h2{font-size:13px;margin:4px 0}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0;font-size:10px}
      table{width:100%;border-collapse:collapse;margin-bottom:10px}
      th,td{padding:4px 6px;border:1px solid #bbb;vertical-align:top}
      th{background:#eee;font-weight:bold}
      tfoot td{font-weight:bold;background:#f5f5f5}
      .company{font-size:10px;font-weight:bold;margin-bottom:2px}
      .sign{margin-top:16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:10px}
      .sign div{border-top:1px solid #999;padding-top:4px}
      .note{color:#c00;font-size:9px;margin-top:12px;font-style:italic}
      @media print{@page{margin:12mm}}
    </style></head><body>
    <div class="company">FEDERATION STUDIO France — 10 rue Royale 75008 Paris — SIRET 922 429 097 00012</div>
    <h2>NOTE DE FRAIS — Films « Tropiques Criminels » Saison 8</h2>
    <div class="meta">
      <div>N° : <strong>${data.numero}</strong> &nbsp; Date : <strong>${data.dateReleve}</strong></div>
      <div>Région : <strong>${data.regionGlobale}</strong></div>
      <div>NOM &amp; PRÉNOM : <strong>${data.nom}</strong></div>
      <div>Département : <strong>${effectiveDept}</strong> &nbsp; Emploi : <strong>${effectiveEmploi}</strong></div>
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
    <p class="note">Envoyer par email à Administration : lydia.bareille@orange.fr avec les justificatifs numérotés. Remboursement par virement après validation.</p>
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
            Envoi à : <span className="text-cyan">lydia.bareille@orange.fr</span>
          </p>
        </div>
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

      {/* Statut des lignes scannées */}
      {filledLines.length > 0 && (
        <div className="glass-card rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">
              {filledLines.length} dépense{filledLines.length > 1 ? "s" : ""} dans la matrice
            </p>
            <p className="text-[10px] text-muted">
              Total TTC : <span className="text-cyan font-mono">{totalTTC.toFixed(2)} €</span>
            </p>
          </div>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted">Effacer ?</span>
              <button
                onClick={() => { resetLignes(); setConfirmReset(false); }}
                className="text-[10px] font-bold text-red-400 px-2 py-1 rounded-lg bg-red-400/10"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-muted p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-muted p-2 hover:text-textSoft transition-colors"
              title="Nouveau relevé"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Hint scan */}
      {filledLines.length === 0 && (
        <div className="glass-card rounded-2xl p-3 text-center space-y-1">
          <p className="text-xs text-textSoft">Aucune dépense dans la matrice.</p>
          <p className="text-[10px] text-muted">
            Scannez un ticket depuis l&apos;onglet <span className="text-cyan">Dépenses</span> pour remplir automatiquement.
          </p>
        </div>
      )}

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
      </div>

      {/* Lignes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted font-semibold uppercase tracking-widest">
            Dépenses ({data.lignes.length}/{MAX_LIGNES})
          </p>
          {data.lignes.length >= MAX_LIGNES && (
            <span className="text-[10px] text-amber-400">Max {MAX_LIGNES} — nouveau relevé</span>
          )}
        </div>

        <datalist id="pcg-list">
          {PCG_SUGGESTIONS.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}
        </datalist>

        {data.lignes.map((l, i) => (
          <LignCard
            key={l.id}
            num={i + 1}
            ligne={l}
            onChange={(u) => setLigne(l.id, u)}
            onDelete={() => removeLigne(l.id)}
            canDelete={data.lignes.length > 1}
            hasScan={scansMeta.some((s) => s.ligneId === l.id)}
          />
        ))}

        {data.lignes.length < MAX_LIGNES && (
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
          <Printer className="w-4 h-4" /> Imprimer / Télécharger PDF
        </button>
      </div>

      {/* Note */}
      <div className="glass-card rounded-2xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blueSoft shrink-0 mt-0.5" />
        <p className="text-xs text-textSoft leading-relaxed">
          Scannez vos tickets depuis l&apos;onglet <span className="text-cyan">Dépenses → Importer</span> pour remplissage automatique. Max {MAX_LIGNES} lignes par relevé.
        </p>
      </div>
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
  hasScan: boolean;
}

function LignCard({ num, ligne, onChange, onDelete, canDelete, hasScan }: LignCardProps) {
  const ht = parse(ligne.ttc) - parse(ligne.tva);
  const s = "bg-white/5 border border-stroke rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-full";

  return (
    <div className="glass-card rounded-2xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-cyan w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center shrink-0">
            {num}
          </span>
          {hasScan && (
            <span className="text-[9px] text-cyan bg-cyan/10 px-1.5 py-0.5 rounded-md font-medium">
              scanné
            </span>
          )}
        </div>
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
          <input type="text" value={ligne.region} onChange={(e) => onChange({ region: e.target.value })} className={s} placeholder="Le Diamant" />
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
