"use client";

import { useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ROLES } from "@/lib/data/roles";
import { AVATARS } from "@/lib/data/avatars";
import { useUserStore } from "@/lib/store/useUserStore";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { supabase } from "@/lib/supabase/client";
import { DeptIcon } from "@/components/ui/DeptIcon";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import type { DepartmentSlug } from "@/lib/types";

type Step = 1 | 2 | 3;

function StepDots({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-7">
      {([1, 2, 3] as Step[]).map((s) => (
        <div
          key={s}
          className="rounded-full transition-all duration-300"
          style={{
            width: s === current ? 22 : 6,
            height: 6,
            background:
              s === current
                ? "#00E0D0"
                : s < current
                ? "rgba(0,224,208,0.35)"
                : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center justify-center mb-6">
      <img src="/logo-wordmark.png" alt="CinéO" style={{ height: 22 }} className="object-contain" />
    </div>
  );
}

export function OnboardingScreen() {
  const [step, setStep] = useState<Step>(1);
  const [selectedDept, setSelectedDept] = useState<DepartmentSlug | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const setProfile = useUserStore((s) => s.setProfile);
  const setAvatar = useUserStore((s) => s.setAvatar);
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
          .upsert(
            { id: user.id, department: selectedDept, role: selectedRole, avatar_id: selectedAvatar },
            { onConflict: "id" }
          );
        if (error) throw new Error(error.message);
      }
      if (selectedAvatar) setAvatar(selectedAvatar);
      setProfile(selectedDept, selectedRole);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur de sauvegarde. Vérifie ta connexion.");
      setSaving(false);
    }
  }

  const ctaStyle = (enabled: boolean): React.CSSProperties => ({
    height: 52,
    borderRadius: 16,
    background: enabled ? "#00E0D0" : "rgba(0,224,208,0.25)",
    color: "#021414",
    fontSize: 15,
    fontWeight: 700,
    boxShadow: enabled ? "0 0 24px rgba(0,224,208,0.22)" : "none",
  });

  // ── Étape 1 — Département ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
        style={{ background: "#071018" }}
      >
        <div className="w-full max-w-sm">
          <Logo />
          <StepDots current={1} />

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1.5">Ton département</h1>
            <p className="text-sm" style={{ color: "#9FB3C8" }}>
              Personnalise l&apos;app selon ton métier
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-7">
            {DEPARTMENTS.map((d) => {
              const active = selectedDept === d.slug;
              return (
                <button
                  key={d.slug}
                  onClick={() => setSelectedDept(d.slug)}
                  className="rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all active:scale-95"
                  style={{
                    background: active ? "rgba(0,224,208,0.10)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${active ? "#00E0D0" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: active ? "0 0 18px rgba(0,224,208,0.14)" : "none",
                  }}
                >
                  <DeptIcon
                    slug={d.slug}
                    className="w-6 h-6"
                    style={{ color: active ? "#00E0D0" : "#8E9AAF" }}
                  />
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
            className="w-full font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30"
            style={ctaStyle(!!selectedDept)}
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Étape 2 — Poste ────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
        style={{ background: "#071018" }}
      >
        <div className="w-full max-w-sm">
          <Logo />
          <StepDots current={2} />

          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-sm mb-5 transition-opacity hover:opacity-70"
            style={{ color: "#9FB3C8" }}
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="text-center mb-6">
            {dept && (
              <div className="flex justify-center mb-3">
                <span
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
                  style={{
                    background: "rgba(0,224,208,0.10)",
                    border: "1.5px solid rgba(0,224,208,0.22)",
                  }}
                >
                  <DeptIcon slug={dept.slug} className="w-7 h-7" style={{ color: "#00E0D0" }} />
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-white mb-0.5">{dept?.name}</h1>
            <p className="text-sm" style={{ color: "#9FB3C8" }}>Quel est ton poste ?</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-7">
            {roles.map((r) => {
              const active = selectedRole === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className="px-4 py-2 rounded-2xl text-sm font-medium transition-all active:scale-95"
                  style={{
                    background: active ? "rgba(0,224,208,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${active ? "#00E0D0" : "rgba(255,255,255,0.10)"}`,
                    color: active ? "#00E0D0" : "#C9D2E3",
                    boxShadow: active ? "0 0 12px rgba(0,224,208,0.15)" : "none",
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <button
            disabled={!selectedRole}
            onClick={() => setStep(3)}
            className="w-full font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30"
            style={ctaStyle(!!selectedRole)}
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Étape 3 — Avatar ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "#071018" }}
    >
      <div className="w-full max-w-sm">
        <Logo />
        <StepDots current={3} />

        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-1 text-sm mb-5 transition-opacity hover:opacity-70"
          style={{ color: "#9FB3C8" }}
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="text-center mb-6">
          {selectedAvatar && (
            <div className="flex justify-center mb-3">
              <AvatarDisplay avatarId={selectedAvatar} size={56} />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mb-1.5">Ton avatar</h1>
          <p className="text-sm" style={{ color: "#9FB3C8" }}>
            Choisis une icône — tu pourras la changer plus tard
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-7">
          {AVATARS.map((av) => {
            const active = selectedAvatar === av.id;
            return (
              <button
                key={av.id}
                onClick={() => setSelectedAvatar(av.id)}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
              >
                <span
                  className="rounded-2xl overflow-hidden"
                  style={{
                    padding: 3,
                    border: active ? "2px solid #00E0D0" : "2px solid rgba(255,255,255,0.10)",
                    boxShadow: active ? "0 0 14px rgba(0,224,208,0.35)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <AvatarDisplay avatarId={av.id} size={48} />
                </span>
                <span className="text-[10px]" style={{ color: "#9FB3C8" }}>{av.label}</span>
              </button>
            );
          })}
        </div>

        {saveError && (
          <p className="text-xs text-center mb-3" style={{ color: "#fca5a5" }}>{saveError}</p>
        )}

        <button
          disabled={saving}
          onClick={() => void handleConfirm()}
          className="w-full font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30"
          style={ctaStyle(true)}
        >
          {saving ? "Enregistrement…" : "Commencer"}
        </button>

        {!saving && (
          <button
            onClick={() => void handleConfirm()}
            className="mt-3 w-full text-center text-sm transition-opacity hover:opacity-70"
            style={{ color: "#9FB3C8" }}
          >
            Passer cette étape
          </button>
        )}
      </div>
    </div>
  );
}
