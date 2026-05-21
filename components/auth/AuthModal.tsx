"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { FeaturesSheet } from "@/components/onboarding/FeaturesSheet";

// ── Logo lens "O" ─────────────────────────────────────────────────────────────
function LensO() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center relative shrink-0"
      style={{ width: 44, height: 44, verticalAlign: "middle", marginLeft: 3, marginBottom: -6 }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 125deg, #c8c8c8 0deg, #787878 60deg, #f0f0f0 100deg, #a0a0a0 160deg, #d0d0d0 200deg, #e8e8e8 240deg, #909090 290deg, #c8c8c8 360deg)",
        }}
      />
      <span className="absolute rounded-full" style={{ inset: 4, background: "#080f17" }} />
      <span
        className="absolute rounded-full"
        style={{
          inset: 8,
          background:
            "radial-gradient(circle at 38% 32%, rgba(0,210,255,0.55) 0%, rgba(0,140,200,0.35) 35%, rgba(0,30,70,0.95) 80%)",
          boxShadow: "inset 0 0 10px rgba(0,224,208,0.4), 0 0 14px rgba(0,224,208,0.18)",
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          width: 7, height: 7,
          background: "radial-gradient(circle, rgba(0,224,208,0.9) 0%, transparent 70%)",
          top: 13, left: 14,
        }}
      />
    </span>
  );
}

