"use client";

import { useState } from "react";
import { Plus, Trash2, Download, Printer, Info, X, AlertTriangle, CheckCircle, Pencil } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { useMatriceStore } from "@/lib/store/useMatriceStore";
import { useFraisEntries } from "@/lib/hooks/useFraisEntries";
import type { FraisEntry, FraisEntryInsert } from "@/lib/supabase/types";
import type { DepartmentSlug } from "@/lib/types";
import { MATRICE_DEPTS } from "@/lib/types/matrice";

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

const NATURES = ["Carburant", "Repas équipe", "Hôtel", "Péage", "Matériel", "Fournitures", "Transport", "Autre"];
const INPUT = "bg-white/5 border border-stroke rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 w-full";
const EMPTY_NEW: Omit<FraisEntryInsert, "project_id" | "releve_numero"> = {
  date: new Date().toISOString().split("T")[0]!,
  fournisseur: "",
  nature: "",
  montant_ttc: 0,
  plaque_immat: null,
};

interface CoherenceIssue { line: number; msg: string; }

// ── component ──────────────────────────────────────────────────────────────────

export function MatriceForm() {
  const { department, role } = useUserStore();
  const { data, setField } = useMatriceStore();
  const { entries, loading, addEntry, deleteEntry, updateEntry } = useFraisEntries();

  const [showAdd, setShowAdd] = useState(false);
  const [newLine, setNewLine] = useState(EMPTY_NEW);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPatch, setEditPatch] = useState<Partial<FraisEntryInsert>>({});
  const [coherenceModal, setCoherenceModal] = useState<CoherenceIssue[] | null>(null);

  const effectiveDept = data.departement || (department ? (DEPT_MAP[department as DepartmentSlug] ?? "PRODUCTION") : "PRODUCTION");
  const effectiveEmploi = data.emploi || role || "";
  const totalTTC = entries.reduce((s, e) => s + (e.montant_ttc ?? 0), 0);
  const canExport = (data.nom || "").trim().length > 0 && entries.some((e) => (e.montant_ttc ?? 0) > 0);

  // ── coherence ────────────────────────────────────────────────────────────────

  function checkCoherence(): CoherenceIssue[] {
    const issues: CoherenceIssue[] = [];
    entries.forEach((e, i) => {
      if (!e.fournisseur?.trim()) issues.push({ line: i + 1, msg: "Fournisseur manquant" });
      if (!e.nature?.trim())      issues.push({ line: i + 1, msg: "Nature manquante" });
      if (!e.date)                issues.push({ line: i + 1, msg: "Date manquante" });
      if ((e.montant_ttc ?? 0) <= 0) issues.push({ line: i + 1, msg: "Montant nul ou négatif" });
    });
    if (entries.length === 0) issues.push({ line: 0, msg: "Aucune dépense dans la matrice" });
    return issues;
  }

  function handlePrintClick() {
    if (!data.nom?.trim() || !data.numero?.trim()) {
      setCoherenceModal([{ line: 0, msg: "NOM & Prénom et N° du relevé requis" }]);
      return;
    }
    const issues = checkCoherence();
    if (issues.length > 0) { setCoherenceModal(issues); return; }
    printReleve();
  }

  // ── add / edit ───────────────────────────────────────────────────────────────

  async function handleAddLine() {
    if (!newLine.fournisseur || !newLine.nature || !newLine.montant_ttc) return;
    await addEntry({
      ...newLine,
      project_id: null,
      releve_numero: data.numero || null,
    });
    setNewLine(EMPTY_NEW);
    setShowAdd(false);
  }

  async function handleSaveEdit(id: string) {
    await updateEntry(id, editPatch);
    setEditId(null);
    setEditPatch({});
  }

  function startEdit(e: FraisEntry) {
    setEditId(e.id);
    setEditPatch({
      date: e.date,
      fournisseur: e.fournisseur,
      nature: e.nature,
      montant_ttc: e.montant_ttc,
      plaque_immat: e.plaque_immat,
    });
  }

  // ── PDF ──────────────────────────────────────────────────────────────────────

  function printReleve() {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = entries
      .filter((e) => (e.montant_ttc ?? 0) > 0 || e.fournisseur)
      .map((e, i) => `<tr>
        <td>${i + 1}</td>
        <td>${e.date ?? ""}</td>
        <td>${e.fournisseur ?? ""}</td>
        <td>${e.nature ?? ""}</td>
        <td style="text-align:right">${(e.montant_ttc ?? 0).toFixed(2)}</td>
        <td>${e.plaque_immat ?? "—"}</td>
      </tr>`)
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
      <thead><tr><th>N°</th><th>Date</th><th>Fournisseur</th><th>Nature dépense</th><th>TTC (€)</th><th>Plaque</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr>
        <td colspan="4" style="text-align:right"><strong>TOTAL TTC EN EUROS</strong></td>
        <td style="text-align:right"><strong>${totalTTC.toFixed(2)} €</strong></td>
        <td></td>
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
    setCoherenceModal(null);
  }

  // ── CSV ──────────────────────────────────────────────────────────────────────

  function downloadCSV() {
    const header = "Date;Fournisseur;Nature;Montant TTC;Plaque immat";
    const rows = entries.map((e) => [
      e.date ?? "",
      `"${(e.fournisseur ?? "").replace(/"/g, '""')}"`,
      `"${(e.nature ?? "").replace(/"/g, '""')}"`,
      (e.montant_ttc ?? 0).toFixed(2),
      e.plaque_immat ?? "",
    ].join(";")).join("\n");
    const blob = new Blob(["﻿" + header + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NDF_${(data.nom || "NOM").replace(/\s+/g, "-").toUpperCase()}_${data.numero || "001"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Production info */}
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

      {/* Summary */}
      {entries.length > 0 && (
        <div className="glass-card rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">
              {entries.length} dépense{entries.length > 1 ? "s" : ""} enregistrée{entries.length > 1 ? "s" : ""}
            </p>
            <p className="text-[10px] text-muted">
              Total TTC : <span className="text-cyan font-mono">{totalTTC.toFixed(2)} €</span>
            </p>
          </div>
          <span className="text-[10px] text-cyan bg-cyan/10 px-2 py-0.5 rounded-full font-medium">Supabase</span>
        </div>
      )}

      {entries.length === 0 && !loading && (
        <div className="glass-card rounded-2xl p-3 text-center space-y-1">
          <p className="text-xs text-textSoft">Aucune dépense enregistrée.</p>
          <p className="text-[10px] text-muted">
            Scannez un ticket depuis l&apos;onglet <span className="text-cyan">Dépenses</span> ou ajoutez manuellement ci-dessous.
          </p>
        </div>
      )}

      {/* Identité */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <p className="text-xs text-muted font-semibold uppercase tracking-widest">Identité du relevé</p>
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
        <p className="text-xs text-muted font-semibold uppercase tracking-widest">
          Dépenses ({entries.length})
        </p>

        {loading && (
          <div className="text-center py-4 text-xs text-muted">Chargement…</div>
        )}

        {entries.map((e, i) => (
          <EntryCard
            key={e.id}
            num={i + 1}
            entry={e}
            isEditing={editId === e.id}
            editPatch={editPatch}
            onEditStart={() => startEdit(e)}
            onEditChange={(p) => setEditPatch((prev) => ({ ...prev, ...p }))}
            onEditSave={() => handleSaveEdit(e.id)}
            onEditCancel={() => { setEditId(null); setEditPatch({}); }}
            onDelete={() => deleteEntry(e.id)}
          />
        ))}

        {/* Add manually */}
        {showAdd ? (
          <div className="glass-card rounded-2xl p-3 space-y-2">
            <p className="text-xs font-semibold text-white">Nouvelle dépense</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted block mb-0.5">Date *</label>
                <input type="date" value={newLine.date} onChange={(e) => setNewLine((p) => ({ ...p, date: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className="text-[10px] text-muted block mb-0.5">Fournisseur *</label>
                <input type="text" value={newLine.fournisseur} onChange={(e) => setNewLine((p) => ({ ...p, fournisseur: e.target.value }))} className={INPUT} placeholder="Total, Ibis…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted block mb-0.5">Nature *</label>
                <select value={newLine.nature} onChange={(e) => setNewLine((p) => ({ ...p, nature: e.target.value }))} className={INPUT}>
                  <option value="">— Choisir —</option>
                  {NATURES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted block mb-0.5">TTC (€) *</label>
                <input type="number" inputMode="decimal" step="0.01" min="0"
                  value={newLine.montant_ttc || ""}
                  onChange={(e) => setNewLine((p) => ({ ...p, montant_ttc: parseFloat(e.target.value) || 0 }))}
                  className={INPUT} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted block mb-0.5">Plaque immat.</label>
              <input type="text" value={newLine.plaque_immat ?? ""} onChange={(e) => setNewLine((p) => ({ ...p, plaque_immat: e.target.value || null }))} className={INPUT} placeholder="AB-123-CD ou vide" />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddLine}
                disabled={!newLine.fournisseur || !newLine.nature || !newLine.montant_ttc}
                className="flex-1 active-pill py-2 rounded-xl text-xs font-semibold disabled:opacity-30"
              >
                Ajouter
              </button>
              <button onClick={() => setShowAdd(false)} className="p-2 text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-2.5 rounded-2xl text-xs font-medium text-muted glass-card flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne manuellement
          </button>
        )}
      </div>

      {/* Total */}
      {entries.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Total TTC</span>
            <span className="text-cyan font-bold font-mono text-base">{totalTTC.toFixed(2)} €</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={downloadCSV}
          disabled={!canExport}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold glass-card text-textSoft disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Download className="w-4 h-4" /> Exporter CSV
        </button>
        <button
          onClick={handlePrintClick}
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
          Les dépenses sont enregistrées dans Supabase. Seul vous pouvez les modifier ou supprimer.
        </p>
      </div>

      {/* Coherence modal */}
      {coherenceModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60">
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm font-semibold text-white">
                {coherenceModal.length === 0 ? "Tout est correct !" : "Problèmes détectés"}
              </p>
            </div>
            {coherenceModal.length > 0 && (
              <ul className="space-y-1.5">
                {coherenceModal.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-textSoft">
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {issue.line > 0 ? issue.line : "!"}
                    </span>
                    {issue.msg}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 pt-1">
              {coherenceModal.length > 0 && (
                <button
                  onClick={printReleve}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold glass-card text-textSoft"
                >
                  Imprimer quand même
                </button>
              )}
              {coherenceModal.length === 0 && (
                <button onClick={printReleve} className="flex-1 active-pill py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Imprimer
                </button>
              )}
              <button onClick={() => setCoherenceModal(null)} className="flex-1 active-pill py-2 rounded-xl text-xs font-semibold">
                {coherenceModal.length > 0 ? "Corriger" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── EntryCard ──────────────────────────────────────────────────────────────────

interface EntryCardProps {
  num: number;
  entry: FraisEntry;
  isEditing: boolean;
  editPatch: Partial<FraisEntryInsert>;
  onEditStart: () => void;
  onEditChange: (p: Partial<FraisEntryInsert>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
}

const NATURES_LIST = ["Carburant", "Repas équipe", "Hôtel", "Péage", "Matériel", "Fournitures", "Transport", "Autre"];
const S = "bg-white/5 border border-stroke rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-full";

function EntryCard({ num, entry, isEditing, editPatch, onEditStart, onEditChange, onEditSave, onEditCancel, onDelete }: EntryCardProps) {
  if (isEditing) {
    return (
      <div className="glass-card rounded-2xl p-3 space-y-2 ring-1 ring-cyan/30">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Date</label>
            <input type="date" value={editPatch.date ?? entry.date} onChange={(e) => onEditChange({ date: e.target.value })} className={S} />
          </div>
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Fournisseur</label>
            <input type="text" value={editPatch.fournisseur ?? entry.fournisseur} onChange={(e) => onEditChange({ fournisseur: e.target.value })} className={S} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted block mb-0.5">Nature</label>
            <select value={editPatch.nature ?? entry.nature} onChange={(e) => onEditChange({ nature: e.target.value })} className={S}>
              {NATURES_LIST.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted block mb-0.5">TTC (€)</label>
            <input type="number" inputMode="decimal" step="0.01" min="0"
              value={editPatch.montant_ttc ?? entry.montant_ttc}
              onChange={(e) => onEditChange({ montant_ttc: parseFloat(e.target.value) || 0 })}
              className={S} />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted block mb-0.5">Plaque immat.</label>
          <input type="text" value={editPatch.plaque_immat ?? entry.plaque_immat ?? ""} onChange={(e) => onEditChange({ plaque_immat: e.target.value || null })} className={S} placeholder="AB-123-CD ou vide" />
        </div>
        <div className="flex gap-2">
          <button onClick={onEditSave} className="flex-1 active-pill py-1.5 rounded-xl text-xs font-semibold">Enregistrer</button>
          <button onClick={onEditCancel} className="p-2 text-muted"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-cyan w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center">
            {num}
          </span>
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs font-semibold text-white truncate">{entry.fournisseur}</p>
          <p className="text-[10px] text-muted">{entry.date} · {entry.nature}</p>
          {entry.plaque_immat && (
            <p className="text-[10px] text-cyan font-mono">{entry.plaque_immat}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm font-bold text-white font-mono">{(entry.montant_ttc ?? 0).toFixed(2)} €</span>
          <button onClick={onEditStart} className="text-muted hover:text-textSoft p-1 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="text-muted hover:text-redSoft p-1 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
