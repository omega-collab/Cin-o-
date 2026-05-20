"use client";

import { useState } from "react";
import { useCanteenStore } from "@/lib/store/useCanteenStore";
import { useDepartmentStore } from "@/lib/store/useDepartmentStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useAccessStore } from "@/lib/store/useAccessStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ADMIN_CODE = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";

export function AdminPanel() {
  const hydrated = useHydrated();
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const menu = useCanteenStore((s) => s.menu);
  const updateMenu = useCanteenStore((s) => s.updateMenu);
  const resetStock = useDepartmentStore((s) => s.resetStock);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const lockAll = useAccessStore((s) => s.lockAll);

  const [menuForm, setMenuForm] = useState({ ...menu });

  if (!hydrated) return <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />;

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="text-4xl">⚙️</span>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Administration</h2>
            <p className="text-slate-500 text-sm mt-1">Accès restreint</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code admin"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-purple-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (code === ADMIN_CODE) {
                    setAuthenticated(true);
                    setMenuForm({ ...menu });
                  } else {
                    setError("Code incorrect");
                    setCode("");
                  }
                }
              }}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button
              className="w-full"
              onClick={() => {
                if (code === ADMIN_CODE) {
                  setAuthenticated(true);
                  setMenuForm({ ...menu });
                } else {
                  setError("Code incorrect");
                  setCode("");
                }
              }}
            >
              Accéder
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Administration</h2>
        <Button variant="ghost" size="sm" onClick={() => setAuthenticated(false)}>
          Déconnexion
        </Button>
      </div>

      {/* Canteen menu */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">🍽️ Menu cantine</h3>
        <div className="space-y-3">
          {(["starter", "main", "dessert", "special"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                {field === "starter"
                  ? "Entrée"
                  : field === "main"
                  ? "Plat principal"
                  : field === "dessert"
                  ? "Dessert"
                  : "Option spéciale"}
              </label>
              <input
                type="text"
                value={menuForm[field] ?? ""}
                onChange={(e) =>
                  setMenuForm((prev) => ({ ...prev, [field]: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          ))}
          <Button
            onClick={() => {
              updateMenu(menuForm);
            }}
          >
            Sauvegarder le menu
          </Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="p-5 border-red-200">
        <h3 className="font-semibold text-red-700 mb-4">⚠️ Zone dangereuse</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Réinitialiser le stock</p>
              <p className="text-xs text-slate-500">Restaure les quantités initiales</p>
            </div>
            <Button variant="danger" size="sm" onClick={resetStock}>
              Reset stock
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Effacer l&apos;historique</p>
              <p className="text-xs text-slate-500">Supprime toutes les entrées</p>
            </div>
            <Button variant="danger" size="sm" onClick={clearHistory}>
              Reset historique
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Verrouiller tous les depts</p>
              <p className="text-xs text-slate-500">Force re-authentification partout</p>
            </div>
            <Button variant="danger" size="sm" onClick={lockAll}>
              Tout verrouiller
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
