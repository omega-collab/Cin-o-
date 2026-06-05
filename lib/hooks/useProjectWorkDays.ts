"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { WorkDay, ConventionType } from "@/lib/types/intermittent";
import type { DepartmentSlug } from "@/lib/types";

interface WorkDayRow {
  id: string;
  user_id: string;
  project_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  convention: ConventionType;
  notes: string | null;
}

interface ProfileRow {
  id: string;
  display_name: string;
  initials: string;
  department: DepartmentSlug | null;
  role: string | null;
  avatar_id: string | null;
}

export interface TeamWorkDay extends WorkDay {
  userId: string;
  user: {
    displayName: string;
    initials: string;
    department: DepartmentSlug | null;
    role: string | null;
    avatarId: string | null;
  };
}

interface UseProjectWorkDaysReturn {
  workDays: TeamWorkDay[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function rowToWorkDay(row: WorkDayRow): WorkDay & { userId: string } {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    lunchStart: row.lunch_start ?? undefined,
    lunchEnd: row.lunch_end ?? undefined,
    convention: row.convention,
    notes: row.notes ?? undefined,
  };
}

/**
 * Charge toutes les workdays liées à un projet, enrichies avec le profil
 * (display_name, department, role) de chaque user. Accessible uniquement
 * aux users dont profiles.department = 'production' (RLS work_days
 * étendue dans la migration 20260604130000).
 *
 * Pour les autres users, la query ne retournera que leurs propres
 * workdays — silencieusement, ce qui est correct côté RLS.
 */
export function useProjectWorkDays(projectId: string | null): UseProjectWorkDaysReturn {
  const [workDays, setWorkDays] = useState<TeamWorkDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setWorkDays([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: wdData, error: wdErr } = await supabase
        .from("work_days")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: false });

      if (wdErr) throw wdErr;
      const rows = (wdData as WorkDayRow[]) ?? [];
      if (rows.length === 0) {
        setWorkDays([]);
        return;
      }

      // Charger les profils des users concernés en une seule query
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      const { data: profilesData, error: profErr } = await supabase
        .from("profiles")
        .select("id, display_name, initials, department, role, avatar_id")
        .in("id", userIds);

      if (profErr) throw profErr;
      const profiles = new Map<string, ProfileRow>(
        ((profilesData as ProfileRow[]) ?? []).map((p) => [p.id, p])
      );

      const enriched: TeamWorkDay[] = rows.map((row) => {
        const wd = rowToWorkDay(row);
        const profile = profiles.get(row.user_id);
        return {
          ...wd,
          user: {
            displayName: profile?.display_name ?? "Utilisateur inconnu",
            initials: profile?.initials ?? "??",
            department: profile?.department ?? null,
            role: profile?.role ?? null,
            avatarId: profile?.avatar_id ?? null,
          },
        };
      });

      setWorkDays(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setWorkDays([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { workDays, loading, error, refresh: load };
}
