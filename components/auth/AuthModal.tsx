"use client";

import { useState } from "react";
import {
  Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSettingsStore, resolveLoginBg } from "@/lib/store/useSettingsStore";
import { extractMsg } from "@/lib/utils";

// ── Lens "O" ──────────────────────────────────────────────────────────────────
function LensO({ size = 52 }: { size?: number }) {
  const b = Math.round(size * 0.07);
  const g = Math.round(size * 0.16);
  const iris = Math.round(size * 0.28);
  const hw = Math.round(size * 0.18);
  const hh = Math.round(size * 0.12);
  const ht = Math.round(size * 0.22);
  const hl = Math.round(size * 0.26);
  return (
    <span className="inline-flex items-center justify-center relative shrink-0"
      style={{ width: size, height: size, verticalAlign: "middle", marginBottom: -size * 0.12 }}
      aria-hidden="true">
      <span className="absolute inset-0 rounded-full" style={{
        background: "conic-gradient(from 120deg, #d0d0d0 0deg, #707070 55deg, #f2f2f2 95deg, #989898 155deg, #d4d4d4 195deg, #ebebeb 235deg, #888888 285deg, #d0d0d0 360deg)",
      }} />
      <span className="absolute rounded-full" style={{ inset: b, background: "#07111c" }} />
      <span className="absolute rounded-full" style={{
        inset: g,
        background: "radial-gradient(circle at 36% 30%, rgba(180,230,255,0.80) 0%, rgba(0,150,220,0.55) 30%, rgba(0,40,100,0.92) 75%)",
        boxShadow: "inset 0 0 14px rgba(0,224,208,0.35), 0 0 18px rgba(0,200,255,0.20)",
      }} />
      <span className="absolute rounded-full" style={{ inset: iris, border: "1px solid rgba(100,180,255,0.25)" }} />
      <span className="absolute rounded-full" style={{
        width: hw, height: hh, top: ht, left: hl,
        background: "radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 70%)",
      }} />
    </span>
  );
}

// ── Clapperboard SVG ──────────────────────────────────────────────────────────
function ClapperSVG() {
  const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <svg viewBox="0 0 240 175" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full" style={{ filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.80))" }} aria-hidden="true">
      <circle cx="22" cy="48" r="5" fill="#666" />
      <circle cx="22" cy="48" r="2.5" fill="#444" />
      <g transform="rotate(-8, 22, 48)">
        <rect x="10" y="12" width="220" height="38" rx="4" fill="#111" stroke="#555" strokeWidth="1.5" />
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i => (
          <rect key={i} x={10 + i * 17 - 3} y="12" width="9" height="38"
            fill={i % 2 === 0 ? "#f4f4f4" : "#111"} clipPath="url(#ca)" transform="skewX(-14)" />
        ))}
        <clipPath id="ca"><rect x="10" y="12" width="220" height="38" rx="4" /></clipPath>
        <rect x="10" y="12" width="220" height="38" rx="4" fill="none" stroke="#555" strokeWidth="1.5" />
      </g>
      <rect x="10" y="48" width="220" height="120" rx="5" fill="#181818" stroke="#444" strokeWidth="1.5" />
      <rect x="18" y="57" width="204" height="103" rx="3" fill="#131313" />
      <line x1="18" y1="84" x2="222" y2="84" stroke="#2a2a2a" strokeWidth="0.8" />
      <line x1="18" y1="130" x2="222" y2="130" stroke="#2a2a2a" strokeWidth="0.8" />
      <line x1="105" y1="57" x2="105" y2="160" stroke="#2a2a2a" strokeWidth="0.8" />
      <line x1="148" y1="84" x2="148" y2="160" stroke="#2a2a2a" strokeWidth="0.8" />
      <line x1="185" y1="84" x2="185" y2="160" stroke="#2a2a2a" strokeWidth="0.8" />
      <text x="24" y="70" fill="#888" fontSize="8" fontFamily="monospace">DATE</text>
      <text x="110" y="70" fill="#888" fontSize="8" fontFamily="monospace">PROD.</text>
      <text x="24" y="80" fill="#eeeeee" fontSize="9.5" fontFamily="monospace" fontWeight="bold">{dateStr}</text>
      <text x="110" y="80" fill="#eeeeee" fontSize="9.5" fontFamily="monospace" fontWeight="bold">CINÉ O</text>
      <text x="24" y="97" fill="#888" fontSize="8" fontFamily="monospace">ROLL</text>
      <text x="110" y="97" fill="#888" fontSize="8" fontFamily="monospace">SCENE</text>
      <text x="152" y="97" fill="#888" fontSize="8" fontFamily="monospace">SON</text>
      <text x="24" y="126" fill="#eeeeee" fontSize="10" fontFamily="monospace" fontWeight="bold">A001</text>
      <text x="110" y="126" fill="#eeeeee" fontSize="10" fontFamily="monospace" fontWeight="bold">07</text>
      <text x="152" y="126" fill="#00E0D0" fontSize="10" fontFamily="monospace" fontWeight="bold">02</text>
      <text x="24" y="141" fill="#888" fontSize="8" fontFamily="monospace">DIR.</text>
      <text x="110" y="141" fill="#888" fontSize="8" fontFamily="monospace">CAM.</text>
      <text x="24" y="155" fill="#eeeeee" fontSize="8.5" fontFamily="monospace">—</text>
      <text x="110" y="155" fill="#eeeeee" fontSize="8.5" fontFamily="monospace">A CAM</text>
    </svg>
  );
}

