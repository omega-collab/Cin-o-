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
      {/* Chrome ring */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 125deg, #c8c8c8 0deg, #787878 60deg, #f0f0f0 100deg, #a0a0a0 160deg, #d0d0d0 200deg, #e8e8e8 240deg, #909090 290deg, #c8c8c8 360deg)",
        }}
      />
      {/* Inner dark bezel */}
      <span
        className="absolute rounded-full"
        style={{ inset: 4, background: "#080f17" }}
      />
      {/* Lens glass */}
      <span
        className="absolute rounded-full"
        style={{
          inset: 8,
          background:
            "radial-gradient(circle at 38% 32%, rgba(0,210,255,0.55) 0%, rgba(0,140,200,0.35) 35%, rgba(0,30,70,0.95) 80%)",
          boxShadow:
            "inset 0 0 10px rgba(0,224,208,0.4), 0 0 14px rgba(0,224,208,0.18)",
        }}
      />
      {/* Specular highlight */}
      <span
        className="absolute rounded-full"
        style={{
          width: 7,
          height: 7,
          background:
            "radial-gradient(circle, rgba(0,224,208,0.9) 0%, transparent 70%)",
          top: 13,
          left: 14,
        }}
      />
    </span>
  );
}
<<<<<<< HEAD

// ── Clapperboard SVG ──────────────────────────────────────────────────────────
function Clapperboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-2xl"
      aria-hidden="true"
    >
      {/* Body */}
      <rect x="10" y="40" width="200" height="112" rx="5" fill="#1a1a1a" />
      <rect x="10" y="40" width="200" height="112" rx="5" stroke="#444" strokeWidth="1.5" />

      {/* Inner data panel */}
      <rect x="18" y="50" width="184" height="94" rx="3" fill="#141414" />

      {/* Grid lines */}
      <line x1="18" y1="74" x2="202" y2="74" stroke="#333" strokeWidth="0.8" />
      <line x1="18" y1="98" x2="202" y2="98" stroke="#333" strokeWidth="0.8" />
      <line x1="18" y1="122" x2="202" y2="122" stroke="#333" strokeWidth="0.8" />
      <line x1="80" y1="50" x2="80" y2="144" stroke="#333" strokeWidth="0.8" />
      <line x1="130" y1="98" x2="130" y2="144" stroke="#333" strokeWidth="0.8" />
      <line x1="165" y1="98" x2="165" y2="144" stroke="#333" strokeWidth="0.8" />

      {/* Labels */}
      <text x="22" y="66" fill="#888" fontSize="7" fontFamily="monospace">DATE</text>
      <text x="84" y="66" fill="#888" fontSize="7" fontFamily="monospace">PROD.</text>
      <text x="22" y="90" fill="#888" fontSize="7" fontFamily="monospace">ROLL</text>
      <text x="84" y="90" fill="#888" fontSize="7" fontFamily="monospace">SCENE</text>
      <text x="136" y="112" fill="#888" fontSize="7" fontFamily="monospace">TAKE</text>
      <text x="22" y="114" fill="#888" fontSize="7" fontFamily="monospace">DIR.</text>
      <text x="84" y="114" fill="#888" fontSize="7" fontFamily="monospace">CAM.</text>
      <text x="136" y="90" fill="#888" fontSize="7" fontFamily="monospace">SON</text>

      {/* Values */}
      <text x="22" y="72" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">{dateStr}</text>
      <text x="84" y="72" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">CINÉ O</text>
      <text x="22" y="96" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">A001</text>
      <text x="84" y="96" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">07</text>
      <text x="136" y="96" fill="#00E0D0" fontSize="9" fontFamily="monospace" fontWeight="bold">02</text>
      <text x="22" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">— —</text>
      <text x="84" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">A CAM</text>
      <text x="136" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">SYNC</text>

      {/* Slate top */}
      <rect x="10" y="14" width="200" height="30" rx="3" fill="#111" stroke="#555" strokeWidth="1.5" />
      {/* Clapper moving part */}
      <rect x="10" y="8" width="200" height="12" rx="3" fill="#1e1e1e" stroke="#555" strokeWidth="1.5" />

      {/* Diagonal stripes top */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
        <rect
          key={i}
          x={10 + i * 16 - 2}
          y="8"
          width="8"
          height="12"
          fill={i % 2 === 0 ? "#f0f0f0" : "#111"}
          transform={`skewX(-18)`}
          clipPath="url(#clapClip)"
        />
      ))}
      <clipPath id="clapClip">
        <rect x="10" y="8" width="200" height="12" rx="3" />
      </clipPath>

      {/* Hinge */}
      <circle cx="18" cy="14" r="4" fill="#555" />
      <circle cx="18" cy="14" r="2" fill="#333" />

      {/* Stripes on body slate */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
        <rect
          key={i}
          x={10 + i * 16 - 2}
          y="14"
          width="8"
          height="28"
          fill={i % 2 === 0 ? "#f0f0f0" : "#111"}
          transform={`skewX(-18)`}
          clipPath="url(#bodyClip)"
        />
      ))}
      <clipPath id="bodyClip">
        <rect x="10" y="14" width="200" height="28" rx="3" />
      </clipPath>
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