// ── Clapperboard SVG ──────────────────────────────────────────────────────────
function Clapperboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl" aria-hidden="true">
      <rect x="10" y="40" width="200" height="112" rx="5" fill="#1a1a1a" />
      <rect x="10" y="40" width="200" height="112" rx="5" stroke="#444" strokeWidth="1.5" />
      <rect x="18" y="50" width="184" height="94" rx="3" fill="#141414" />
      <line x1="18" y1="74" x2="202" y2="74" stroke="#333" strokeWidth="0.8" />
      <line x1="18" y1="98" x2="202" y2="98" stroke="#333" strokeWidth="0.8" />
      <line x1="18" y1="122" x2="202" y2="122" stroke="#333" strokeWidth="0.8" />
      <line x1="80" y1="50" x2="80" y2="144" stroke="#333" strokeWidth="0.8" />
      <line x1="130" y1="98" x2="130" y2="144" stroke="#333" strokeWidth="0.8" />
      <line x1="165" y1="98" x2="165" y2="144" stroke="#333" strokeWidth="0.8" />
      <text x="22" y="66" fill="#888" fontSize="7" fontFamily="monospace">DATE</text>
      <text x="84" y="66" fill="#888" fontSize="7" fontFamily="monospace">PROD.</text>
      <text x="22" y="90" fill="#888" fontSize="7" fontFamily="monospace">ROLL</text>
      <text x="84" y="90" fill="#888" fontSize="7" fontFamily="monospace">SCENE</text>
      <text x="136" y="112" fill="#888" fontSize="7" fontFamily="monospace">TAKE</text>
      <text x="22" y="114" fill="#888" fontSize="7" fontFamily="monospace">DIR.</text>
      <text x="84" y="114" fill="#888" fontSize="7" fontFamily="monospace">CAM.</text>
      <text x="136" y="90" fill="#888" fontSize="7" fontFamily="monospace">SON</text>
      <text x="22" y="72" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">{dateStr}</text>
      <text x="84" y="72" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">CINÉ O</text>
      <text x="22" y="96" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">A001</text>
      <text x="84" y="96" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">07</text>
      <text x="136" y="96" fill="#00E0D0" fontSize="9" fontFamily="monospace" fontWeight="bold">02</text>
      <text x="22" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">— —</text>
      <text x="84" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">A CAM</text>
      <text x="136" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">SYNC</text>
      <rect x="10" y="14" width="200" height="30" rx="3" fill="#111" stroke="#555" strokeWidth="1.5" />
      <rect x="10" y="8" width="200" height="12" rx="3" fill="#1e1e1e" stroke="#555" strokeWidth="1.5" />
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
        <rect key={i} x={10 + i * 16 - 2} y="8" width="8" height="12"
          fill={i % 2 === 0 ? "#f0f0f0" : "#111"} transform="skewX(-18)" clipPath="url(#clapClip)" />
      ))}
      <clipPath id="clapClip"><rect x="10" y="8" width="200" height="12" rx="3" /></clipPath>
      <circle cx="18" cy="14" r="4" fill="#555" />
      <circle cx="18" cy="14" r="2" fill="#333" />
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
        <rect key={i} x={10 + i * 16 - 2} y="14" width="8" height="28"
          fill={i % 2 === 0 ? "#f0f0f0" : "#111"} transform="skewX(-18)" clipPath="url(#bodyClip)" />
      ))}
      <clipPath id="bodyClip"><rect x="10" y="14" width="200" height="28" rx="3" /></clipPath>
    </svg>
  );
}

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
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: "#071018" }}>
      {/* ── Cinematic background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(175deg, #010912 0%, #030d18 30%, #061220 55%, #071822 75%, #081520 100%)",
        }} />
        <div className="absolute" style={{
          bottom: "38%", left: 0, right: 0, height: "28%",
          background: "radial-gradient(ellipse 80% 100% at 60% 100%, rgba(255,130,40,0.09) 0%, rgba(255,80,20,0.04) 40%, transparent 70%)",
        }} />
        <div className="absolute inset-0" style={{
          background: "conic-gradient(from 74deg at 14% 2%, transparent 0deg, rgba(200,230,255,0.07) 12deg, rgba(220,240,255,0.18) 20deg, rgba(235,248,255,0.22) 26deg, rgba(220,240,255,0.16) 32deg, rgba(200,228,255,0.06) 40deg, transparent 52deg)",
        }} />
        <div className="absolute" style={{
          top: 0, left: "-5%", width: "55%", height: "65%",
          background: "radial-gradient(ellipse at 20% 0%, rgba(190,225,255,0.10) 0%, rgba(160,210,255,0.04) 40%, transparent 65%)",
          filter: "blur(8px)",
        }} />
        <div className="absolute bottom-0 left-0 right-0" style={{
          height: "50%",
          background: "linear-gradient(to bottom, transparent 0%, rgba(3,10,18,0.6) 60%, rgba(3,10,18,0.9) 100%)",
        }} />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.045, mixBlendMode: "overlay" }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* ── Projector (upper-left) ── */}
      <div className="absolute pointer-events-none" aria-hidden="true" style={{ top: 18, left: 14 }}>
        <div className="absolute rounded-full" style={{
          width: 60, height: 60, top: 4, left: 28,
          background: "radial-gradient(circle, rgba(220,240,255,0.55) 0%, rgba(180,220,255,0.18) 40%, transparent 70%)",
          filter: "blur(6px)",
        }} />
        <svg viewBox="0 0 96 56" width={96} height={56} fill="none">
          <rect x="0" y="8" width="62" height="38" rx="5" fill="#1a2230" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
          <rect x="8" y="4" width="44" height="8" rx="3" fill="#222d3d" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          {[14,22,30,38].map(x => <rect key={x} x={x} y="10" width="2" height="14" rx="1" fill="rgba(0,0,0,0.5)"/>)}
          <rect x="56" y="14" width="20" height="26" rx="4" fill="#141e2a" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <circle cx="76" cy="27" r="11" fill="#0d1520" stroke="rgba(200,230,255,0.25)" strokeWidth="1.5"/>
          <circle cx="76" cy="27" r="8" fill="url(#lensGrad)" style={{ filter: "drop-shadow(0 0 6px rgba(200,235,255,0.7))" }}/>
          <ellipse cx="73" cy="23" rx="3" ry="2" fill="rgba(255,255,255,0.55)" style={{ filter: "blur(1px)" }}/>
          <rect x="22" y="46" width="18" height="8" rx="2" fill="#141e2a" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
          <rect x="16" y="52" width="30" height="4" rx="2" fill="#0d1520"/>
          <defs>
            <radialGradient id="lensGrad" cx="38%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(230,245,255,0.95)"/>
              <stop offset="35%" stopColor="rgba(160,210,255,0.75)"/>
              <stop offset="100%" stopColor="rgba(20,60,120,0.9)"/>
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* ── Hero: clapperboard ── */}
      <div className="relative flex-shrink-0" style={{ height: "40vh", maxHeight: 300, minHeight: 210 }}>
        <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pb-4 px-10">
          <div style={{ width: "78%", maxWidth: 250, opacity: 0.95, filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.7))" }}>
            <Clapperboard />
          </div>
        </div>
      </div>

      {/* ── Brand ── */}
      <div className="relative text-center px-6 mt-2 flex-shrink-0">
        <h1 className="inline-flex items-center justify-center tracking-tight text-white"
          style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>
          Ciné<LensO />
        </h1>
        <p className="mt-3 text-sm font-medium" style={{ color: "#C9D2E3" }}>
          Feuille de service collaborative
        </p>
      </div>

      {/* ── Form card ── */}
      <div className="relative flex-1 flex flex-col justify-end px-5 pb-8" style={{ paddingTop: 20 }}>
        <div className="rounded-[28px] p-6" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.40)",
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
