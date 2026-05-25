"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Edit3, FolderOpen, Palette, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore, getActiveProject } from "@/lib/store/useProjectStore";
import { useShootStore } from "@/lib/store/useShootStore";
import type { Project } from "@/lib/supabase/types";
import type { RestrictableInfo, VisibilityLevel } from "@/lib/types/shoot";
import { extractMsg } from "@/lib/utils";

const RESTRICTABLE: { id: RestrictableInfo; label: string; desc: string }[] = [
  { id: "castContacts",   label: "Contacts comédiens",  desc: "Numéros, loges, infos privées." },
  { id: "deptCallTimes",  label: "Convocations par dept", desc: "Heures précises de chaque équipe." },
  { id: "fraisDashboard", label: "Tableau de bord frais", desc: "Sommes globales des notes de frais." },
  { id: "auditLog",       label: "Journal des modifications", desc: "Qui a édité quoi, quand." },
  { id: "wrapTime",       label: "Fin prévue de tournage", desc: "Horaire estimé de wrap." },
];

const LEVELS: { value: VisibilityLevel; label: string }[] = [
  { value: "everyone",   label: "Tous" },
  { value: "department", label: "Section" },
  { value: "production", label: "Prod seule" },
];

const ACCENT_PALETTE = [
  { name: "Cyan",   value: null,       sample: "#00E0D0" }, // default
  { name: "Émeraude", value: "#10B981", sample: "#10B981" },
  { name: "Violet", value: "#8B5CF6",   sample: "#8B5CF6" },
  { name: "Ambre",  value: "#F59E0B",   sample: "#F59E0B" },
  { name: "Rouge",  value: "#EF4444",   sample: "#EF4444" },
];

