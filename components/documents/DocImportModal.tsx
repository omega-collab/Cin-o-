"use client";

import { useState } from "react";
import { X, FolderOpen } from "lucide-react";
import { DOC_CATEGORIES, extToType } from "@/lib/data/documents";
import { useEscapeClose } from "@/lib/hooks/useEscapeClose";
import type { DocCategory, DocEntry } from "@/lib/data/documents";

const INPUT = "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 placeholder:text-muted";

interface Props {
  onClose: () => void;
  onSave: (doc: DocEntry) => void;
}

export function DocImportModal({ onClose, onSave }: Props) {
  useEscapeClose(onClose);
  const [label,       setLabel]       = useState("");
  const [filename,    setFilename]    = useState("");
  const [category,    setCategory]    = useState<DocCategory>("planning");
  const [description, setDescription] = useState("");
  const [code,        setCode]        = useState("");
  const [expiresAt,   setExpiresAt]   = useState("");
  const [dateDoc,     setDateDoc]     = useState("");

  const canSave = label.trim().length > 0 && filename.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const doc: DocEntry = {
      id: `custom-${Date.now()}`,
      label:       label.trim(),
      filename:    filename.trim(),
      category,
      description: description.trim(),
      type:        extToType(filename.trim()),
      dateDoc:     dateDoc || undefined,
      restricted:  code.trim()
        ? { code: code.trim(), expiresAt: expiresAt || undefined }
        : undefined,
    };
    onSave(doc);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-4"
        style={{ background: "oklch(0.14 0.02 220)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-white">Importer un document</p>
          <button onClick={onClose} className="text-muted p-1 -m-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Nom du fichier */}
        <div>
          <label className="text-xs text-muted block mb-1">Nom du fichier *</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="NomDuFichier.pdf"
            className={INPUT}
          />
          <p className="text-[10px] text-muted mt-1">
            Fichier déjà présent dans{" "}
            <a
              href="https://github.com/omega-collab/Cin-o-/tree/main/public/matrices"
              target="_blank"
              rel="noreferrer"
              className="text-cyan underline"
            >
              /public/matrices
            </a>
          </p>
        </div>

        {/* Nom d'affichage */}
        <div>
          <label className="text-xs text-muted block mb-1">Nom d&apos;affichage *</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex : S08 E05 — Continuité v1"
            className={INPUT}
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="text-xs text-muted block mb-1">Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as DocCategory)} className={INPUT}>
            {DOC_CATEGORIES.filter((c) => c.id !== "all").map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-muted block mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brève description du document"
            className={INPUT}
          />
        </div>

        {/* Date doc */}
        <div>
          <label className="text-xs text-muted block mb-1">Date du document (optionnel)</label>
          <input type="date" value={dateDoc} onChange={(e) => setDateDoc(e.target.value)} className={INPUT} />
        </div>

        {/* Code d'accès */}
        <div className="space-y-2 pt-2 border-t border-stroke/50">
          <p className="text-xs text-muted font-semibold uppercase tracking-widest">Accès restreint (optionnel)</p>
          <div>
            <label className="text-xs text-muted block mb-1">Code d&apos;accès</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Laisser vide = accès libre"
              className={INPUT}
            />
          </div>
          {code.trim() && (
            <div>
              <label className="text-xs text-muted block mb-1">Expiration (optionnel — vide = illimité)</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={INPUT} />
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="active-pill w-full py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
        >
          Ajouter au catalogue
        </button>
      </div>
    </div>
  );
}