// ── Underline input ───────────────────────────────────────────────────────────
interface InputProps {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode;
  required?: boolean; minLength?: number; rightSlot?: React.ReactNode; autoComplete?: string;
}

function UnderlineInput({ type, placeholder, value, onChange, icon, required, minLength, rightSlot, autoComplete }: InputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative pb-4">
      <label className="absolute left-8 pointer-events-none transition-all duration-150"
        style={{ top: active ? -1 : 13, fontSize: active ? 10 : 14, color: focused ? "#00E0D0" : "#8E9AAF", lineHeight: 1 }}>
        {placeholder}
      </label>
      <div className="flex items-center gap-2.5 pt-4">
        <span style={{ color: focused ? "#00E0D0" : "#6b7a8d" }} className="transition-colors duration-150 shrink-0">{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required={required} minLength={minLength} autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-white focus:outline-none min-h-[28px]"
          style={{ caretColor: "#00E0D0" }} />
        {rightSlot}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div className="absolute bottom-0 left-0 h-px transition-all duration-200"
        style={{ background: "#00E0D0", width: focused ? "100%" : "0%" }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Screen = "splash" | "login" | "register" | "resetPassword";

// ── Fond partagé (extrait hors du composant pour éviter les remounts) ─────────
function AuthBg({ bgUrl, screen }: { bgUrl: string; screen: Screen }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0" style={{
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: "cover", backgroundPosition: "top center",
      }} />
      <div className="absolute inset-0" style={{
        background: screen === "splash"
          ? "linear-gradient(to bottom, rgba(4,13,23,0.38) 0%, rgba(4,13,23,0.06) 28%, rgba(4,13,23,0.62) 60%, #040d17 80%)"
          : "linear-gradient(to bottom, transparent 28%, rgba(4,13,23,0.62) 50%, rgba(4,13,23,0.92) 68%, #040d17 85%)",
      }} />
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}

export function AuthModal() {
  const loginBg = useSettingsStore((s) => s.loginBg);
  const bgUrl = resolveLoginBg(loginBg);

  const [screen, setScreen] = useState<Screen>("splash");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = email.length > 0 && password.length >= 6 && (screen === "login" || displayName.length > 0);

  function goForm(s: "login" | "register" | "resetPassword") {
    setError(""); setSuccess(""); setScreen(s);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (screen === "register") {
        const initials = displayName.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
        const { error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName, initials } },
        });
        if (err) throw err;
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
      } else if (screen === "resetPassword") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        });
        if (err) throw err;
        setSuccess("Email envoyé ! Consultez votre boîte mail pour réinitialiser votre mot de passe.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err: unknown) {
      const msg = extractMsg(err);
      if (msg.includes("Invalid login")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("already registered")) setError("Cet email est déjà utilisé.");
      else if (msg.includes("Password should be")) setError("Mot de passe trop court (6 caractères min).");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      });
      if (err) throw err;
      setSuccess("Email envoyé ! Consultez votre boîte mail pour réinitialiser votre mot de passe.");
    } catch (err: unknown) {
      setError(extractMsg(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Écran d'accueil (splash) ─────────────────────────────────────────────────
  if (screen === "splash") {
    return (
      <div className="relative min-h-screen flex flex-col" style={{ background: "#040d17" }}>
        <AuthBg bgUrl={bgUrl} screen={screen} />

        {/* Clap + marque centrés */}
        <div className="relative flex-1 flex flex-col items-center justify-center"
          style={{ paddingBottom: "20vh", paddingTop: "6vh" }}>
          {/* Cinema spotlight glow */}
          <div aria-hidden="true" style={{
            position: "absolute",
            bottom: "22vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: 320,
            height: 160,
            background: "radial-gradient(ellipse at center, rgba(0,224,208,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ width: "56%", maxWidth: 210, marginBottom: 30 }}>
            <ClapperSVG />
          </div>

          <h1 className="inline-flex items-center justify-center text-white leading-none"
            style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.025em" }}>
            Ciné<LensO size={64} />
          </h1>
          <p style={{ color: "#C9D2E3", fontSize: 14, marginTop: 12, textAlign: "center" }}>
            Feuille de service collaborative
          </p>
          <p style={{ color: "#00E0D0", fontSize: 11, fontWeight: 600, marginTop: 6, textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Équipes cinéma &amp; TV
          </p>
        </div>

        {/* CTA fixe en bas */}
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-6"
          style={{ background: "linear-gradient(to top, #040d17 65%, transparent)" }}>
          <button
            onClick={() => goForm("login")}
            className="w-full font-bold flex items-center justify-center active:scale-[0.97] transition-transform"
            style={{
              height: 54, borderRadius: 18, background: "#00E0D0",
              color: "#021414", fontSize: 15, fontWeight: 700,
              boxShadow: "0 0 32px rgba(0,224,208,0.28)",
            }}>
            Se connecter
          </button>
          <p className="text-center text-xs mt-3.5" style={{ color: "#8E9AAF" }}>
            Pas encore de compte ?{" "}
            <button onClick={() => goForm("register")}
              className="font-semibold" style={{ color: "#00E0D0" }}>
              S&apos;inscrire
            </button>
          </p>
          <div style={{ height: "env(safe-area-inset-bottom, 8px)" }} />
        </div>
      </div>
    );
  }

  // ── Réinitialisation du mot de passe ─────────────────────────────────────────
  if (screen === "resetPassword") {
    return (
      <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: "#040d17" }}>
        <AuthBg bgUrl={bgUrl} screen="login" />
        <div className="relative flex-shrink-0 flex items-end justify-center px-12"
          style={{ height: "26vh", maxHeight: 200, minHeight: 140, paddingBottom: 4 }}>
          <div style={{ width: "40%", maxWidth: 148 }}><ClapperSVG /></div>
        </div>
        <div className="relative flex-1 flex flex-col justify-end px-5 pb-4" style={{ paddingTop: 8 }}>
          <div className="rounded-[28px] p-6" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
          }}>
            <h2 className="text-white font-bold mb-2" style={{ fontSize: 22 }}>Mot de passe oublié</h2>
            <p className="text-xs mb-5" style={{ color: "#8E9AAF" }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            {error && (
              <div className="mb-4 rounded-xl px-3 py-2.5 text-xs"
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
            {!success && (
              <form onSubmit={(e) => void handleResetPassword(e)} className="space-y-1">
                <UnderlineInput type="email" placeholder="Email" value={email} onChange={setEmail}
                  icon={<Mail className="w-4 h-4" strokeWidth={1.5} />} required autoComplete="email" />
                <div className="pt-4">
                  <button type="submit" disabled={loading || email.length === 0}
                    className="w-full font-bold text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-40 flex items-center justify-center"
                    style={{ height: 54, borderRadius: 18, background: "#00E0D0", color: "#021414", fontSize: 15 }}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le lien"}
                  </button>
                </div>
              </form>
            )}
          </div>
          <button onClick={() => goForm("login")}
            className="mt-4 flex items-center justify-center gap-1.5 mx-auto transition-opacity hover:opacity-70"
            style={{ color: "#6b7a8d", fontSize: 12 }}>
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            Retour à la connexion
          </button>
          <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
        </div>
      </div>
    );
  }

  // ── Formulaire (connexion / inscription) ─────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: "#040d17" }}>
      <AuthBg bgUrl={bgUrl} screen={screen} />

      {/* Petit héros en haut */}
      <div className="relative flex-shrink-0 flex items-end justify-center px-12"
        style={{ height: "26vh", maxHeight: 200, minHeight: 140, paddingBottom: 4 }}>
        <div style={{ width: "40%", maxWidth: 148 }}>
          <ClapperSVG />
        </div>
      </div>
      <div className="relative flex-shrink-0 text-center pb-3">
        <h1 className="inline-flex items-center justify-center text-white leading-none"
          style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Ciné<LensO size={36} />
        </h1>
      </div>

      {/* Formulaire */}
      <div className="relative flex-1 flex flex-col justify-end px-5 pb-4" style={{ paddingTop: 8 }}>
        <div className="rounded-[28px] p-6" style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow: "inset 0 1px 0 rgba(0,224,208,0.12), 0 24px 64px rgba(0,0,0,0.60)",
        }}>
          <h2 className="text-white font-bold mb-5" style={{ fontSize: 22 }}>
            {screen === "login" ? "Connexion" : "Créer un compte"}
          </h2>

          {error && (
            <div className="mb-4 rounded-xl px-3 py-2.5 text-xs"
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
            {screen === "register" && (
              <UnderlineInput type="text" placeholder="Prénom Nom" value={displayName} onChange={setDisplayName}
                icon={<User className="w-4 h-4" strokeWidth={1.5} />} required autoComplete="name" />
            )}
            <UnderlineInput type="email" placeholder="Email" value={email} onChange={setEmail}
              icon={<Mail className="w-4 h-4" strokeWidth={1.5} />} required autoComplete="email" />
            <UnderlineInput
              type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={setPassword}
              icon={<Lock className="w-4 h-4" strokeWidth={1.5} />} required minLength={6}
              autoComplete={screen === "login" ? "current-password" : "new-password"}
              rightSlot={
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="shrink-0 transition-colors" style={{ color: showPassword ? "#00E0D0" : "#6b7a8d" }}
                  aria-label={showPassword ? "Masquer" : "Afficher"}>
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              }
            />
            {screen === "login" && (
              <div className="text-right -mt-1 mb-1">
                <button type="button" onClick={() => goForm("resetPassword")}
                  className="text-xs transition-opacity hover:opacity-80" style={{ color: "#8E9AAF" }}>
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            <div className="pt-3">
              <button type="submit" disabled={loading || !canSubmit}
                className="w-full font-bold text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  height: 54, borderRadius: 18,
                  background: canSubmit && !loading ? "#00E0D0" : "rgba(0,224,208,0.5)",
                  color: "#021414", fontSize: 15,
                  boxShadow: canSubmit ? "0 0 24px rgba(0,224,208,0.22)" : "none",
                }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : screen === "login" ? "Se connecter" : "Créer le compte"}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs" style={{ color: "#6b7a8d" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <p className="text-center text-xs" style={{ color: "#8E9AAF" }}>
            {screen === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button onClick={() => goForm(screen === "login" ? "register" : "login")}
              className="font-semibold transition-opacity hover:opacity-80" style={{ color: "#00E0D0" }}>
              {screen === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

        <button onClick={() => setScreen("splash")}
          className="mt-4 flex items-center justify-center gap-1.5 mx-auto transition-opacity hover:opacity-70"
          style={{ color: "#6b7a8d", fontSize: 12 }}>
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          Retour
        </button>

        <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
      </div>
    </div>
  );
}
