"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useCanteenStore } from "@/lib/store/useCanteenStore";

const DEBOUNCE_MS = 1500;
// Realtime payloads can arrive slightly after our own upsert response —
// drop our own events within this window even if isSavingRef has flipped.
const SELF_ECHO_WINDOW_MS = 3000;

export function useProjectSync(projectId: string | null) {
  const { user, setSyncing, setLastSyncedAt, setSyncError } = useProjectStore();

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRemoteAt = useRef<string | null>(null);
  const lastLocalSaveAt = useRef<number>(0);
  // Tracks the last time the user actively edited the store locally. Used to
  // skip remote loads that would otherwise overwrite unsaved work (e.g. a
  // freshly uploaded doc whose save is still in the debounce window).
  const lastLocalChangeAt = useRef<number>(0);
  const isSavingRef = useRef(false);
  const isHydratingRef = useRef(false);

  // ── Load project data ────────────────────────────────────────────────────────
  const loadData = useCallback(async (pid: string, opts: { fromRealtime?: boolean } = {}) => {
    const { data, error } = await supabase
      .from("project_data")
      .select("*")
      .eq("project_id", pid)
      .maybeSingle();

    if (error) {
      useProjectStore.getState().setSyncError("Chargement échoué — données locales utilisées");
      return;
    }
    useProjectStore.getState().setSyncError(null);

    if (!data) return;

    // Realtime-triggered loads must not stomp on local edits. If the user
    // has changed something locally since the remote was last written, keep
    // local — our pending save will reconcile in a moment.
    if (opts.fromRealtime) {
      const remoteAt = new Date(data.updated_at).getTime();
      if (lastLocalChangeAt.current > remoteAt) {
        return;
      }
      // Also skip if we already applied this exact remote update.
      if (data.updated_at === lastRemoteAt.current) {
        return;
      }
    }

    lastRemoteAt.current = data.updated_at;
    isHydratingRef.current = true;

    if (data.shoot_store && typeof data.shoot_store === "object") {
      const { shoot } = data.shoot_store as { shoot?: unknown };
      if (shoot) {
        const remoteShoot = shoot as ReturnType<typeof useShootStore.getState>["shoot"];
        const localShoot = useShootStore.getState().shoot;
        // Race protection : si l'utilisateur a un shoot local "plus riche"
        // que le remote (ex: il vient d'uploader/extraire/publier et le
        // debounce save de 1.5s n'a pas encore eu lieu), on préserve les
        // champs locaux non vides. Sinon la feuille "disparaît" à chaque
        // mount/realtime tick juste après un changement local.
        const isEmptyArr = (v: unknown) => !Array.isArray(v) || v.length === 0;
        const isEmptyStr = (v: unknown) => typeof v !== "string" || v.trim() === "";

        const preservedDocs =
          (localShoot.uploadedDocs?.length ?? 0) > 0 && isEmptyArr(remoteShoot.uploadedDocs)
            ? localShoot.uploadedDocs
            : remoteShoot.uploadedDocs;

        const preservedSequences =
          (localShoot.sequences?.length ?? 0) > 0 && isEmptyArr(remoteShoot.sequences)
            ? localShoot.sequences
            : remoteShoot.sequences;

        const preservedCast =
          (localShoot.cast?.length ?? 0) > 0 && isEmptyArr(remoteShoot.cast)
            ? localShoot.cast
            : remoteShoot.cast;

        const preservedDeptNotes =
          (localShoot.deptNotes?.length ?? 0) > 0 && isEmptyArr(remoteShoot.deptNotes)
            ? localShoot.deptNotes
            : remoteShoot.deptNotes;

        const preservedPlaces =
          (localShoot.places?.length ?? 0) > 0 && isEmptyArr(remoteShoot.places)
            ? localShoot.places
            : remoteShoot.places;

        const preservedAlerts =
          (localShoot.alerts?.length ?? 0) > 0 && isEmptyArr(remoteShoot.alerts)
            ? localShoot.alerts
            : remoteShoot.alerts;

        const preservedNextDays =
          (localShoot.nextDays?.length ?? 0) > 0 && isEmptyArr(remoteShoot.nextDays)
            ? localShoot.nextDays
            : remoteShoot.nextDays;

        const preservedTitle =
          !isEmptyStr(localShoot.projectTitle) && isEmptyStr(remoteShoot.projectTitle)
            ? localShoot.projectTitle
            : remoteShoot.projectTitle;

        const preservedLocation =
          !isEmptyStr(localShoot.location) && isEmptyStr(remoteShoot.location)
            ? localShoot.location
            : remoteShoot.location;

        const preservedDate =
          !isEmptyStr(localShoot.date) && isEmptyStr(remoteShoot.date)
            ? localShoot.date
            : remoteShoot.date;

        // isPublished : si le local est publié et que le remote ne l'est
        // pas, on préserve le local UNIQUEMENT si le contenu local est
        // significatif (titre + séquences). Sinon on fait confiance au
        // remote (un autre user a pu dépublier).
        const localIsPublishedWithContent =
          localShoot.isPublished &&
          !isEmptyStr(localShoot.projectTitle) &&
          (localShoot.sequences?.length ?? 0) > 0;
        const preservedIsPublished =
          localIsPublishedWithContent && !remoteShoot.isPublished
            ? true
            : remoteShoot.isPublished;

        useShootStore.setState({
          shoot: {
            ...remoteShoot,
            uploadedDocs: preservedDocs,
            sequences: preservedSequences,
            cast: preservedCast,
            deptNotes: preservedDeptNotes,
            places: preservedPlaces,
            alerts: preservedAlerts,
            nextDays: preservedNextDays,
            projectTitle: preservedTitle,
            location: preservedLocation,
            date: preservedDate,
            isPublished: preservedIsPublished,
          },
        });
      }
    }

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

    if (data.canteen_store && typeof data.canteen_store === "object") {
      const { menu } = data.canteen_store as { menu?: unknown };
      if (menu && typeof menu === "object") {
        useCanteenStore.setState({
          menu: menu as ReturnType<typeof useCanteenStore.getState>["menu"],
        });
      }
    }

    queueMicrotask(() => { isHydratingRef.current = false; });
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
      canteen_store: { menu: useCanteenStore.getState().menu },
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
      lastLocalSaveAt.current = Date.now();
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
    if (isHydratingRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      void saveData(projectId);
    }, DEBOUNCE_MS);
  }, [projectId, saveData]);

  // Watch shoot store — flag local edits before scheduling the save
  useEffect(() => {
    return useShootStore.subscribe(() => {
      if (!isHydratingRef.current) {
        lastLocalChangeAt.current = Date.now();
      }
      scheduleSave();
    });
  }, [scheduleSave]);

  // Watch department store
  useEffect(() => {
    return useDepartmentStore.subscribe(() => {
      if (!isHydratingRef.current) {
        lastLocalChangeAt.current = Date.now();
      }
      scheduleSave();
    });
  }, [scheduleSave]);

  // Watch canteen store (menu du jour partagé entre tous les membres du projet)
  useEffect(() => {
    return useCanteenStore.subscribe(() => {
      if (!isHydratingRef.current) {
        lastLocalChangeAt.current = Date.now();
      }
      scheduleSave();
    });
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
          // Skip events triggered by our own write — even if isSavingRef has
          // already flipped, Supabase Realtime can deliver the event a few
          // hundred ms later. We add a SELF_ECHO_WINDOW grace period.
          if (isSavingRef.current) return;
          if (Date.now() - lastLocalSaveAt.current < SELF_ECHO_WINDOW_MS) return;

          const incoming = payload.new as { updated_by?: string; updated_at?: string };
          if (incoming.updated_by === user.id) return;

          // Don't overwrite if there's a pending local save (user is actively
          // editing). Their save will trump the remote event in a moment.
          if (saveTimer.current) return;

          void loadData(projectId, { fromRealtime: true });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, user, loadData]);
}
