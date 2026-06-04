"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Hash, Copy, Check, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore, getActiveProject } from "@/lib/store/useProjectStore";
import type { Project } from "@/lib/supabase/types";

export function ProjectSwitcher() {
  const store = useProjectStore();
  const activeProject = getActiveProject(store);
  const { user, projects, profile, isSyncing, setActiveProject, addProject, signOut } = store;

  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function reset() {
    setShowCreate(false);
    setShowJoin(false);
    setName("");
    setCode("");
    setError("");
  }

  async function createProject() {
    if (!user || !name.trim()) return;
    setLoading(true);
    setError("");
    try {
      // Utilise la RPC dédup (idem ProjectSelector) — évite les doublons
      // entre membres d'équipe + initialise project_data + ajoute le owner
      // en project_members en une seule transaction côté DB.
      const { data, error: rpcErr } = await supabase
        .rpc("create_project_with_dedup", { p_name: name.trim() });
      if (rpcErr) throw rpcErr;

      const result = data as { exists: boolean; project: Project };
      if (result.exists) {
        // Projet déjà créé par un autre membre → on le rejoint directement
        const existing = projects.find((p) => p.id === result.project.id);
        if (!existing) {
          await supabase
            .from("project_members")
            .insert({ project_id: result.project.id, user_id: user.id, role: "member" })
            .then(() => undefined, () => undefined);
          addProject(result.project);
        }
        setActiveProject(result.project.id);
      } else {
        addProject(result.project);
        setActiveProject(result.project.id);
      }
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function joinProject() {
    if (!user || !code.trim()) return;
    setLoading(true);
    setError("");
    try {
      // Utilise la RPC dédiée (bypasse la RLS qui bloque les non-membres
      // de voir un projet par son invite_code). Fait l'insert dans
      // project_members puis renvoie la ligne projects en une transaction.
      const { data: proj, error: rpcErr } = await supabase
        .rpc("join_project_by_code", { p_code: code.trim().toUpperCase() });
      if (rpcErr || !proj) throw new Error(rpcErr?.message ?? "Code invalide");

      const project = proj as Project;
      const existing = projects.find((p) => p.id === project.id);
      if (!existing) addProject(project);
      setActiveProject(project.id);
      reset();
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      // Mappe les codes Postgres connus pour un message lisible
      if (/22023|Code invalide/.test(msg)) {
        setError("Code invalide — vérifiez avec l'admin du projet.");
      } else if (/42501|Non authentifié/.test(msg)) {
        setError("Vous devez être connecté pour rejoindre un projet.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!activeProject) return;
    void navigator.clipboard.writeText(activeProject.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const initials = profile?.initials ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((o) => !o); reset(); }}
        className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-cyan/20 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-cyan">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-white truncate leading-none">
            {activeProject?.name ?? "Aucun projet"}
          </p>
          <p className="text-[10px] text-muted leading-none mt-0.5 flex items-center gap-1">
            {profile?.display_name ?? user?.email?.split("@")[0]}
            {isSyncing && <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 glass-card rounded-2xl overflow-hidden shadow-xl z-50 border border-stroke/50">
          {/* Projects list */}
          {!showCreate && !showJoin && (
            <div className="p-2 space-y-0.5">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => { setActiveProject(proj.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                    proj.id === store.activeProjectId ? "bg-cyan/10 text-cyan" : "text-textSoft hover:bg-white/5"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-60" />
                  <span className="flex-1 text-left truncate font-medium">{proj.name}</span>
                  {proj.id === store.activeProjectId && (
                    <button
                      onClick={(e) => { e.stopPropagation(); copyCode(); }}
                      className="opacity-60 hover:opacity-100"
                    >
                      {copied
                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                        : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </button>
              ))}

              <div className="border-t border-stroke/50 my-1" />

              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:bg-white/5"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouveau projet
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:bg-white/5"
              >
                <Hash className="w-3.5 h-3.5" />
                Rejoindre par code
              </button>

              <div className="border-t border-stroke/50 my-1" />

              <button
                onClick={() => { void signOut(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-900/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                Se déconnecter
              </button>
            </div>
          )}

          {/* Create form */}
          {showCreate && (
            <div className="p-4 space-y-3">
              <p className="text-sm font-semibold text-white">Nouveau projet</p>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <input
                type="text"
                placeholder="Nom du tournage"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan/40"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2 rounded-xl text-xs text-muted bg-white/5">Annuler</button>
                <button
                  onClick={() => void createProject()}
                  disabled={loading || !name.trim()}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold active-pill disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Créer"}
                </button>
              </div>
            </div>
          )}

          {/* Join form */}
          {showJoin && (
            <div className="p-4 space-y-3">
              <p className="text-sm font-semibold text-white">Rejoindre un projet</p>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <input
                type="text"
                placeholder="Code d'invitation"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-cyan font-mono tracking-widest uppercase text-center focus:outline-none focus:ring-1 focus:ring-cyan/40"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2 rounded-xl text-xs text-muted bg-white/5">Annuler</button>
                <button
                  onClick={() => void joinProject()}
                  disabled={loading || code.trim().length < 4}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold active-pill disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Rejoindre"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
