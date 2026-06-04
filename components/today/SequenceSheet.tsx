"use client";
import { useState } from "react";
import {
  X,
  Users,
  FileText,
  Info,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { useDeptNotesStore } from "@/lib/store/useDeptNotesStore";
import type { ShootSequence, DeptNote } from "@/lib/types/shoot";
import type { DepartmentSlug } from "@/lib/types";
import { matchesDept } from "@/lib/utils/deptNoteMatching";

function PriorityIcon({ p }: { p: "info" | "warning" | "critical" }) {
  if (p === "critical")
    return <AlertCircle size={11} className="text-danger shrink-0 mt-0.5" />;
  if (p === "warning")
    return <AlertTriangle size={11} className="text-warning shrink-0 mt-0.5" />;
  return <Info size={11} className="text-info shrink-0 mt-0.5" />;
}

interface Props {
  seq: ShootSequence;
  onClose: () => void;
}

export function SequenceSheet({ seq, onClose }: Props) {
  const shoot = useShootStore((s) => s.shoot);
  const department = useUserStore((s) => s.department) as DepartmentSlug | null;
  const { notes: privateNotes, addNote, deleteNote } = useDeptNotesStore();
  const [tab, setTab] = useState<"action" | "details">("action");
  const [filter, setFilter] = useState<"mine" | "all">("mine");
  const [newNote, setNewNote] = useState("");
  const [newPriority, setNewPriority] = useState<"info" | "warning" | "critical">("info");
  const [showAdd, setShowAdd] = useState(false);
  const isAdmin = department === "production";

  const allDeptNotes = shoot.deptNotes;
  const visibleDeptNotes =
    filter === "mine"
      ? allDeptNotes.filter((n) => matchesDept(n, department))
      : allDeptNotes;

  const myPrivateNotes = privateNotes.filter(
    (n) => isAdmin || n.department === department
  );

  function handleAdd() {
    if (!newNote.trim() || !department) return;
    addNote({ department, content: newNote.trim(), priority: newPriority });
    setNewNote("");
    setShowAdd(false);
  }

  const PRIORITIES: { value: "info" | "warning" | "critical"; label: string }[] = [
    { value: "info", label: "Info" },
    { value: "warning", label: "Attention" },
    { value: "critical", label: "Critique" },
  ];

  return (
    <div className="glass-card-strong rounded-2xl overflow-hidden border border-stroke/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-stroke/40">
        <div>
          <p className="text-sm font-bold text-white leading-tight">{seq.label}</p>
          <p className="text-[10px] text-muted font-mono">
            {seq.time} — {seq.location}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 text-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="glass-card rounded-xl p-0.5 flex gap-0.5">
          {(["action", "details"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all ${
                tab === t ? "active-pill" : "text-muted"
              }`}
            >
              {t === "action" ? "Action" : "Détails"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-4 space-y-3">
        {tab === "action" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <FileText size={12} className="text-cyan" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Texte du jour-à-jour
              </p>
            </div>
            {seq.script?.trim() ? (
              <p className="text-xs text-textSoft leading-relaxed whitespace-pre-line break-words">
                {seq.script}
              </p>
            ) : (
              <p className="text-xs text-muted italic py-3 text-center">
                Aucun texte disponible.
              </p>
            )}
          </div>
        )}

        {tab === "details" && (
          <>
            {/* Cast */}
            {(seq.cast?.length ?? 0) > 0 && (
              <div className="flex items-start gap-2">
                <Users size={12} className="text-muted shrink-0 mt-0.5" />
                <p className="text-xs text-textSoft leading-relaxed break-words">{seq.cast!.join(" · ")}</p>
              </div>
            )}

            {/* Notes techniques de la séquence */}
            {seq.notes?.trim() && (
              <div className="flex items-start gap-2">
                <FileText size={12} className="text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-textSoft leading-relaxed whitespace-pre-line break-words">
                  {seq.notes}
                </p>
              </div>
            )}

            {/* Filter chips for dept notes */}
            <div className="glass-card rounded-xl p-0.5 flex gap-0.5">
              {(["mine", "all"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    filter === f ? "active-pill" : "text-muted"
                  }`}
                >
                  {f === "mine" ? "Ma section" : "Tous les depts"}
                </button>
              ))}
            </div>

            {/* FDS dept notes */}
            {visibleDeptNotes.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">
                  Notes FDS
                </p>
                {visibleDeptNotes.map((n) => (
                  <div key={n.id} className="flex items-start gap-1.5">
                    <PriorityIcon p={n.priority} />
                    <div className="min-w-0">
                      {(isAdmin || filter === "all") && n.department && (
                        <span className="text-[10px] font-semibold text-muted uppercase mr-1">
                          {n.department} —
                        </span>
                      )}
                      <span className="text-xs text-textSoft break-words">{n.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted text-center py-1">
                Aucune note{filter === "mine" ? " pour ce département" : ""}.
              </p>
            )}

            {/* Private dept notes */}
            {myPrivateNotes.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Lock size={10} className="text-muted" />
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">
                    Notes privées
                  </p>
                </div>
                {myPrivateNotes.map((n) => (
                  <div key={n.id} className="flex items-start gap-1.5">
                    <PriorityIcon p={n.priority} />
                    <p className="text-xs text-textSoft flex-1 break-words">{n.content}</p>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="text-muted hover:text-danger transition-colors p-1 -m-1 shrink-0"
                      aria-label="Supprimer la note"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add private note */}
            {department && department !== "production" &&
              (showAdd ? (
                <div className="space-y-2 p-3 bg-white/3 rounded-xl border border-stroke/30">
                  <div className="flex gap-1.5">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setNewPriority(p.value)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                          newPriority === p.value
                            ? "bg-cyanSoft text-cyan"
                            : "bg-white/5 text-muted"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Note visible uniquement par votre département…"
                    rows={2}
                    className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan/40 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAdd(false)}
                      className="flex-1 py-1.5 rounded-xl text-xs text-muted bg-white/5"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAdd}
                      disabled={!newNote.trim()}
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold active-pill disabled:opacity-40"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-muted bg-white/5 border border-stroke/40 active:opacity-70"
                >
                  <Plus size={12} /> Ajouter une note privée
                </button>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
