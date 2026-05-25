"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, UtensilsCrossed } from "lucide-react";
import { useCanteenStore } from "@/lib/store/useCanteenStore";

type Screen = "form" | "done";

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

  const [screen, setScreen] = useState<Screen>("form");

  const [form, setForm] = useState({
    shootingLocation: menu.shootingLocation ?? "",
    canteenLocation: menu.canteenLocation ?? "",
    mealTime: menu.mealTime ?? "12:30",
    mealEndTime: menu.mealEndTime ?? "13:30",
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

  function handleSave() {
    updateMenu({
      date: todayISO(),
      shootingLocation: form.shootingLocation,
      canteenLocation: form.canteenLocation,
      mealTime: form.mealTime,
      mealEndTime: form.mealEndTime || undefined,
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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10 overflow-hidden">
      {/* Background : photo de cantine de tournage en darkening overlay */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/cantine-bg.jpg')" }}
        />
        {/* Overlay sombre pour garder la lisibilité du formulaire */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,16,24,0.55) 0%, rgba(7,16,24,0.78) 40%, rgba(7,16,24,0.92) 100%)",
          }}
        />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <UtensilsCrossed className="w-6 h-6 text-cyan" />
        <span className="text-lg font-bold text-white">CinéO · Cantine</span>
      </div>
      <p className="text-muted text-sm mb-8 capitalize">{todayLabel}</p>

      {/* Form */}
      {screen === "form" && (
        <div className="glass-card-strong rounded-app p-6 w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold text-white text-center">
            Infos du jour
          </h2>

          {/* Lieux */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-cyan" />
              <span className="text-xs font-semibold text-cyan uppercase tracking-widest">
                Lieux
              </span>
            </div>
            <Field label="Lieu de tournage">
              <input className={INPUT_CLS} value={form.shootingLocation} onChange={patch("shootingLocation")} placeholder="Adresse ou nom du décor" />
            </Field>
            <Field label="Lieu cantine">
              <input className={INPUT_CLS} value={form.canteenLocation} onChange={patch("canteenLocation")} placeholder="Adresse ou salle" />
            </Field>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest block mb-1.5">
                Heure du repas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted block mb-1">Début</label>
                  <input type="time" className={INPUT_CLS + " font-mono"} value={form.mealTime} onChange={patch("mealTime")} />
                </div>
                <div>
                  <label className="text-[10px] text-muted block mb-1">Fin</label>
                  <input type="time" className={INPUT_CLS + " font-mono"} value={form.mealEndTime} onChange={patch("mealEndTime")} />
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold text-cyan uppercase tracking-widest">Menu</span>
            <Field label="Entrée"><input className={INPUT_CLS} value={form.starter} onChange={patch("starter")} placeholder="Salade, soupe…" /></Field>
            <Field label="Plat"><input className={INPUT_CLS} value={form.main} onChange={patch("main")} placeholder="Plat principal" /></Field>
            <Field label="Dessert"><input className={INPUT_CLS} value={form.dessert} onChange={patch("dessert")} placeholder="Fruit, gâteau…" /></Field>
            <Field label="Spécial / Allergie (optionnel)">
              <input className={INPUT_CLS} value={form.special} onChange={patch("special")} placeholder="Ex: option végane disponible" />
            </Field>
          </div>

          <button
            onClick={handleSave}
            disabled={!form.main.trim()}
            className="active-pill w-full py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-30"
          >
            Publier le menu
          </button>
        </div>
      )}

      {/* Done */}
      {screen === "done" && (
        <div className="glass-card-strong rounded-app p-8 w-full max-w-xs text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-white">Menu publié</h2>
            <p className="text-muted text-sm mt-1">L&apos;équipe peut maintenant consulter les infos cantine.</p>
          </div>
          <button
            onClick={() => setScreen("form")}
            className="glass-card w-full py-2.5 rounded-2xl text-sm font-medium text-textSoft"
          >
            Modifier
          </button>
        </div>
      )}
    </div>
  );
}