export function AdminProjectPanel() {
  const { user, setActiveProject, projects, addProject } = useProjectStore();
  const activeProject = useProjectStore(getActiveProject);
  const customization = useShootStore((s) => s.shoot.customization);
  const setCustomization = useShootStore((s) => s.setCustomization);

  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(activeProject?.name ?? "");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [rotateError, setRotateError] = useState<string | null>(null);

  const isOwner = activeProject?.owner_id === user?.id;

  function copyCode() {
    if (!activeProject?.invite_code) return;
    void navigator.clipboard.writeText(activeProject.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleRotate() {
    if (!activeProject) return;
    setRotating(true);
    setRotateError(null);
    try {
      const { data, error } = await supabase.rpc("rotate_invite_code", {
        p_project_id: activeProject.id,
      });
      if (error || !data) throw new Error(error?.message ?? "Échec de la régénération");
      // Patch in-memory project list to reflect the new code
      const updated: Project = { ...activeProject, invite_code: data as string };
      addProject(updated);
      setActiveProject(updated.id);
    } catch (e) {
      setRotateError(extractMsg(e));
    } finally {
      setRotating(false);
    }
  }

  async function handleRename() {
    if (!activeProject) return;
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === activeProject.name) {
      setRenaming(false);
      return;
    }
    setRenameError(null);
    try {
      const { data, error } = await supabase.rpc("update_project_name", {
        p_project_id: activeProject.id,
        p_new_name: trimmed,
      });
      if (error || !data) throw new Error(error?.message ?? "Échec du renommage");
      addProject(data as Project);
      setActiveProject(activeProject.id);
      setRenaming(false);
    } catch (e) {
      setRenameError(extractMsg(e));
    }
  }

  function handleSwitchProject() {
    setActiveProject(null);
  }

  if (!activeProject) {
    return (
      <div className="glass-card rounded-app p-4 text-sm text-muted">
        Aucun projet actif.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Identité du projet ───────────────────────────────────────── */}
      <div className="glass-card rounded-app p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-cyan" />
          <p className="text-sm font-semibold text-white">Projet actif</p>
        </div>

        {/* Nom — éditable inline */}
        {renaming ? (
          <div className="space-y-2">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => { setRenameValue(e.target.value); setRenameError(null); }}
              className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40"
              autoFocus
            />
            {renameError && <p className="text-xs text-danger">{renameError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setRenaming(false); setRenameValue(activeProject.name); setRenameError(null); }}
                className="flex-1 py-1.5 rounded-xl text-xs text-muted glass-card"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleRename()}
                className="flex-1 py-1.5 rounded-xl text-xs font-semibold active-pill"
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-white flex-1 truncate">{activeProject.name}</p>
            {isOwner && (
              <button
                onClick={() => { setRenameValue(activeProject.name); setRenaming(true); }}
                className="text-muted hover:text-cyan p-1"
                aria-label="Renommer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Code d'invitation */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted uppercase tracking-widest">Code d&apos;invitation</p>
          <div className="flex items-center gap-2 bg-white/5 border border-stroke rounded-xl px-3 py-2.5">
            <span className="font-mono text-xl font-bold text-cyan tracking-widest flex-1">
              {activeProject.invite_code}
            </span>
            <button onClick={copyCode} aria-label="Copier le code">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted hover:text-white" />}
            </button>
          </div>
          {isOwner && (
            <button
              onClick={() => void handleRotate()}
              disabled={rotating}
              className="text-xs text-warning underline underline-offset-2 flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${rotating ? "animate-spin" : ""}`} />
              {rotating ? "Régénération…" : "Régénérer le code"}
            </button>
          )}
          {rotateError && <p className="text-xs text-danger">{rotateError}</p>}
          <p className="text-[10px] text-muted leading-relaxed">
            {isOwner
              ? "Régénérer invalide l'ancien code. Préviens l'équipe avant."
              : "Seul le propriétaire peut régénérer le code."}
          </p>
        </div>

        {/* Changer de projet */}
        <button
          onClick={handleSwitchProject}
          className="w-full py-2.5 rounded-xl text-xs font-semibold glass-card text-textSoft flex items-center justify-center gap-1.5"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Changer de projet ({projects.length})
        </button>
      </div>

      {/* ── Apparence ────────────────────────────────────────────────── */}
      <div className="glass-card rounded-app p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan" />
          <p className="text-sm font-semibold text-white">Couleur d&apos;accent</p>
          <span className="text-[9px] text-muted bg-white/5 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Bientôt
          </span>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          Choix sauvegardé pour ce projet. La propagation visuelle à toute l&apos;app arrive dans une prochaine version.
        </p>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_PALETTE.map((c) => {
            const active = (customization?.accentColor ?? null) === c.value;
            return (
              <button
                key={c.name}
                onClick={() => setCustomization({ accentColor: c.value })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  active ? "bg-white/10 ring-1 ring-cyan/40" : "bg-white/5 hover:bg-white/8"
                }`}
              >
                <span className="w-4 h-4 rounded-full shrink-0" style={{ background: c.sample }} />
                <span className="text-white">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Permissions par info ─────────────────────────────────────── */}
      <div className="glass-card rounded-app p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan" />
          <p className="text-sm font-semibold text-white">Restrictions de visibilité</p>
        </div>

        {/* Toggle master */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">Activer les restrictions</p>
            <p className="text-[10px] text-muted leading-relaxed">
              Désactivé : tout le monde voit tout (comportement par défaut, identique à avant).
            </p>
          </div>
          <button
            onClick={() => setCustomization({ restrictionsEnabled: !customization?.restrictionsEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
              customization?.restrictionsEnabled ? "bg-cyan" : "bg-white/15"
            }`}
            aria-label="Activer les restrictions"
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              customization?.restrictionsEnabled ? "left-6" : "left-1"
            }`} />
          </button>
        </div>

        {/* Per-info matrix (only meaningful when master is on) */}
        {customization?.restrictionsEnabled && (
          <div className="space-y-2 pt-1">
            {RESTRICTABLE.map((info) => {
              const current: VisibilityLevel = customization.permissions[info.id] ?? "everyone";
              return (
                <div key={info.id} className="space-y-1.5">
                  <div>
                    <p className="text-xs font-semibold text-white">{info.label}</p>
                    <p className="text-[10px] text-muted leading-tight">{info.desc}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setCustomization({
                          permissions: { ...customization.permissions, [info.id]: l.value },
                        })}
                        className={`py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          current === l.value
                            ? "bg-cyanSoft text-cyan border border-cyan/30"
                            : "bg-white/5 text-muted border border-stroke"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-muted leading-relaxed pt-1 flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
              <span>
                « Section » = membres du même département que l&apos;info. La Production voit toujours tout.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
