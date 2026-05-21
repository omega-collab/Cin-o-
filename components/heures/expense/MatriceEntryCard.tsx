"use client";

import { X, Pencil, Trash2 } from "lucide-react";
import type { FraisEntry, FraisEntryInsert } from "@/lib/supabase/types";

const NATURES_LIST = ["Carburant", "Repas équipe", "Hôtel", "Péage", "Matériel", "Fournitures", "Transport", "Autre"];
const S = "bg-white/5 border border-stroke rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-full";

export interface EntryCardProps {
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

export function MatriceEntryCard({ num, entry, isEditing, editPatch, onEditStart, onEditChange, onEditSave, onEditCancel, onDelete }: EntryCardProps) {
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