function UnderlineInput({
  type, placeholder, value, onChange, icon, required, minLength, rightSlot, autoComplete,
}: UnderlineInputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pb-4">
      {/* Floating label */}
      <label
        className="absolute left-8 pointer-events-none transition-all duration-150"
        style={{
          top: active ? -1 : 13,
          fontSize: active ? 10 : 14,
          color: focused ? "#00E0D0" : "#8E9AAF",
          lineHeight: 1,
        }}
      >
        {placeholder}
      </label>

      <div className="flex items-center gap-2.5 pt-4">
        <span style={{ color: focused ? "#00E0D0" : "#6b7a8d" }} className="transition-colors duration-150 shrink-0">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-white focus:outline-none min-h-[28px]"
          style={{ caretColor: "#00E0D0" }}
        />
        {rightSlot}
      </div>

      {/* Underline */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div
        className="absolute bottom-0 left-0 h-px transition-all duration-200"
        style={{
          background: "#00E0D0",
          width: focused ? "100%" : "0%",
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Mode = "login" | "register";

=======

// ── Clapperboard SVG ──────────────────────────────────────────────────────────
function Clapperboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-2xl"
      aria-hidden="true"
    >
      {/* Body */}
      <rect x="10" y="40" width="200" height="112" rx="5" fill="#1a1a1a" />
      <rect x="10" y="40" width="200" height="112" rx="5" stroke="#444" strokeWidth="1.5" />

      {/* Inner data panel */}
      <rect x="18" y="50" width="184" height="94" rx="3" fill="#141414" />

      {/* Grid lines */}
      <line x1="18" y1="74" x2="202" y2="74" stroke="#333" strokeWidth="0.8" />
      <line x1="18" y1="98" x2="202" y2="98" stroke="#333" strokeWidth="0.8" />
      <line x1="18" y1="122" x2="202" y2="122" stroke="#333" strokeWidth="0.8" />
      <line x1="80" y1="50" x2="80" y2="144" stroke="#333" strokeWidth="0.8" />
      <line x1="130" y1="98" x2="130" y2="144" stroke="#333" strokeWidth="0.8" />
      <line x1="165" y1="98" x2="165" y2="144" stroke="#333" strokeWidth="0.8" />

      {/* Labels */}
      <text x="22" y="66" fill="#888" fontSize="7" fontFamily="monospace">DATE</text>
      <text x="84" y="66" fill="#888" fontSize="7" fontFamily="monospace">PROD.</text>
      <text x="22" y="90" fill="#888" fontSize="7" fontFamily="monospace">ROLL</text>
      <text x="84" y="90" fill="#888" fontSize="7" fontFamily="monospace">SCENE</text>
      <text x="136" y="112" fill="#888" fontSize="7" fontFamily="monospace">TAKE</text>
      <text x="22" y="114" fill="#888" fontSize="7" fontFamily="monospace">DIR.</text>
      <text x="84" y="114" fill="#888" fontSize="7" fontFamily="monospace">CAM.</text>
      <text x="136" y="90" fill="#888" fontSize="7" fontFamily="monospace">SON</text>

      {/* Values */}
      <text x="22" y="72" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">{dateStr}</text>
      <text x="84" y="72" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">CINÉ O</text>
      <text x="22" y="96" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">A001</text>
      <text x="84" y="96" fill="#e8e8e8" fontSize="9" fontFamily="monospace" fontWeight="bold">07</text>
      <text x="136" y="96" fill="#00E0D0" fontSize="9" fontFamily="monospace" fontWeight="bold">02</text>
      <text x="22" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">— —</text>
      <text x="84" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">A CAM</text>
      <text x="136" y="118" fill="#e8e8e8" fontSize="8" fontFamily="monospace">SYNC</text>

      {/* Slate top */}
      <rect x="10" y="14" width="200" height="30" rx="3" fill="#111" stroke="#555" strokeWidth="1.5" />
      {/* Clapper moving part */}
      <rect x="10" y="8" width="200" height="12" rx="3" fill="#1e1e1e" stroke="#555" strokeWidth="1.5" />

      {/* Diagonal stripes top */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
        <rect
          key={i}
          x={10 + i * 16 - 2}
          y="8"
          width="8"
          height="12"
          fill={i % 2 === 0 ? "#f0f0f0" : "#111"}
          transform={`skewX(-18)`}
          clipPath="url(#clapClip)"
        />
      ))}
      <clipPath id="clapClip">
        <rect x="10" y="8" width="200" height="12" rx="3" />
      </clipPath>

      {/* Hinge */}
      <circle cx="18" cy="14" r="4" fill="#555" />
      <circle cx="18" cy="14" r="2" fill="#333" />

      {/* Stripes on body slate */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
        <rect
          key={i}
          x={10 + i * 16 - 2}
          y="14"
          width="8"
          height="28"
          fill={i % 2 === 0 ? "#f0f0f0" : "#111"}
          transform={`skewX(-18)`}
          clipPath="url(#bodyClip)"
        />
      ))}
      <clipPath id="bodyClip">
        <rect x="10" y="14" width="200" height="28" rx="3" />
      </clipPath>
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

