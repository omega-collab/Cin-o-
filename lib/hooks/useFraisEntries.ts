"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { FraisEntry, FraisEntryInsert } from "@/lib/supabase/types";

interface UseFraisEntriesReturn {
  entries: FraisEntry[];
  loading: boolean;
  error: string | null;
  addEntry: (data: FraisEntryInsert) => Promise<FraisEntry | null>;
  updateEntry: (id: string, data: Partial<FraisEntryInsert>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFraisEntries(projectId?: string | null): UseFraisEntriesReturn {
  const [entries, setEntries] = useState<FraisEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from("frais_entries")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (projectId) q = q.eq("project_id", projectId);

      const { data, error: err } = await q;
      if (err) throw err;
      setEntries((data as FraisEntry[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    async (payload: FraisEntryInsert): Promise<FraisEntry | null> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setError("Non authentifié"); return null; }

      const { data, error: err } = await supabase
        .from("frais_entries")
        .insert({ ...payload, user_id: user.user.id })
        .select()
        .single();

      if (err) { setError(err.message); return null; }
      const entry = data as FraisEntry;
      setEntries((prev) => [entry, ...prev]);
      return entry;
    },
    []
  );

  const updateEntry = useCallback(async (id: string, patch: Partial<FraisEntryInsert>) => {
    const { data, error: err } = await supabase
      .from("frais_entries")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (err) { setError(err.message); return; }
    setEntries((prev) => prev.map((e) => (e.id === id ? (data as FraisEntry) : e)));
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from("frais_entries")
      .delete()
      .eq("id", id);

    if (err) { setError(err.message); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, loading, error, addEntry, updateEntry, deleteEntry, refresh: load };
}
