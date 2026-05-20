"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useCanteenStore } from "@/lib/store/useCanteenStore";

const CANTINE_PIN = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";

type Screen = "pin" | "form" | "done";

const INPUT_CLS =
  "w-full bg-white/5 border border-stroke rounded-2xl px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:ring-1 focus:ring-cyan/50";

export function CanteenStaffInterface() {
  const menu = useCanteenStore((s) => s.menu);
  const updateMenu = useCanteenStore((s) => s.updateMenu);

  const [screen, setScreen] = useState<Screen>("pin");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [form, setForm] = useState({
    mealTime: menu.date === todayISO() ? "12:30" : "12:30",
    starter: menu.starter,
    main: menu.main,
    dessert: menu.dessert,
    special: menu.special ?? "",
  });

  function todayISO() {
    return new Date().toISOString().split("T")[0] ?? "";
  }

  function handlePinSubmit() {
    if (pin === CANTINE_PIN) {
      setScreen("form");
      setPinError("");
    } else {
      setPinError("Code incorrect");
      setPin("");
    }
  }

  function handleSave() {
    updateMenu({
      date: todayISO(),
      starter: form.starter,
      main: form.main,
      dessert: form.dessert,
      special: form.special || undefined,
    });
    setScreen("done");
  }

  function patch(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl">🍽️</span>
        <span className="text-lg font-bold text-white">CinéO · Cantine</span>
      </div>
      <p className="text-muted text-sm mb-8 capitalize">{todayLabel}</p>

      {/* PIN screen */}
      {screen === "pin" && (
        <div className="glass-card-strong rounded-app p-8 w-full max-w-xs">
          <h2 className="text-xl font-bold text-gradient text-center mb-1">
            Accès Cantine
          </h2>
          <p className="text-muted text-sm text-center mb-6">
            Entre le code d'accès pour saisir le menu du jour
          </p>

          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="••••"
            className={`${INPUT_CLS} text-center text-2xl font-mono tracking-[0.5em] mb-3`}
          />

          {pinError && (
            <p className="text-redSoft text-xs text-center mb-3">{pinError}</p>
          )}

          <button
            onClick={handlePinSubmit}
            disabled={!pin}
            className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
          >
            Accéder <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Menu form screen */}
      {screen === "form" && (
        <div className="glass-card-strong rounded-app p-6 w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold text-gradient text-center">
            Menu du jour
          </h2>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest block mb-1.5">
              Heure du repas
            </label>
            <input
              type="time"
              value={form.mealTime}
              onChange={patch("mealTime")}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest block mb-1.5">
              Entrée
            </label>
            <input
              type="text"
              value={form.starter}
              onChange={patch("starter")}
              placeholder="Ex : Salade verte aux lardons"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest block mb-1.5">
              Plat principal
            </label>
            <input
              type="text"
              value={form.main}
              onChange={patch("main")}
              placeholder="Ex : Poulet rôti, légumes de saison"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest block mb-1.5">
              Dessert
            </label>
            <input
              type="text"
              value={form.dessert}
              onChange={patch("dessert")}
              placeholder="Ex : Tarte aux pommes maison"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest block mb-1.5">
              Option végétarienne
            </label>
            <input
              type="text"
              value={form.special}
              onChange={patch("special")}
              placeholder="Ex : Risotto aux champignons"
              className={INPUT_CLS}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!form.main}
            className="active-pill w-full py-3 rounded-2xl font-semibold text-sm disabled:opacity-30"
          >
            Enregistrer le menu
          </button>
        </div>
      )}

      {/* Confirmation screen */}
      {screen === "done" && (
        <div className="glass-card-strong rounded-app p-8 w-full max-w-xs text-center">
          <CheckCircle2 className="w-12 h-12 text-cyan mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gradient mb-2">Menu enregistré</h2>
          <p className="text-muted text-sm mb-6">
            Les équipes verront le menu mis à jour sur leur accueil.
          </p>
          <button
            onClick={() => setScreen("form")}
            className="glass-card border-stroke text-textSoft w-full py-2.5 rounded-2xl text-sm font-medium"
          >
            Modifier à nouveau
          </button>
        </div>
      )}
    </div>
  );
}
