"use client";

import { useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ROLES } from "@/lib/data/roles";
import { useUserStore } from "@/lib/store/useUserStore";
import type { DepartmentSlug } from "@/lib/types";

export function OnboardingScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDept, setSelectedDept] = useState<DepartmentSlug | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const setProfile = useUserStore((s) => s.setProfile);

  const dept = DEPARTMENTS.find((d) => d.slug === selectedDept);
  const roles = selectedDept ? (DEPT_ROLES[selectedDept] ?? []) : [];

  function handleConfirm() {
    if (selectedDept && selectedRole) {
      setProfile(selectedDept, selectedRole);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-3xl">🎬</span>
        <span className="text-xl font-bold text-white">CinéO</span>
      </div>

      {step === 1 && (
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gradient mb-1">
              Bienvenue 👋
            </h1>
            <p className="text-muted text-sm">
              Choisis ton département pour personnaliser l'application
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {DEPARTMENTS.map((d) => {
              const active = selectedDept === d.slug;
              return (
                <button
                  key={d.slug}
                  onClick={() => setSelectedDept(d.slug)}
                  className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all"
                  style={
                    active
                      ? { borderColor: "#00E0D0", borderWidth: "1.5px", background: "rgba(0,224,208,0.08)" }
                      : {}
                  }
                >
                  <span className="text-2xl leading-none">{d.icon}</span>
                  <span
                    className="text-[10px] font-semibold leading-tight text-center"
                    style={{ color: active ? "#00E0D0" : "#C9D2E3" }}
                  >
                    {d.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            disabled={!selectedDept}
            onClick={() => setStep(2)}
            className="active-pill w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-muted text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="text-center mb-6">
            <span className="text-4xl">{dept?.icon}</span>
            <h1 className="text-2xl font-bold text-gradient mt-2 mb-1">
              {dept?.name}
            </h1>
            <p className="text-muted text-sm">Quel est ton poste ?</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {roles.map((r) => {
              const active = selectedRole === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium border transition-all ${
                    active
                      ? "active-pill border-transparent"
                      : "glass-card border-stroke text-textSoft"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <button
            disabled={!selectedRole}
            onClick={handleConfirm}
            className="active-pill w-full py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-30"
          >
            Commencer
          </button>
        </div>
      )}
    </div>
  );
}
