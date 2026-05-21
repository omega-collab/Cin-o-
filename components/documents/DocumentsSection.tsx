"use client";

import { useState, useMemo } from "react";
import { Search, Download, Lock, FileText, FileSpreadsheet, FileType, X, Plus, Trash2 } from "lucide-react";
import {
  DOCUMENTS, DOC_CATEGORIES, catLabel, catColor,
  ADMIN_CODE, getCustomDocs, upsertCustomDoc, deleteCustomDoc,
} from "@/lib/data/documents";
import { DocImportModal } from "./DocImportModal";
import type { DocCategory, DocEntry } from "@/lib/data/documents";

const UNLOCK_KEY = "cino_unlocked_docs";

function getUnlocked(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(UNLOCK_KEY) || "{}"); } catch { return {}; }
}
function checkUnlocked(doc: DocEntry, map: Record<string, number>): boolean {
  if (!doc.restricted) return true;
  const ts = map[doc.id];
  if (!ts) return false;
  if (doc.restricted.expiresAt) return Date.now() < new Date(doc.restricted.expiresAt).getTime();
  return true;
}
function saveUnlock(id: string) {
  const m = getUnlocked(); m[id] = Date.now();
  localStorage.setItem(UNLOCK_KEY, JSON.stringify(m));
}

function TypeIcon({ type }: { type: DocEntry["type"] }) {
  if (type === "xls")  return <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />;
  if (type === "doc" || type === "docx") return <FileType className="w-5 h-5 text-blueSoft shrink-0" />;
  return <FileText className="w-5 h-5 text-redSoft shrink-0" />;
}
function TypeBadge({ type }: { type: DocEntry["type"] }) {
  const cls =
    type === "pdf" ? "text-redSoft bg-redSoft/10" :
    type === "xls" ? "text-emerald-400 bg-emerald-400/10" :
                     "text-blueSoft bg-blueSoft/10";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${cls}`}>{type.toUpperCase()}</span>;
}

export function DocumentsSection() {
  const [search, setSearch]       = useState("");
  const [activeCat, setActiveCat] = useState<DocCategory | "all">("all");

  // Admin mode
  const [adminMode, setAdminMode]   = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [showImport, setShowImport]       = useState(false);

  // Custom docs
  const [customDocs, setCustomDocs] = useState<DocEntry[]>(() => getCustomDocs());

  // Doc unlock
  const [lockDocId, setLockDocId] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => {
    const map = getUnlocked();
    return new Set([...DOCUMENTS, ...getCustomDocs()].filter((d) => checkUnlocked(d, map)).map((d) => d.id));
  });

  const allDocs = useMemo(() => [...DOCUMENTS, ...customDocs], [customDocs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allDocs.filter((d) => {
      const matchCat    = activeCat === "all" || d.category === activeCat;
      const matchSearch = !q || d.label.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCat, allDocs]);

  function triggerDownload(doc: DocEntry) {
    const a = document.createElement("a");
    a.href = `/matrices/${encodeURIComponent(doc.filename)}`;
    a.download = doc.filename;
    a.click();
  }
  function handleDownload(doc: DocEntry) {
    if (doc.restricted && !unlockedIds.has(doc.id)) {
      setLockDocId(doc.id); setCodeInput(""); setCodeError(false);
    } else {
      triggerDownload(doc);
    }
  }
  function handleUnlock() {
    const doc = allDocs.find((d) => d.id === lockDocId);
    if (!doc?.restricted) return;
    if (codeInput.trim().toLowerCase() !== doc.restricted.code.toLowerCase()) {
      setCodeError(true); return;
    }
    saveUnlock(doc.id);
    setUnlockedIds((prev) => { const s = new Set(prev); s.add(doc.id); return s; });
    setLockDocId(null);
    triggerDownload(doc);
  }

  function tryAdminUnlock() {
    if (adminInput.trim().toUpperCase() === ADMIN_CODE) {
      setAdminMode(true); setShowAdminGate(false); setAdminError(false);
    } else {
      setAdminError(true);
    }
  }

  function handleSaveDoc(doc: DocEntry) {
    upsertCustomDoc(doc);
    setCustomDocs(getCustomDocs());
  }
  function handleDeleteDoc(id: string) {
    deleteCustomDoc(id);
    setCustomDocs(getCustomDocs());
  }

  const lockDoc = allDocs.find((d) => d.id === lockDocId);

  return (
    <div className="px-4 pt-6 pb-10 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Documents</h2>
          <p className="text-xs text-muted mt-0.5">Films « Tropiques Criminels » Saison 8</p>
        </div>
        {adminMode ? (
          <button
            onClick={() => setShowImport(true)}
            className="active-pill flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Importer
          </button>
        ) : (
          <button
            onClick={() => { setShowAdminGate(true); setAdminInput(""); setAdminError(false); }}
            className="glass-card flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted"
          >
            <Plus className="w-3.5 h-3.5" /> Importer
          </button>
        )}
      </div>

      {adminMode && (
        <div className="rounded-2xl px-3 py-2 text-xs font-medium text-cyan flex items-center justify-between"
          style={{ background: "rgba(0,224,208,0.08)", border: "1px solid rgba(0,224,208,0.2)" }}>
          <span>Mode admin actif</span>
          <button onClick={() => setAdminMode(false)} className="text-muted hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher un document…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-stroke rounded-2xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan/40"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DOC_CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveCat(id)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeCat === id ? "active-pill" : "glass-card text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""}
        {search && <span> pour « {search} »</span>}
      </p>

      {/* Liste */}
      <div className="space-y-2">
        {filtered.map((doc) => {
          const locked  = !!doc.restricted && !unlockedIds.has(doc.id);
          const isCustom = customDocs.some((d) => d.id === doc.id);
          return (
            <div key={doc.id} className="glass-card rounded-2xl p-4 flex items-start gap-3">
              <TypeIcon type={doc.type} />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start gap-2 justify-between">
                  <p className="text-sm font-semibold text-white leading-snug">{doc.label}</p>
                  <TypeBadge type={doc.type} />
                </div>
                <p className="text-xs text-muted leading-relaxed">{doc.description}</p>
                {doc.dateDoc && <p className="text-[10px] text-muted">Mis à jour le {doc.dateDoc}</p>}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catColor(doc.category)}`}>
                      {catLabel(doc.category)}
                    </span>
                    {doc.restricted && (
                      <span className="text-[10px] font-semibold text-muted px-2 py-0.5 rounded-full bg-white/5">
                        <Lock className="w-2.5 h-2.5 inline mr-0.5" />
                        {doc.restricted.expiresAt
                          ? `exp. ${new Date(doc.restricted.expiresAt).toLocaleDateString("fr-FR")}`
                          : "protégé"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {adminMode && isCustom && (
                      <button onClick={() => handleDeleteDoc(doc.id)} className="text-muted hover:text-redSoft p-1 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(doc)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 ${locked ? "glass-card text-muted" : "bg-cyan/10 text-cyan"}`}
                    >
                      {locked ? <Lock className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                      {locked ? "Code requis" : "Télécharger"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-muted text-sm py-10">Aucun document trouvé.</p>
        )}
      </div>

      {/* Modale admin gate */}
      {showAdminGate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdminGate(false); }}
        >
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4"
            style={{ background: "oklch(0.14 0.02 220)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Accès administration</p>
              <button onClick={() => setShowAdminGate(false)} className="text-muted p-1 -m-1"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Code d&apos;accès</label>
              <input
                autoFocus
                type="text"
                value={adminInput}
                onChange={(e) => { setAdminInput(e.target.value); setAdminError(false); }}
                onKeyDown={(e) => e.key === "Enter" && tryAdminUnlock()}
                placeholder="Code PROD…"
                className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40"
              />
              {adminError && <p className="text-xs text-redSoft mt-1">Code incorrect.</p>}
            </div>
            <button onClick={tryAdminUnlock} className="active-pill w-full py-3 rounded-2xl text-sm font-semibold">
              Accéder
            </button>
          </div>
        </div>
      )}

      {/* Modale import doc */}
      {showImport && (
        <DocImportModal
          onClose={() => setShowImport(false)}
          onSave={handleSaveDoc}
        />
      )}

      {/* Modale code d'accès utilisateur */}
      {lockDocId && lockDoc && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setLockDocId(null); }}
        >
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4"
            style={{ background: "oklch(0.14 0.02 220)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-white">Accès protégé</p>
                <p className="text-xs text-muted mt-0.5 leading-snug">{lockDoc.label}</p>
              </div>
              <button onClick={() => setLockDocId(null)} className="text-muted p-1 -m-1"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Code d&apos;accès</label>
              <input
                autoFocus type="text" value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value); setCodeError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="Entrer le code…"
                className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40"
              />
              {codeError && <p className="text-xs text-redSoft mt-1">Code incorrect.</p>}
              {lockDoc.restricted?.expiresAt && (
                <p className="text-xs text-muted mt-1">
                  Accès valable jusqu&apos;au {new Date(lockDoc.restricted.expiresAt).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
            <button onClick={handleUnlock} className="active-pill w-full py-3 rounded-2xl text-sm font-semibold">
              Déverrouiller et télécharger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
