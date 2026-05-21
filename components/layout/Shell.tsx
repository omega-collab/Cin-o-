"use client";

import { Nav } from "./Nav";
import { Header } from "./Header";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { ProjectGate } from "@/components/projects/ProjectGate";
import { useUserStore } from "@/lib/store/useUserStore";
import { useHydrated } from "@/lib/hooks/useHydrated";

interface ShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function Shell({ children, title, subtitle }: ShellProps) {
  const hydrated = useHydrated();
  const onboardingDone = useUserStore((s) => s.onboardingDone);

  if (!hydrated) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#071018" }}>
      <div className="w-6 h-6 rounded-full border-2 border-cyan/30 border-t-cyan animate-spin" />
    </div>
  );

  // ProjectGate gère l'auth en premier : AuthModal si non connecté, ProjectSelector si pas de projet
  // L'onboarding (département + poste) n'apparaît qu'après connexion + projet
  return (
    <ProjectGate>
      {!onboardingDone ? (
        <OnboardingScreen />
      ) : (
        <div className="flex min-h-screen">
          <Nav />
          <div className="flex flex-col flex-1 min-w-0">
            <Header title={title} subtitle={subtitle} />
            <main className="flex-1 px-4 md:px-6 pb-28 md:pb-8 pt-1 max-w-2xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      )}
    </ProjectGate>
  );
}
