"use client";

import { useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ROLES } from "@/lib/data/roles";
import { useUserStore } from "@/lib/store/useUserStore";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { supabase } from "@/lib/supabase/client";
import { DeptIcon } from "@/components/ui/DeptIcon";
import type { DepartmentSlug } from "@/lib/types";

type Step = 1 | 2;

export function OnboardingScreen() {
  const [step, setStep] = useState<Step>(1);
  const [selectedDept, setSelectedDept] = useState<DepartmentSlug | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const setProfile = useUserStore((s) => s.setProfile);
  const user = useProjectStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dept = DEPARTMENTS.find((d) => d.slug === selectedDept);
  const roles = selectedDept ? (DEPT_ROLES[selectedDept] ?? []) : [];

  async function handleConfirm() {
    if (!selectedDept || !selectedRole) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ department: selectedDept, role: selectedRole })
          .eq("id", user.id);
        if (error) throw new Error(error.message);
      }
      setProfile(selectedDept, selectedRole);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur de sauvegarde. Vérifie ta connexion.");
    } finally {
      setSaving(false);
    }
  }

  // ── Étape 1 — Département ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xl font-bold text-white tracking-tight">
            Ciné<span style={{ color: "#00E0D0" }}>O</span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Ton département</h1>
            <p className="text-muted text-sm">Personnalise l&apos;application selon ton métier</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {DEPARTMENTS.map((d) => {
              const active = selectedDept === d.slug;
              return (
                <button
                  key={d.slug}
                  onClick={() => setSelectedDept(d.slug)}
                  className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all"
                  style={active ? { borderColor: "#00E0D0", borderWidth: "1.5px", background: "rgba(0,224,208,0.08)" } : {}}
                >
                  <DeptIcon slug={d.slug} className="w-6 h-6" style={{ color: active ? "#00E0D0" : "#8E9AAF" }} />
                  <span className="text-[10px] font-semibold leading-tight text-center"
                    style={{ color: active ? "#00E0D0" : "#C9D2E3" }}>
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
      </div>
    );
  }

  // ── Étape 2 — Poste ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1 text-muted text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="text-center mb-6">
          {dept && <DeptIcon slug={dept.slug} className="w-10 h-10 mx-auto mb-2" style={{ color: "#00E0D0" }} />}
          <h1 className="text-2xl font-bold text-white mt-2 mb-1">{dept?.name}</h1>
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
                  active ? "active-pill border-transparent" : "glass-card border-stroke text-textSoft"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        {saveError && (
          <p className="text-xs text-center mb-3" style={{ color: "#fca5a5" }}>{saveError}</p>
        )}

        <button
          disabled={!selectedRole || saving}
          onClick={() => void handleConfirm()}
          className="active-pill w-full py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-30 flex items-center justify-center gap-2"
        >
          {saving ? "Enregistrement…" : "Commencer"}
        </button>
      </div>
    </div>
  );
}