function UnderlineInput({
  type, placeholder, value, onChange, icon, required, minLength, rightSlot, autoComplete,
}: UnderlineInputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pb-4">
      {/* Floating label */}
      <label
        className="absolute left-8 pointer-events-none transition-all duration-150"
        style={{
          top: active ? -1 : 13,
          fontSize: active ? 10 : 14,
          color: focused ? "#00E0D0" : "#8E9AAF",
          lineHeight: 1,
        }}
      >
        {placeholder}
      </label>

      <div className="flex items-center gap-2.5 pt-4">
        <span style={{ color: focused ? "#00E0D0" : "#6b7a8d" }} className="transition-colors duration-150 shrink-0">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-white focus:outline-none min-h-[28px]"
          style={{ caretColor: "#00E0D0" }}
        />
        {rightSlot}
      </div>

      {/* Underline */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div
        className="absolute bottom-0 left-0 h-px transition-all duration-200"
        style={{
          background: "#00E0D0",
          width: focused ? "100%" : "0%",
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Mode = "login" | "register";

>>>>>>> e9318bf (feat(auth): écran de connexion cinématographique)
export function AuthModal() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [showFeatures, setShowFeatures] = useState(false);
=======
>>>>>>> e9318bf (feat(auth): écran de connexion cinématographique)
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
          email,
          password,
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
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#071018" }}
    >
      {/* ── Cinematic background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Base atmosphere */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 20% -10%, rgba(160,210,255,0.07) 0%, transparent 55%)," +
              "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(255,120,40,0.04) 0%, transparent 60%)," +
              "radial-gradient(ellipse 80% 50% at 50% 110%, rgba(0,30,80,0.5) 0%, transparent 60%)," +
              "radial-gradient(ellipse 50% 30% at 50% 65%, rgba(0,224,208,0.05) 0%, transparent 60%)," +
              "linear-gradient(180deg, #040c14 0%, #071018 50%, #0a1822 100%)",
          }}
        />
        {/* Spotlight beam */}
        <div
          className="absolute"
          style={{
            top: -40,
            left: -60,
            width: "65%",
            height: "75%",
            background:
              "conic-gradient(from 68deg at 22% 0%, transparent 0deg, rgba(180,225,255,0.04) 16deg, rgba(200,235,255,0.09) 24deg, rgba(210,240,255,0.06) 30deg, rgba(190,230,255,0.03) 38deg, transparent 52deg)",
            transformOrigin: "top left",
          }}
        />
        {/* Film grain */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" style={{ mixBlendMode: "overlay" }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
        {/* Bottom fade to solid — ensures card legibility */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(7,16,24,0.85) 40%, #071018 75%)",
          }}
        />
      </div>

      {/* ── Hero: clap + projector ── */}
      <div className="relative flex-shrink-0" style={{ height: "42vh", maxHeight: 320, minHeight: 220 }}>
        <div className="absolute inset-x-0 bottom-0 top-4 flex items-end justify-center pb-6 px-8">
          <div style={{ width: "80%", maxWidth: 260, opacity: 0.92 }}>
            <Clapperboard />
          </div>
        </div>
        {/* Projector body (upper-left) */}
        <div
          className="absolute"
          style={{
            top: "8%",
            left: "3%",
            width: 52,
            height: 38,
            borderRadius: 6,
            background: "linear-gradient(135deg, #2a3040, #161e28)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(180,225,255,0.08)",
          }}
        >
          {/* Lens circle */}
          <div
            className="absolute rounded-full"
            style={{
              width: 18,
              height: 18,
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              background:
                "radial-gradient(circle at 40% 35%, rgba(220,240,255,0.9), rgba(160,200,240,0.6) 40%, rgba(30,60,100,0.8))",
              boxShadow: "0 0 8px rgba(200,230,255,0.4)",
            }}
          />
        </div>
      </div>

      {/* ── Brand ── */}
      <div className="relative text-center px-6 mt-2 flex-shrink-0">
        <h1
          className="inline-flex items-center justify-center tracking-tight text-white"
          style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          Ciné<LensO />
        </h1>
        <p className="mt-3 text-sm font-medium" style={{ color: "#C9D2E3" }}>
          Feuille de service collaborative
        </p>
      </div>

      {/* ── Form card ── */}
      <div className="relative flex-1 flex flex-col justify-end px-5 pb-8" style={{ paddingTop: 20 }}>
        <div
          className="rounded-[28px] p-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.40)",
          }}
        >
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
              <UnderlineInput
                type="text"
                placeholder="Prénom Nom"
                value={displayName}
                onChange={setDisplayName}
                icon={<User className="w-4 h-4" strokeWidth={1.5} />}
                required
                autoComplete="name"
              />
            )}

            <UnderlineInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              icon={<Mail className="w-4 h-4" strokeWidth={1.5} />}
              required
              autoComplete="email"
            />

            <UnderlineInput
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={setPassword}
              icon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="shrink-0 transition-colors"
                  style={{ color: showPassword ? "#00E0D0" : "#6b7a8d" }}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              }
            />

            <div className="pt-5">
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full font-bold text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  height: 56,
                  borderRadius: 18,
                  background: canSubmit && !loading ? "#00E0D0" : "rgba(0,224,208,0.5)",
                  color: "#021414",
                  fontSize: 15,
                  boxShadow: canSubmit ? "0 0 24px rgba(0,224,208,0.22)" : "none",
                }}
              >
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : mode === "login" ? "Se connecter" : "Créer le compte"}
              </button>
            </div>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs" style={{ color: "#6b7a8d" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <p className="text-center text-xs" style={{ color: "#8E9AAF" }}>
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: "#00E0D0" }}
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <button
<<<<<<< HEAD
          onClick={() => setShowFeatures(true)}
=======
>>>>>>> e9318bf (feat(auth): écran de connexion cinématographique)
          className="mt-5 flex items-center justify-center gap-1.5 mx-auto transition-opacity hover:opacity-80"
          style={{ color: "#8E9AAF", fontSize: 12 }}
        >
          <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
          Comment ça marche ?
        </button>

        {/* Safe area */}
        <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
      </div>

      {/* Features overlay */}
      {showFeatures && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <button
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowFeatures(false)}
            aria-label="Fermer"
          />
          {/* Sheet */}
          <div
            className="relative rounded-t-[28px] overflow-hidden"
            style={{
              maxHeight: "85vh",
              background: "#071018",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div style={{ height: "75vh" }}>
              <FeaturesSheet
                onClose={() => setShowFeatures(false)}
                showClose
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
