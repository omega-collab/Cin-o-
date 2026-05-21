"use client";

import { useState } from "react";
import { Film, LayoutDashboard, Upload, ClipboardList, Radio } from "lucide-react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useShootStore } from "@/lib/store/useShootStore";
import { AdminDashboard } from "./AdminDashboard";
import { AdminUploadPanel } from "./AdminUploadPanel";
import { AdminExtractionReview } from "./AdminExtractionReview";
import { AdminPublishPanel } from "./AdminPublishPanel";

const ADMIN_CODE = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";

type Tab = "dashboard" | "upload" | "review" | "publish";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "dashboard", label: "Accueil", Icon: LayoutDashboard },
  { id: "upload", label: "Import", Icon: Upload },
  { id: "review", label: "Révision", Icon: ClipboardList },
  { id: "publish", label: "Publier", Icon: Radio },
];

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function attempt() {
    if (code === ADMIN_CODE) {
      onSuccess();
    } else {
      setError("Code incorrect");
      setCode("");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass-card-strong rounded-app p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-cyanSoft rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Film size={26} className="text-cyan" />
          </div>
          <h2 className="text-xl font-bold text-gradient">Administration</h2>
          <p className="text-muted text-sm mt-1">Accès restreint</p>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••"
            className="w-full bg-white/5 border border-stroke rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-cyan/50 placeholder:text-muted"
            onKeyDown={(e) => { if (e.key === "Enter") attempt(); }}
            autoComplete="off"
          />
          {error && <p className="text-redSoft text-sm text-center">{error}</p>}
          <button
            className="active-pill w-full py-3 rounded-2xl font-semibold text-sm"
            onClick={attempt}
          >
            Accéder
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardContainer({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const extractionStatus = useShootStore((s) => s.shoot.extractionStatus);
  const hasUploadedDocs = useShootStore((s) => s.shoot.uploadedDocs.length > 0);

  // E2: guard tabs — review/publish require extraction to have started
  const tabDisabled = (id: Tab): boolean => {
    if (id === "review") return !hasUploadedDocs && extractionStatus === "idle";
    if (id === "publish") return extractionStatus !== "review" && extractionStatus !== "done";
    return false;
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gradient text-xl">Administration</h2>
        <button onClick={onLogout} className="glass-card text-muted text-xs px-3 py-1.5 rounded-full">
          Déconnexion
        </button>
      </div>

      <div className="glass-card rounded-app p-1 flex gap-1">
        {TABS.map(({ id, label, Icon }) => {
          const disabled = tabDisabled(id);
          return (
            <button
              key={id}
              onClick={() => !disabled && setTab(id)}
              disabled={disabled}
              title={disabled ? "Importez d'abord un document" : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                tab === id ? "active-pill" : disabled ? "text-muted/30 cursor-not-allowed" : "text-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "dashboard" && <AdminDashboard onTab={(t) => setTab(t as Tab)} />}
      {tab === "upload"    && <AdminUploadPanel onNext={() => setTab("review")} />}
      {tab === "review"    && <AdminExtractionReview onApply={() => setTab("publish")} />}
      {tab === "publish"   && <AdminPublishPanel onDone={() => setTab("dashboard")} />}
    </div>
  );
}

export function AdminPanel() {
  const hydrated = useHydrated();
  const [authenticated, setAuthenticated] = useState(false);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="glass-card animate-pulse rounded-app h-12" />
        <div className="glass-card animate-pulse rounded-app h-48" />
        <div className="glass-card animate-pulse rounded-app h-36" />
      </div>
    );
  }

  if (!authenticated) return <AuthForm onSuccess={() => setAuthenticated(true)} />;
  return <AdminDashboardContainer onLogout={() => setAuthenticated(false)} />;
}
