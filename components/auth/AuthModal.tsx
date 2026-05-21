"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { FeaturesSheet } from "@/components/onboarding/FeaturesSheet";
import { useSettingsStore, resolveLoginBg } from "@/lib/store/useSettingsStore";

// ── Underline input ───────────────────────────────────────────────────────────
interface UnderlineInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  required?: boolean;
  minLength?: number;
  rightSlot?: React.ReactNode;
  autoComplete?: string;
}

function UnderlineInput({ type, placeholder, value, onChange, icon, required, minLength, rightSlot, autoComplete }: UnderlineInputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pb-4">
      <label
        className="absolute left-8 pointer-events-none transition-all duration-150"
        style={{ top: active ? -1 : 13, fontSize: active ? 10 : 14, color: focused ? "#00E0D0" : "#8E9AAF", lineHeight: 1 }}
      >
        {placeholder}
      </label>
      <div className="flex items-center gap-2.5 pt-4">
        <span style={{ color: focused ? "#00E0D0" : "#6b7a8d" }} className="transition-colors duration-150 shrink-0">
          {icon}
        </span>
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required={required} minLength={minLength} autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-white focus:outline-none min-h-[28px]"
          style={{ caretColor: "#00E0D0" }}
        />
        {rightSlot}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div className="absolute bottom-0 left-0 h-px transition-all duration-200"
        style={{ background: "#00E0D0", width: focused ? "100%" : "0%" }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Mode = "login" | "register";

export function AuthModal() {
  const loginBg = useSettingsStore((s) => s.loginBg);
  const bgUrl = resolveLoginBg(loginBg);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = email.length > 0 && password.length >= 6 && (mode === "login" || displayName.length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "register") {
        const initials = displayName.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
        const { error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName, initials } },
        });
        if (err) throw err;
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      if (msg.includes("Invalid login")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("already registered")) setError("Cet email est déjà utilisé.");
      else if (msg.includes("Password should be")) setError("Mot de passe trop court (6 caractères min).");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: "#040d17" }}>
      {/* ── Background image ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${bgUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Bottom gradient to darken form area */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, transparent 35%, rgba(4,13,23,0.55) 55%, rgba(4,13,23,0.88) 72%, rgba(4,13,23,0.97) 85%, #040d17 100%)",
        }} />
        {/* Subtle film grain */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04, mixBlendMode: "overlay" }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* ── Spacer — image scene occupies top 62% ── */}
      <div className="flex-1" style={{ minHeight: "58vh" }} />

      {/* ── Form card ── */}
      <div className="relative flex-shrink-0 px-5 pb-8" style={{ paddingTop: 0 }}>
        <div className="rounded-[28px] p-6" style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}>
          <h2 className="text-white font-bold mb-5" style={{ fontSize: 22 }}>
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h2>

          {error && (
            <div className="mb-4 rounded-xl px-3 py-2.5 text-xs flex items-start gap-2"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl px-3 py-2.5 text-xs"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>
              {success}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-1">
            {mode === "register" && (
              <UnderlineInput type="text" placeholder="Prénom Nom" value={displayName} onChange={setDisplayName}
                icon={<User className="w-4 h-4" strokeWidth={1.5} />} required autoComplete="name" />
            )}
            <UnderlineInput type="email" placeholder="Email" value={email} onChange={setEmail}
              icon={<Mail className="w-4 h-4" strokeWidth={1.5} />} required autoComplete="email" />
            <UnderlineInput
              type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={setPassword}
              icon={<Lock className="w-4 h-4" strokeWidth={1.5} />} required minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              rightSlot={
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="shrink-0 transition-colors" style={{ color: showPassword ? "#00E0D0" : "#6b7a8d" }}
                  aria-label={showPassword ? "Masquer" : "Afficher"}>
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              }
            />
            <div className="pt-5">
              <button type="submit" disabled={loading || !canSubmit}
                className="w-full font-bold text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  height: 56, borderRadius: 18,
                  background: canSubmit && !loading ? "#00E0D0" : "rgba(0,224,208,0.5)",
                  color: "#021414", fontSize: 15,
                  boxShadow: canSubmit ? "0 0 24px rgba(0,224,208,0.22)" : "none",
                }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Se connecter" : "Créer le compte"}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs" style={{ color: "#6b7a8d" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <p className="text-center text-xs" style={{ color: "#8E9AAF" }}>
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="font-semibold transition-opacity hover:opacity-80" style={{ color: "#00E0D0" }}>
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

        <button onClick={() => setShowFeatures(true)}
          className="mt-5 flex items-center justify-center gap-1.5 mx-auto transition-opacity hover:opacity-80"
          style={{ color: "#8E9AAF", fontSize: 12 }}>
          <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
          Comment ça marche ?
        </button>

        <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
      </div>

      {/* Features overlay */}
      {showFeatures && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <button className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowFeatures(false)} aria-label="Fermer" />
          <div className="relative rounded-t-[28px] overflow-hidden" style={{
            maxHeight: "85vh", background: "#071018",
            border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none",
          }}>
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div style={{ height: "75vh" }}>
              <FeaturesSheet onClose={() => setShowFeatures(false)} showClose />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
