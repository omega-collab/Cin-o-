"use client";

import { useState, useEffect } from "react";
import { Plus, Hash, Loader2, Copy, Check, FolderOpen, Film, Trash2, LogOut, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore } from "@/lib/store/useProjectStore";
import type { Project } from "@/lib/supabase/types";
import { extractMsg } from "@/lib/utils";

const PROD_CODE = "0000";

const INPUT =
  "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan/40";

export function ProjectSelector() {
  const { user, projects, setProjects, setActiveProject, addProject, removeProject } = useProjectStore();
  const [tab, setTab] = useState<"list" | "create" | "join">("list");
  const [projectName, setProjectName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  // Delete / leave state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    void loadProjects();
  }, [user]);

  async function loadProjects() {
    const { data } = await supabase
      .from("project_members")
      .select("project_id, projects(*)")
      .eq("user_id", user!.id);

    if (data) {
      const projs = data
        .map((r) => r.projects as unknown as Project | null)
        .filter((p): p is Project => p !== null);
      setProjects(projs);
      if (projs.length === 0) setTab("create");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      // Create project
      const { data: proj, error: e1 } = await supabase
        .from("projects")
        .insert({ name: projectName.trim(), owner_id: user.id })
        .select()
        .single();
      if (e1 || !proj) throw e1 ?? new Error("Création échouée");

      // Add creator as owner
      const { error: e2 } = await supabase
        .from("project_members")
        .insert({ project_id: proj.id, user_id: user.id, role: "owner" });
      if (e2) throw e2;

      // Init empty data
      await supabase.from("project_data").insert({
        project_id: proj.id,
        shoot_store: {},
        department_store: {},
        updated_by: user.id,
      });

      addProject(proj);
      setCreatedProject(proj);
    } catch (err: unknown) {
      const msg = extractMsg(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const code = inviteCode.trim().toUpperCase();
      const { data: proj, error: e1 } = await supabase
        .from("projects")
        .select()
        .eq("invite_code", code)
        .single();
      if (e1 || !proj) throw new Error("Code invalide — vérifiez et réessayez.");

      // Check not already member
      const already = projects.find((p) => p.id === proj.id);
      if (already) {
        setActiveProject(proj.id);
        return;
      }

      const { error: e2 } = await supabase
        .from("project_members")
        .insert({ project_id: proj.id, user_id: user.id, role: "member" });
      if (e2) throw e2;

      addProject(proj);
      setActiveProject(proj.id);
    } catch (err: unknown) {
      const msg = extractMsg(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!deleteTarget || !user) return;
    if (deleteCode !== PROD_CODE) {
      setDeleteError("Code incorrect.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const { error: err } = await supabase.from("projects").delete().eq("id", deleteTarget.id);
      if (err) throw err;
      removeProject(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteCode("");
      if (projects.length - 1 === 0) setTab("create");
    } catch (err) {
      setDeleteError(extractMsg(err, "Suppression impossible — vous n'êtes peut-être pas propriétaire."));
    } finally {
      setDeleting(false);
    }
  }

  async function handleLeave(proj: Project) {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const { error: err } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", proj.id)
        .eq("user_id", user.id);
      if (err) throw err;
      removeProject(proj.id);
      setDeleteTarget(null);
      if (projects.length - 1 === 0) setTab("create");
    } catch (err) {
      setDeleteError(extractMsg(err, "Impossible de quitter ce projet."));
    } finally {
      setDeleting(false);
    }
  }

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Show new project confirmation with invite code
  if (createdProject) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <Film className="w-10 h-10 text-cyan mx-auto" />
            <h1 className="text-xl font-bold text-white mt-2">Projet créé !</h1>
            <p className="text-sm text-muted mt-1">Partagez ce code à votre équipe</p>
          </div>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">{createdProject.name}</p>
            <div className="flex items-center gap-3 bg-white/5 border border-stroke rounded-xl px-4 py-3">
              <span className="font-mono text-2xl font-bold text-cyan tracking-widest flex-1">
                {createdProject.invite_code}
              </span>
              <button onClick={() => copyCode(createdProject.invite_code)}>
                {copied
                  ? <Check className="w-5 h-5 text-green-400" />
                  : <Copy className="w-5 h-5 text-muted hover:text-white" />}
              </button>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Les membres de l'équipe saisissent ce code dans "Rejoindre un projet" pour accéder aux données en temps réel.
            </p>
            <button
              onClick={() => setActiveProject(createdProject.id)}
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm"
            >
              Ouvrir le projet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <Film className="w-10 h-10 text-cyan mx-auto" />
          <h1 className="text-xl font-bold text-white mt-2">Choisir un projet</h1>
        </div>

        {/* Existing projects */}
        {projects.length > 0 && tab !== "create" && tab !== "join" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Mes projets</p>
            {projects.map((proj) => {
              const isOwner = proj.owner_id === user?.id;
              const isTarget = deleteTarget?.id === proj.id;
              return (
                <div key={proj.id} className="space-y-1">
                  <div className={`glass-card rounded-2xl p-4 flex items-center gap-3 transition-colors ${isTarget ? "border-redSoft/40" : "hover:border-cyan/30"}`}>
                    <button
                      onClick={() => setActiveProject(proj.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <FolderOpen className="w-5 h-5 text-cyan shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{proj.name}</p>
                        <p className="text-xs text-muted font-mono">{proj.invite_code}</p>
                      </div>
                    </button>
                    {isTarget ? (
                      <button
                        onClick={() => { setDeleteTarget(null); setDeleteCode(""); setDeleteError(""); }}
                        className="shrink-0 w-8 h-8 flex items-center justify-center text-muted hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(proj); setDeleteCode(""); setDeleteError(""); }}
                        className="shrink-0 w-8 h-8 flex items-center justify-center text-muted hover:text-redSoft"
                        title={isOwner ? "Supprimer le projet" : "Quitter le projet"}
                      >
                        {isOwner ? <Trash2 className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Inline confirmation panel */}
                  {isTarget && (
                    <div className="glass-card rounded-2xl p-4 border border-redSoft/30 space-y-3">
                      {isOwner ? (
                        <>
                          <p className="text-sm font-semibold text-white">Supprimer &quot;{proj.name}&quot; ?</p>
                          <p className="text-xs text-muted">Cette action est irréversible. Tous les membres perdront l&apos;accès.</p>
                          <form onSubmit={(e) => void handleDelete(e)} className="space-y-3">
                            <div>
                              <label className="text-xs text-muted block mb-1">Code de production</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="_ _ _ _"
                                value={deleteCode}
                                onChange={(e) => { setDeleteCode(e.target.value); setDeleteError(""); }}
                                maxLength={8}
                                autoFocus
                                className={`${INPUT} font-mono tracking-widest text-center text-lg`}
                              />
                              {deleteError && <p className="text-xs text-redSoft mt-1">{deleteError}</p>}
                            </div>
                            <button
                              type="submit"
                              disabled={deleting || !deleteCode}
                              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-redSoft/20 text-redSoft border border-redSoft/30 flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer la suppression"}
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-white">Quitter &quot;{proj.name}&quot; ?</p>
                          <p className="text-xs text-muted">Vous pourrez rejoindre à nouveau avec le code d&apos;invitation.</p>
                          {deleteError && <p className="text-xs text-redSoft">{deleteError}</p>}
                          <button
                            onClick={() => void handleLeave(proj)}
                            disabled={deleting}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-redSoft/20 text-redSoft border border-redSoft/30 flex items-center justify-center gap-2 disabled:opacity-40"
                          >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Quitter le projet"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="glass-card rounded-2xl p-1 flex gap-1 overflow-hidden">
          {projects.length > 0 && (
            <button
              onClick={() => { setTab("list"); setError(""); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all truncate ${tab === "list" ? "active-pill" : "text-muted"}`}
            >
              Projets
            </button>
          )}
          <button
            onClick={() => { setTab("create"); setError(""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all truncate ${tab === "create" ? "active-pill" : "text-muted"}`}
          >
            Créer
          </button>
          <button
            onClick={() => { setTab("join"); setError(""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all truncate ${tab === "join" ? "active-pill" : "text-muted"}`}
          >
            Rejoindre
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {tab === "create" && (
          <form onSubmit={(e) => void handleCreate(e)} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan" />
              <p className="text-sm font-semibold text-white">Nouveau projet</p>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Nom du projet / tournage</label>
              <input
                type="text"
                placeholder="ex. Tropiques Criminels S7"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className={INPUT}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !projectName.trim()}
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le projet"}
            </button>
          </form>
        )}

        {tab === "join" && (
          <form onSubmit={(e) => void handleJoin(e)} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan" />
              <p className="text-sm font-semibold text-white">Rejoindre par code</p>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Code d'invitation</label>
              <input
                type="text"
                placeholder="ex. TROP42"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                maxLength={8}
                className={`${INPUT} font-mono tracking-widest uppercase text-cyan text-center text-lg`}
              />
            </div>
            <button
              type="submit"
              disabled={loading || inviteCode.trim().length < 4}
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rejoindre"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
