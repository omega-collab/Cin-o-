"use client";

import { useState } from "react";
import { Film } from "lucide-react";
import { useCanteenStore } from "@/lib/store/useCanteenStore";
import { DailySheetForm } from "./DailySheetForm";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useAccessStore } from "@/lib/store/useAccessStore";
import { useHydrated } from "@/lib/hooks/useHydrated";

const ADMIN_CODE = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";

const MENU_FIELDS = [
  { key: "starter", label: "Entrée" },
  { key: "main",    label: "Plat principal" },
  { key: "dessert", label: "Dessert" },
  { key: "special", label: "Option spéciale" },
] as const;

type MenuField = (typeof MENU_FIELDS)[number]["key"];

// ── auth form ─────────────────────────────────────────────────────────────────

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

// ── dashboard ─────────────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const menu = useCanteenStore((s) => s.menu);
  const updateMenu = useCanteenStore((s) => s.updateMenu);
  const resetStock = useDepartmentStore((s) => s.resetStock);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const lockAll = useAccessStore((s) => s.lockAll);

  const [menuForm, setMenuForm] = useState({ ...menu });
  const [saved, setSaved] = useState(false);

  function saveMenu() {
    updateMenu(menuForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gradient text-xl">Administration</h2>
        <button
          onClick={onLogout}
          className="glass-card text-muted text-xs px-3 py-1.5 rounded-full"
        >
          Déconnexion
        </button>
      </div>

      {/* Feuille du jour */}
      <DailySheetForm />

      {/* Menu cantine */}
      <div className="glass-card rounded-app p-5">
        <h3 className="font-semibold text-gradient mb-4">Menu cantine</h3>
        <div className="space-y-3">
          {MENU_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-muted mb-1">{label}</label>
              <input
                type="text"
                value={menuForm[key as MenuField] ?? ""}
                onChange={(e) => setMenuForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/40"
              />
            </div>
          ))}
          <button
            className={`active-pill w-full py-2.5 rounded-2xl font-semibold text-sm mt-1 transition-opacity ${saved ? "opacity-60" : ""}`}
            onClick={saveMenu}
          >
            {saved ? "Sauvegardé ✓" : "Sauvegarder le menu"}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass-card rounded-app p-5">
        <h3 className="font-semibold text-redSoft mb-4">Zone dangereuse</h3>
        <div className="space-y-3">
          {[
            {
              title: "Réinitialiser le stock",
              desc: "Restaure les quantités initiales",
              action: resetStock,
              label: "Reset stock",
            },
            {
              title: "Effacer l'historique",
              desc: "Supprime toutes les entrées",
              action: clearHistory,
              label: "Reset historique",
            },
            {
              title: "Verrouiller tous les depts",
              desc: "Force re-authentification partout",
              action: lockAll,
              label: "Tout verrouiller",
            },
          ].map(({ title, desc, action, label }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 rounded-2xl bg-redSoft/5 border border-redSoft/10"
            >
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-muted">{desc}</p>
              </div>
              <button
                onClick={action}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-redSoft/10 text-redSoft border border-redSoft/20"
              >
                {label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── exported component ────────────────────────────────────────────────────────

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

  if (!authenticated) {
    return <AuthForm onSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthenticated(false)} />;
}
