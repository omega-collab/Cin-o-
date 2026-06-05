"use client";

import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useIntermittentStore } from "@/lib/store/useIntermittentStore";
import { useProjectStore } from "@/lib/store/useProjectStore";
import type { WorkDay, ConventionType } from "@/lib/types/intermittent";

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
  created_at: string;
  updated_at: string;
}

function rowToWorkDay(row: WorkDayRow): WorkDay {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    lunchStart: row.lunch_start ?? undefined,
    lunchEnd: row.lunch_end ?? undefined,
    convention: row.convention,
    notes: row.notes ?? undefined,
  };
}

function workDayToInsert(day: Omit<WorkDay, "id">, userId: string, projectId: string | null) {
  return {
    user_id: userId,
    project_id: projectId,
    date: day.date,
    start_time: day.startTime,
    end_time: day.endTime,
    lunch_start: day.lunchStart ?? null,
    lunch_end: day.lunchEnd ?? null,
    convention: day.convention,
    notes: day.notes ?? null,
  };
}

/**
 * Pull les workdays du user connecté depuis Supabase au mount, et expose
 * des wrappers `addRemote/updateRemote/deleteRemote` qui synchronisent
 * Supabase + le store local Zustand.
 *
 * À monter sur les pages qui affichent ou éditent les workdays :
 * /heures, /today (carte de pointage).
 */
export function useWorkDaysSync() {
  const user = useProjectStore((s) => s.user);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  // Évite les loads concurrents si le hook est monté plusieurs fois.
  const loadingRef = useRef(false);

  const loadFromRemote = useCallback(async () => {
    if (!user || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const { data, error } = await supabase
        .from("work_days")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error || !data) return;
      const rows = data as WorkDayRow[];
      const remoteDays = rows.map(rowToWorkDay);
      const localDays = useIntermittentStore.getState().workDays;
      // Merge : on conserve les WorkDay locaux qui ne sont PAS encore sur
      // Supabase (insertions hors-ligne) — on les détecte par leur date
      // (clé unique côté serveur). Pour les autres, le remote est source
      // of truth.
      const remoteDates = new Set(remoteDays.map((d) => d.date));
      const localOnly = localDays.filter((d) => !remoteDates.has(d.date));
      const merged = [...remoteDays, ...localOnly].sort((a, b) =>
        b.date.localeCompare(a.date)
      );
      useIntermittentStore.setState({ workDays: merged });
    } finally {
      loadingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    void loadFromRemote();
  }, [loadFromRemote]);

  const addRemote = useCallback(
    async (day: Omit<WorkDay, "id">): Promise<WorkDay | null> => {
      if (!user) return null;
      const payload = workDayToInsert(day, user.id, activeProjectId);
      // Upsert sur (user_id, date) : si le pointage du jour existe déjà,
      // on le remplace au lieu de bloquer en doublon.
      const { data, error } = await supabase
        .from("work_days")
        .upsert(payload, { onConflict: "user_id,date" })
        .select()
        .single();
      if (error || !data) return null;
      const inserted = rowToWorkDay(data as WorkDayRow);
      useIntermittentStore.setState((s) => {
        // Remplace l'entrée locale du même jour si présente, sinon prepend
        const idx = s.workDays.findIndex((d) => d.date === inserted.date);
        const next = idx >= 0
          ? s.workDays.map((d) => (d.date === inserted.date ? inserted : d))
          : [inserted, ...s.workDays];
        return {
          workDays: next.sort((a, b) => b.date.localeCompare(a.date)),
        };
      });
      return inserted;
    },
    [user, activeProjectId]
  );

  const updateRemote = useCallback(
    async (id: string, patch: Partial<Omit<WorkDay, "id">>) => {
      if (!user) return;
      const dbPatch: Record<string, unknown> = {};
      if (patch.date !== undefined) dbPatch.date = patch.date;
      if (patch.startTime !== undefined) dbPatch.start_time = patch.startTime;
      if (patch.endTime !== undefined) dbPatch.end_time = patch.endTime;
      if (patch.lunchStart !== undefined) dbPatch.lunch_start = patch.lunchStart ?? null;
      if (patch.lunchEnd !== undefined) dbPatch.lunch_end = patch.lunchEnd ?? null;
      if (patch.convention !== undefined) dbPatch.convention = patch.convention;
      if (patch.notes !== undefined) dbPatch.notes = patch.notes ?? null;
      const { data, error } = await supabase
        .from("work_days")
        .update(dbPatch)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error || !data) return;
      const updated = rowToWorkDay(data as WorkDayRow);
      useIntermittentStore.setState((s) => ({
        workDays: s.workDays.map((d) => (d.id === id ? updated : d)),
      }));
    },
    [user]
  );

  const deleteRemote = useCallback(
    async (id: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("work_days")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) return;
      useIntermittentStore.setState((s) => ({
        workDays: s.workDays.filter((d) => d.id !== id),
      }));
    },
    [user]
  );

  return { addRemote, updateRemote, deleteRemote, refresh: loadFromRemote };
}
