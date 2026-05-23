"use client";

import { useState } from "react";
import { X, ChevronRight, ArrowLeft, Check } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ROLES } from "@/lib/data/roles";
import { AVATARS } from "@/lib/data/avatars";
import { useUserStore } from "@/lib/store/useUserStore";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { supabase } from "@/lib/supabase/client";
import { DeptIcon } from "@/components/ui/DeptIcon";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import type { DepartmentSlug } from "@/lib/types";

const DEPT_CODE = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";

type Step = "code" | "dept" | "role" | "avatar" | "done";

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { department: currentDept, role: currentRole, avatarId, setProfile, setAvatar } = useUserStore();
  const user = useProjectStore((s) => s.user);

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selectedDept, setSelectedDept] = useState<DepartmentSlug | null>(currentDept);
  const [selectedRole, setSelectedRole] = useState<string | null>(currentRole);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(avatarId);

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

  async function handleConfirm() {
    if (!selectedDept || !selectedRole) return;
    setProfile(selectedDept, selectedRole);
    if (selectedAvatar) setAvatar(selectedAvatar);
    if (user) {
      await supabase
        .from("profiles")
        .upsert(
          { id: user.id, department: selectedDept, role: selectedRole, avatar_id: selectedAvatar },
          { onConflict: "id" }
        );
    }
    setStep("done");
    setTimeout(onClose, 1200);
  }

  async function handleAvatarSelect(id: string) {
    setSelectedAvatar(id);
    if (!selectedDept || !selectedRole) return;
    setProfile(selectedDept, selectedRole);
    setAvatar(id);
    if (user) {
      supabase
        .from("profiles")
        .upsert(
          { id: user.id, department: selectedDept, role: selectedRole, avatar_id: id },
          { onConflict: "id" }
        )
        .then(() => {});
    }
    setStep("done");
    setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm mx-4 mb-4 md:mb-0 glass-card-strong rounded-app p-6 space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Step : code */}
        {step === "code" && (
          <>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <AvatarDisplay avatarId={avatarId} size={56} />
              </div>
              <h2 className="text-lg font-bold text-white">Modifier le profil</h2>
              <p className="text-muted text-sm mt-1">
                Entrez le code de votre département pour confirmer
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
            {codeError && <p className="text-danger text-sm text-center">{codeError}</p>}
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
              <h2 className="text-lg font-bold text-white">Département</h2>
              <p className="text-muted text-sm mt-1">Choisissez votre département</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEPARTMENTS.map((d) => {
                const active = selectedDept === d.slug;
                return (
                  <button
                    key={d.slug}
                    onClick={() => { setSelectedDept(d.slug); setSelectedRole(null); }}
                    className="glass-card rounded-2xl p-2.5 flex flex-col items-center gap-1 transition-all"
                    style={active ? { borderColor: "#00E0D0", borderWidth: "1.5px", background: "rgba(0,224,208,0.08)" } : {}}
                  >
                    <span style={{ color: active ? "#00E0D0" : "#8E9AAF" }}>
                      <DeptIcon slug={d.slug} className="w-5 h-5" />
                    </span>
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
            <button onClick={() => setStep("dept")} className="flex items-center gap-1 text-muted text-sm">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="text-center">
              <span className="text-cyan flex justify-center">
                {dept && <DeptIcon slug={dept.slug} className="w-8 h-8" />}
              </span>
              <h2 className="text-lg font-bold text-white mt-1">{dept?.name}</h2>
              <p className="text-muted text-sm">Quel est votre poste ?</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {roles.map((r) => {
                const active = selectedRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded-2xl text-sm font-medium border transition-all ${
                      active ? "active-pill border-transparent" : "glass-card border-stroke text-textSoft"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            <button
              disabled={!selectedRole}
              onClick={() => setStep("avatar")}
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Step : avatar */}
        {step === "avatar" && (
          <>
            <button onClick={() => setStep("role")} className="flex items-center gap-1 text-muted text-sm">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">Votre avatar</h2>
              <p className="text-muted text-sm mt-1">Choisissez une icône pour vous représenter</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((av) => {
                const active = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => void handleAvatarSelect(av.id)}
                    className="flex flex-col items-center gap-1.5 transition-all"
                  >
                    <span
                      className="rounded-2xl overflow-hidden transition-all"
                      style={{
                        padding: 3,
                        border: active ? "2px solid #00E0D0" : "2px solid transparent",
                        boxShadow: active ? "0 0 10px rgba(0,224,208,0.4)" : "none",
                      }}
                    >
                      <AvatarDisplay avatarId={av.id} size={44} />
                    </span>
                    <span className="text-[10px] text-muted">{av.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[11px] text-muted">Appuie sur un avatar pour confirmer</p>
          </>
        )}

        {/* Step : done */}
        {step === "done" && (
          <div className="text-center py-4">
            <div className="flex justify-center mb-3">
              <AvatarDisplay avatarId={selectedAvatar} size={56} />
            </div>
            <div className="w-8 h-8 bg-cyanSoft rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-4 h-4 text-cyan" />
            </div>
            <h2 className="text-lg font-bold text-white">Profil mis à jour</h2>
            <p className="text-muted text-sm mt-1">
              {dept?.name} · {selectedRole}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
