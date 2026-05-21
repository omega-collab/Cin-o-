"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";

const DEBOUNCE_MS = 1500;

export function useProjectSync(projectId: string | null) {
  const { user, setSyncing, setLastSyncedAt, setSyncError } = useProjectStore();
  const shootStore = useShootStore();
  const deptStore = useDepartmentStore();

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRemoteAt = useRef<string | null>(null);
  const isSavingRef = useRef(false);

  // ── Load project data ────────────────────────────────────────────────────────
  const loadData = useCallback(async (pid: string) => {
    const { data, error } = await supabase
      .from("project_data")
      .select("*")
      .eq("project_id", pid)
      .maybeSingle();

    if (error || !data) return;

    lastRemoteAt.current = data.updated_at;

    // Hydrate shoot store
    if (data.shoot_store && typeof data.shoot_store === "object") {
      const { shoot } = data.shoot_store as { shoot?: unknown };
      if (shoot) {
        useShootStore.setState({ shoot: shoot as ReturnType<typeof useShootStore.getState>["shoot"] });
      }
    }

    // Hydrate department store
    if (data.department_store && typeof data.department_store === "object") {
      const { stock, movements } = data.department_store as {
        stock?: unknown;
        movements?: unknown;
      };
      if (stock || movements) {
        useDepartmentStore.setState({
          ...(stock ? { stock: stock as ReturnType<typeof useDepartmentStore.getState>["stock"] } : {}),
          ...(movements ? { movements: movements as ReturnType<typeof useDepartmentStore.getState>["movements"] } : {}),
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save project data ────────────────────────────────────────────────────────
  const saveData = useCallback(async (pid: string) => {
    if (!user || isSavingRef.current) return;
    isSavingRef.current = true;
    setSyncing(true);

    const snapshot = {
      project_id: pid,
      shoot_store: { shoot: useShootStore.getState().shoot },
      department_store: {
        stock: useDepartmentStore.getState().stock,
        movements: useDepartmentStore.getState().movements,
      },
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from("project_data")
      .upsert(snapshot, { onConflict: "project_id" })
      .select("updated_at")
      .single();

    if (!error && data) {
      lastRemoteAt.current = data.updated_at as string;
      setLastSyncedAt(data.updated_at as string);
      setSyncError(null);
    } else if (error) {
      setSyncError("Sauvegarde échouée — mode hors-ligne");
    }

    isSavingRef.current = false;
    setSyncing(false);
  }, [user, setSyncing, setLastSyncedAt, setSyncError]);

  // ── Debounced save on store changes ──────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    if (!projectId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveData(projectId), DEBOUNCE_MS);
  }, [projectId, saveData]);

  // Watch shoot store
  useEffect(() => {
    return useShootStore.subscribe(() => scheduleSave());
  }, [scheduleSave]);

  // Watch department store
  useEffect(() => {
    return useDepartmentStore.subscribe(() => scheduleSave());
  }, [scheduleSave]);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    void loadData(projectId);
  }, [projectId, loadData]);

  // ── Realtime subscription ────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId || !user) return;

    const channel = supabase
      .channel(`project_data:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "project_data",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // Skip our own saves
          if (isSavingRef.current) return;
          const incoming = payload.new as { updated_by?: string; updated_at?: string };
          if (incoming.updated_by === user.id) return;

          // Remote change from another user — reload
          void loadData(projectId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, user, loadData]);
}
