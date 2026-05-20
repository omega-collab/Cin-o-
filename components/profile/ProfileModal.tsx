"use client";

import { useState } from "react";
import { X, ChevronRight, ArrowLeft, Check } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ROLES } from "@/lib/data/roles";
import { useUserStore } from "@/lib/store/useUserStore";
import type { DepartmentSlug } from "@/lib/types";

const DEPT_CODE = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";

type Step = "code" | "dept" | "role" | "done";

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { department: currentDept, role: currentRole, setProfile } = useUserStore();

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selectedDept, setSelectedDept] = useState<DepartmentSlug | null>(currentDept);
  const [selectedRole, setSelectedRole] = useState<string | null>(currentRole);

  const dept = DEPARTMENTS.find((d) => d.slug === selectedDept);
  const roles = selectedDept ? (DEPT_ROLES[selectedDept] ?? []) : [];

  function handleCodeSubmit() {
    if (code === DEPT_CODE) {
      setCodeError("");
      setStep("dept");
    } else {
      setCodeError("Code incorrect");
      setCode("");
    }
  }

  function handleConfirm() {
    if (selectedDept && selectedRole) {
      setProfile(selectedDept, selectedRole);
      setStep("done");
      setTimeout(onClose, 1200);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm mx-4 mb-4 md:mb-0 glass-card-strong rounded-app p-6 space-y-5">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step : code */}
        {step === "code" && (
          <>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gradient">Modifier le profil</h2>
              <p className="text-muted text-sm mt-1">
                Entre le code de ton département pour confirmer
              </p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
              placeholder="••••"
              className="w-full bg-white/5 border border-stroke rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-cyan/50 placeholder:text-muted"
              autoFocus
            />
            {codeError && (
              <p className="text-redSoft text-sm text-center">{codeError}</p>
            )}
            <button
              onClick={handleCodeSubmit}
              disabled={!code}
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm disabled:opacity-30"
            >
              Continuer
            </button>
          </>
        )}

        {/* Step : dept */}
        {step === "dept" && (
          <>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gradient">Département</h2>
              <p className="text-muted text-sm mt-1">Choisis ton nouveau département</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEPARTMENTS.map((d) => {
                const active = selectedDept === d.slug;
                return (
                  <button
                    key={d.slug}
                    onClick={() => { setSelectedDept(d.slug); setSelectedRole(null); }}
                    className="glass-card rounded-2xl p-2.5 flex flex-col items-center gap-1 transition-all"
                    style={
                      active
                        ? { borderColor: "#00E0D0", borderWidth: "1.5px", background: "rgba(0,224,208,0.08)" }
                        : {}
                    }
                  >
                    <span className="text-xl leading-none">{d.icon}</span>
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
              onClick={() => setStep("role")}
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Step : role */}
        {step === "role" && (
          <>
            <button
              onClick={() => setStep("dept")}
              className="flex items-center gap-1 text-muted text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="text-center">
              <span className="text-3xl">{dept?.icon}</span>
              <h2 className="text-lg font-bold text-gradient mt-1">{dept?.name}</h2>
              <p className="text-muted text-sm">Quel est ton poste ?</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {roles.map((r) => {
                const active = selectedRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded-2xl text-sm font-medium border transition-all ${
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
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm disabled:opacity-30"
            >
              Confirmer
            </button>
          </>
        )}

        {/* Step : done */}
        {step === "done" && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-cyanSoft rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-cyan" />
            </div>
            <h2 className="text-lg font-bold text-gradient">Profil mis à jour</h2>
            <p className="text-muted text-sm mt-1">
              {dept?.name} · {selectedRole}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
