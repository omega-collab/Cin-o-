"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, MapPin, UtensilsCrossed } from "lucide-react";
import { useCanteenStore } from "@/lib/store/useCanteenStore";

const CANTINE_PIN = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";

type Screen = "pin" | "form" | "done";

const INPUT_CLS =
  "w-full bg-white/5 border border-stroke rounded-2xl px-4 py-3 text-white placeholder:text-muted text-sm focus:outline-none focus:ring-1 focus:ring-cyan/50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-muted uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export function CanteenStaffInterface() {
  const menu = useCanteenStore((s) => s.menu);
  const updateMenu = useCanteenStore((s) => s.updateMenu);

  const [screen, setScreen] = useState<Screen>("pin");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [form, setForm] = useState({
    shootingLocation: menu.shootingLocation ?? "",
    canteenLocation: menu.canteenLocation ?? "",
    mealTime: "12:30",
    starter: menu.starter,
    main: menu.main,
    dessert: menu.dessert,
    special: menu.special ?? "",
  });

  const todayISO = () => new Date().toISOString().split("T")[0] ?? "";

  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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
      shootingLocation: form.shootingLocation,
      canteenLocation: form.canteenLocation,
      starter: form.starter,
      main: form.main,
      dessert: form.dessert,
      special: form.special || undefined,
    });
    setScreen("done");
  }

  function patch(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="flex items-center gap-2 mb-2">
        <UtensilsCrossed className="w-6 h-6 text-cyan" />
        <span className="text-lg font-bold text-white">CinéO · Cantine</span>
      </div>
      <p className="text-muted text-sm mb-8 capitalize">{todayLabel}</p>

      {/* PIN */}
      {screen === "pin" && (
        <div className="glass-card-strong rounded-app p-8 w-full max-w-xs">
          <h2 className="text-xl font-bold text-white text-center mb-1">
            Accès Cantine
          </h2>
          <p className="text-muted text-sm text-center mb-6">
            Code d'accès pour saisir les infos du jour
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

      {/* Form */}
      {screen === "form" && (
        <div className="glass-card-strong rounded-app p-6 w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold text-white text-center">
            Infos du jour
          </h2>

          {/* Lieux — priorité opérationnelle */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-cyan" />
              <span className="text-xs font-semibold text-cyan uppercase tracking-widest">
                Lieux
              </span>
            </div>
            <Field label="Lieu du tournage">
              <input
                type="text"
                value={form.shootingLocation}
                onChange={patch("shootingLocation")}
                placeholder="Ex : Plateaux des Lilas, Studio 3"
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Lieu de la cantine">
              <input
                type="text"
                value={form.canteenLocation}
                onChange={patch("canteenLocation")}
                placeholder="Ex : Parking nord, Camion B"
                className={INPUT_CLS}
              />
            </Field>
          </div>

          {/* Repas */}
          <div className="space-y-3">
            <Field label="Heure du repas">
              <input
                type="time"
                value={form.mealTime}
                onChange={patch("mealTime")}
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Entrée">
              <input
                type="text"
                value={form.starter}
                onChange={patch("starter")}
                placeholder="Ex : Salade verte aux lardons"
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Plat principal">
              <input
                type="text"
                value={form.main}
                onChange={patch("main")}
                placeholder="Ex : Poulet rôti, légumes de saison"
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Dessert">
              <input
                type="text"
                value={form.dessert}
                onChange={patch("dessert")}
                placeholder="Ex : Tarte aux pommes maison"
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Option végétarienne">
              <input
                type="text"
                value={form.special}
                onChange={patch("special")}
                placeholder="Ex : Risotto aux champignons"
                className={INPUT_CLS}
              />
            </Field>
          </div>

          <button
            onClick={handleSave}
            disabled={!form.main}
            className="active-pill w-full py-3 rounded-2xl font-semibold text-sm disabled:opacity-30"
          >
            Enregistrer
          </button>
        </div>
      )}

      {/* Done */}
      {screen === "done" && (
        <div className="glass-card-strong rounded-app p-8 w-full max-w-xs text-center">
          <CheckCircle2 className="w-12 h-12 text-cyan mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-3">Enregistré !</h2>
          {form.canteenLocation && (
            <div className="glass-card rounded-2xl p-3 mb-4 text-left">
              <p className="text-xs text-muted mb-1">Lieu de la cantine</p>
              <p className="text-sm text-white font-medium">
                {form.canteenLocation}
              </p>
            </div>
          )}
          <p className="text-muted text-sm mb-6">
            Les infos sont visibles par les équipes sur l'accueil.
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
