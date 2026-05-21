"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { useProjectSync } from "@/lib/hooks/useProjectSync";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProjectSelector } from "@/components/projects/ProjectSelector";
import type { Profile } from "@/lib/supabase/types";
import type { DepartmentSlug } from "@/lib/types";

function SyncWrapper({ projectId, children }: { projectId: string; children: React.ReactNode }) {
  useProjectSync(projectId);
  return <>{children}</>;
}

export function ProjectGate({ children }: { children: React.ReactNode }) {
  const { user, session, activeProjectId, setAuth, setProfile } = useProjectStore();
  const { setProfile: setUserProfile, setAvatar } = useUserStore();
  const [loading, setLoading] = useState(true);

  // Init auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  // Load profile when user changes — hydrate useUserStore from Supabase so
  // onboarding only ever shows once (even on a new device).
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const profile = data as Profile | null;
        setProfile(profile);
        if (profile?.department && profile?.role) {
          setUserProfile(profile.department as DepartmentSlug, profile.role);
        }
        if (profile?.avatar_id) {
          setAvatar(profile.avatar_id);
        }
      });
  }, [user, setProfile, setUserProfile, setAvatar]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !user) return <AuthModal />;
  if (!activeProjectId) return <ProjectSelector />;

  return <SyncWrapper projectId={activeProjectId}>{children}</SyncWrapper>;
}
