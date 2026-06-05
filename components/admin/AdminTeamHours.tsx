"use client";

import { useMemo, useState } from "react";
import { Users, ChevronDown, ChevronUp, Clock, Calendar, AlertCircle } from "lucide-react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useProjectWorkDays, type TeamWorkDay } from "@/lib/hooks/useProjectWorkDays";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DeptIcon } from "@/components/ui/DeptIcon";
import { computeDay, fmtMinutes, frDate } from "@/lib/utils/intermittent";
import type { DepartmentSlug } from "@/lib/types";

// Groupe les workdays par département puis par personne. Les workdays sans
// département identifié sont rassemblés sous "Non assigné".
function groupByDeptAndUser(workDays: TeamWorkDay[]) {
  const byDept = new Map<string, Map<string, { user: TeamWorkDay["user"]; days: TeamWorkDay[] }>>();
  for (const wd of workDays) {
    const deptKey = wd.user.department ?? "_none";
    if (!byDept.has(deptKey)) byDept.set(deptKey, new Map());
    const deptUsers = byDept.get(deptKey)!;
    if (!deptUsers.has(wd.userId)) {
      deptUsers.set(wd.userId, { user: wd.user, days: [] });
    }
    deptUsers.get(wd.userId)!.days.push(wd);
  }
  return byDept;
}

function PersonCard({ user, days }: { user: TeamWorkDay["user"]; days: TeamWorkDay[] }) {
  const [open, setOpen] = useState(false);

  // Totaux pour cette personne (sommes sur tous les jours)
  const totals = useMemo(() => {
    let effective = 0;
    let normales = 0;
    let sup = 0;
    let nuit = 0;
    for (const d of days) {
      const c = computeDay(d);
      effective += c.effectiveMinutes;
      normales += c.heuresNormales * 60;
      sup += c.heuresSup * 60;
      nuit += c.heuresDeNuit * 60;
    }
    return { effective, normales, sup, nuit, jours: days.length };
  }, [days]);

  return (
    <div className="glass-card rounded-app overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-white/5 transition-colors"
      >
        <div
          className="w-9 h-9 rounded-full bg-cyanSoft text-cyan flex items-center justify-center text-xs font-bold shrink-0"
          aria-label={user.displayName}
        >
          {user.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
          <p className="text-[11px] text-muted truncate">
            {user.role || "—"} · {totals.jours} jour{totals.jours > 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right shrink-0 mr-2">
          <p className="text-xs font-mono text-cyan font-semibold">{fmtMinutes(totals.effective)}</p>
          {totals.sup > 0 && (
            <p className="text-[10px] font-mono text-warning">+{fmtMinutes(totals.sup)} sup</p>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-stroke/30 divide-y divide-stroke/20">
          {days.map((d) => {
            const c = computeDay(d);
            const hasNight = c.heuresDeNuit > 0;
            return (
              <div key={d.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-textSoft font-medium capitalize">{frDate(d.date)}</p>
                  <p className="text-[10px] text-muted font-mono">
                    {d.startTime} → {d.endTime}
                    {d.lunchStart && d.lunchEnd && (
                      <> · pause {d.lunchStart}–{d.lunchEnd}</>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-cyan font-mono">{fmtMinutes(c.effectiveMinutes)}</p>
                  {c.heuresSup > 0 && (
                    <p className="text-[10px] text-warning font-mono">+{c.heuresSup.toFixed(1)}h sup</p>
                  )}
                  {hasNight && (
                    <p className="text-[10px] text-night font-mono">{c.heuresDeNuit.toFixed(1)}h nuit</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminTeamHours() {
  const projectId = useProjectStore((s) => s.activeProjectId);
  const { workDays, loading, error } = useProjectWorkDays(projectId);

  const grouped = useMemo(() => groupByDeptAndUser(workDays), [workDays]);

  // Totaux globaux du projet
  const globalTotals = useMemo(() => {
    let effective = 0;
    let sup = 0;
    let nuit = 0;
    const userIds = new Set<string>();
    for (const wd of workDays) {
      const c = computeDay(wd);
      effective += c.effectiveMinutes;
      sup += c.heuresSup * 60;
      nuit += c.heuresDeNuit * 60;
      userIds.add(wd.userId);
    }
    return { effective, sup, nuit, members: userIds.size, days: workDays.length };
  }, [workDays]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="glass-card animate-pulse rounded-app h-20" />
        <div className="glass-card animate-pulse rounded-app h-32" />
        <div className="glass-card animate-pulse rounded-app h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-app p-5 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-danger">Chargement impossible</p>
          <p className="text-xs text-muted mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (workDays.length === 0) {
    return (
      <div className="glass-card rounded-app p-8 text-center space-y-2">
        <Users className="w-8 h-8 text-muted mx-auto" />
        <p className="text-sm text-white font-semibold">Aucune heure enregistrée</p>
        <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">
          Les membres pointent depuis leur page d&apos;accueil. Les heures apparaîtront
          ici dès qu&apos;un membre clique « Fin de journée ».
        </p>
      </div>
    );
  }

  // Trie les départements selon l'ordre DEPARTMENTS, puis "_none" à la fin
  const deptOrder = new Map(DEPARTMENTS.map((d, i) => [d.slug, i]));
  const sortedDepts = Array.from(grouped.entries()).sort(([a], [b]) => {
    const ai = deptOrder.has(a as DepartmentSlug) ? deptOrder.get(a as DepartmentSlug)! : 999;
    const bi = deptOrder.has(b as DepartmentSlug) ? deptOrder.get(b as DepartmentSlug)! : 999;
    return ai - bi;
  });

  return (
    <div className="space-y-5">
      {/* Totaux globaux du projet */}
      <div className="glass-card-strong rounded-app p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-cyan" />
          <p className="text-sm font-semibold text-white">Heures équipe</p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-white">{globalTotals.members}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Pers.</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{globalTotals.days}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Pointages</p>
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-cyan">{fmtMinutes(globalTotals.effective)}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Travaillées</p>
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-warning">{fmtMinutes(globalTotals.sup)}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Sup.</p>
          </div>
        </div>
      </div>

      {/* Groupement par département → par personne */}
      {sortedDepts.map(([deptKey, users]) => {
        const dept = DEPARTMENTS.find((d) => d.slug === deptKey);
        const deptName = dept?.name ?? "Non assigné";
        const userList = Array.from(users.values()).sort((a, b) =>
          a.user.displayName.localeCompare(b.user.displayName)
        );
        const deptTotal = userList.reduce((acc, { days }) => {
          for (const d of days) acc += computeDay(d).effectiveMinutes;
          return acc;
        }, 0);
        return (
          <div key={deptKey} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                {dept ? (
                  <DeptIcon slug={dept.slug} className="w-3.5 h-3.5 text-cyan" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-muted" />
                )}
                <p className="text-xs font-semibold uppercase tracking-wider text-textSoft">
                  {deptName}
                </p>
                <span className="text-[10px] text-muted">
                  · {userList.length} pers.
                </span>
              </div>
              <p className="text-xs font-mono text-cyan font-semibold">
                {fmtMinutes(deptTotal)}
              </p>
            </div>
            <div className="space-y-2">
              {userList.map(({ user, days }) => (
                <PersonCard key={days[0]?.id ?? user.initials} user={user} days={days} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
