"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, HelpCircle } from "lucide-react";

// ── Scene SVG background ──────────────────────────────────────────────────────

function CinemaScene() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 390 700"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#010912" />
          <stop offset="45%" stopColor="#020c18" />
          <stop offset="100%" stopColor="#041020" />
        </linearGradient>
        <radialGradient id="horizWarm" cx="62%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#d06820" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#b04810" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#b04810" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamCore" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8e0ff" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#b0ccf0" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#90b8e0" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="beamHaze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b0cce8" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#90b0d8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lensFlare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%" stopColor="#e8f4ff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#b8d8ff" stopOpacity="0.55" />
          <stop offset="80%" stopColor="#80b0e8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#60a0d8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#102030" />
          <stop offset="100%" stopColor="#060e18" />
        </linearGradient>
        <radialGradient id="seaWarm" cx="65%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#c86020" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#c86020" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="50%" cy="40%" r="65%">
          <stop offset="50%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="390" height="700" fill="url(#sky)" />

      {/* Spotlight beam — wide haze layer */}
      <polygon
        points="28,8 72,8 420,560 100,590"
        fill="url(#beamHaze)"
        opacity="0.8"
      />
      {/* Spotlight beam — bright core */}
      <polygon
        points="34,10 60,10 380,470 210,510"
        fill="url(#beamCore)"
        opacity="0.85"
      />

      {/* Projector lens glow — bright circle at source */}
      <circle cx="46" cy="20" r="42" fill="url(#lensFlare)" opacity="0.95" />
      <circle cx="46" cy="20" r="18" fill="white" opacity="0.90" />
      <circle cx="46" cy="20" r="9" fill="white" opacity="1" />

      {/* Horizon warm atmosphere */}
      <rect x="0" y="270" width="390" height="120" fill="url(#horizWarm)" />

      {/* Far mountain range */}
      <path
        d="M-10,365 L35,295 L75,318 L115,278 L155,305 L195,260 L225,282 L262,248 L292,268 L320,245 L350,262 L378,248 L400,255 L400,375 L-10,375 Z"
        fill="#050d18"
        opacity="0.96"
      />

      {/* Near mountain / hill silhouette */}
      <path
        d="M-10,382 L28,338 L62,356 L98,322 L132,345 L168,312 L204,338 L240,306 L275,325 L308,302 L342,318 L375,305 L400,310 L400,392 L-10,392 Z"
        fill="#030b14"
        opacity="1"
      />

      {/* Sea / bay band */}
      <path d="M-10,370 L400,360 L400,408 L-10,415 Z" fill="url(#seaGrad)" opacity="0.9" />
      <rect x="-10" y="370" width="420" height="45" fill="url(#seaWarm)" />

      {/* Ground */}
      <rect x="-10" y="405" width="420" height="300" fill="#030a14" />

      {/* City lights on horizon */}
      {(
        [
          [148,356,1.2,"#ffd090"],[155,360,0.8,"#ffe4a0"],[162,355,1.0,"#a0d4ff"],
          [170,358,0.9,"#ffd090"],[178,354,1.1,"#ffe4a0"],[185,357,0.8,"#ffd090"],
          [193,353,1.2,"#a0d4ff"],[201,356,0.9,"#ffd090"],[209,352,1.0,"#ffe4a0"],
          [218,355,1.1,"#ffd090"],[226,351,0.8,"#a0d4ff"],[234,354,1.3,"#ffe4a0"],
          [243,350,0.9,"#ffd090"],[252,353,1.0,"#a0d4ff"],[261,349,1.1,"#ffe4a0"],
          [270,352,0.8,"#ffd090"],[279,348,1.2,"#a0d4ff"],[288,351,0.9,"#ffe4a0"],
          [297,347,1.0,"#ffd090"],[306,350,1.1,"#a0d4ff"],[314,347,0.8,"#ffe4a0"],
          [322,350,1.2,"#ffd090"],[330,346,0.9,"#a0d4ff"],[338,349,1.0,"#ffe4a0"],
          [346,346,1.1,"#ffd090"],[354,349,0.8,"#a0d4ff"],
          [158,363,0.7,"#ffd090"],[172,366,0.7,"#ffe4a0"],[185,364,0.8,"#ffd090"],
          [198,367,0.7,"#a0d4ff"],[212,365,0.8,"#ffe4a0"],[228,368,0.7,"#ffd090"],
          [250,366,0.8,"#a0d4ff"],[270,369,0.7,"#ffe4a0"],[290,367,0.8,"#ffd090"],
          [312,370,0.7,"#a0d4ff"],[332,368,0.8,"#ffe4a0"],
        ] as [number, number, number, string][]
      ).map(([x, y, r, c], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={0.3 + (i % 6) * 0.07} />
      ))}

      {/* Palm tree — main right */}
      <g opacity="0.9">
        <path d="M368,0 Q364,90 360,175" stroke="#020912" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M360,85 Q393,48 387,18" stroke="#020912" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M360,85 Q393,100 386,132" stroke="#020912" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M360,85 Q328,44 336,14" stroke="#020912" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M360,85 Q328,108 318,138" stroke="#020912" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M362,65 Q382,28 378,0" stroke="#020912" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M362,65 Q344,28 348,0" stroke="#020912" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Palm tree — right edge, shorter */}
      <g opacity="0.75">
        <path d="M388,0 Q385,75 382,140" stroke="#020912" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M382,65 Q400,35 395,8" stroke="#020912" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M382,65 Q358,38 363,10" stroke="#020912" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M382,65 Q400,78 396,105" stroke="#020912" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* Equipment/vehicle silhouettes bottom-left */}
      <rect x="-5" y="418" width="140" height="55" rx="4" fill="#010810" opacity="0.98" />
      <rect x="5" y="405" width="90" height="22" rx="2" fill="#010810" opacity="0.95" />
      <rect x="18" y="393" width="58" height="18" rx="2" fill="#01080f" opacity="0.9" />
      <circle cx="22" cy="466" r="13" fill="#010810" opacity="0.98" />
      <circle cx="68" cy="468" r="15" fill="#010810" opacity="0.98" />
      <rect x="-5" y="462" width="150" height="18" rx="2" fill="#00070e" opacity="0.98" />

      {/* Projector body (physical device top-left) */}
      <g>
        {/* Stand */}
        <rect x="30" y="55" width="8" height="38" rx="2" fill="#1a2535" opacity="0.95" />
        <rect x="20" y="90" width="28" height="5" rx="2" fill="#141e2a" opacity="0.9" />
        {/* Body */}
        <rect x="4" y="25" width="64" height="36" rx="6" fill="#1c2838" stroke="rgba(255,255,255,0.10)" strokeWidth="1" opacity="0.95" />
        {/* Top ridge */}
        <rect x="12" y="20" width="46" height="9" rx="3" fill="#232f40" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
        {/* Vent slots */}
        {[14,21,28,35,42].map(x => (
          <rect key={x} x={x} y="28" width="2.5" height="12" rx="1" fill="rgba(0,0,0,0.6)" />
        ))}
        {/* Lens barrel */}
        <rect x="60" y="30" width="22" height="22" rx="5" fill="#141e2c" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        {/* Lens front */}
        <circle cx="74" cy="41" r="10" fill="#0d1825" stroke="rgba(200,230,255,0.30)" strokeWidth="1.5" />
        {/* Lens glass — glowing */}
        <circle cx="74" cy="41" r="7" fill="#b8d8ff" opacity="0.9" style={{ filter: "blur(0.5px)" }} />
        <circle cx="74" cy="41" r="4.5" fill="white" opacity="0.98" />
        <ellipse cx="71" cy="38" rx="2.5" ry="1.5" fill="white" opacity="0.7" style={{ filter: "blur(0.5px)" }} />
      </g>

      {/* Vignette */}
      <rect width="390" height="700" fill="url(#vignette)" />

      {/* Film grain */}
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="390" height="700" filter="url(#grain)" opacity="0.038" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}

// ── Camera lens "O" ───────────────────────────────────────────────────────────

function LensO({ size = 58 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center relative shrink-0"
      style={{ width: size, height: size, verticalAlign: "middle", marginBottom: -size * 0.12 }}
      aria-hidden="true"
    >
      {/* Chrome outer ring */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 120deg, #d0d0d0 0deg, #707070 55deg, #f2f2f2 95deg, #989898 155deg, #d4d4d4 195deg, #ebebeb 235deg, #888888 285deg, #d0d0d0 360deg)",
        }}
      />
      {/* Inner dark bezel */}
      <span
        className="absolute rounded-full"
        style={{ inset: Math.round(size * 0.07), background: "#07111c" }}
      />
      {/* Lens glass */}
      <span
        className="absolute rounded-full"
        style={{
          inset: Math.round(size * 0.16),
          background:
            "radial-gradient(circle at 36% 30%, rgba(180,230,255,0.80) 0%, rgba(0,150,220,0.55) 30%, rgba(0,40,100,0.92) 75%)",
          boxShadow: "inset 0 0 14px rgba(0,224,208,0.35), 0 0 18px rgba(0,200,255,0.20)",
        }}
      />
      {/* Iris ring */}
      <span
        className="absolute rounded-full"
        style={{
          inset: Math.round(size * 0.28),
          border: "1px solid rgba(100,180,255,0.25)",
        }}
      />
      {/* Specular highlight */}
      <span
        className="absolute rounded-full"
        style={{
          width: Math.round(size * 0.18),
          height: Math.round(size * 0.12),
          top: Math.round(size * 0.22),
          left: Math.round(size * 0.26),
          background: "radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 70%)",
        }}
      />
    </span>
  );
}

// ── Clapperboard ──────────────────────────────────────────────────────────────

function Clapperboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <svg
      viewBox="0 0 240 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.75))" }}
      aria-hidden="true"
    >
      {/* Hinge pivot */}
      <circle cx="22" cy="48" r="5" fill="#666" />
      <circle cx="22" cy="48" r="2.5" fill="#444" />

      {/* Clapper arm (top, slightly angled open) */}
      <g transform="rotate(-8, 22, 48)">
        <rect x="10" y="12" width="220" height="38" rx="4" fill="#111" stroke="#555" strokeWidth="1.5" />
        {/* Stripes */}
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i => (
          <rect
            key={i}
            x={10 + i * 17 - 3}
            y="12"
            width="9"
            height="38"
            fill={i % 2 === 0 ? "#f4f4f4" : "#111"}
            clipPath="url(#clapArmClip)"
            transform="skewX(-14)"
          />
        ))}
        <clipPath id="clapArmClip">
          <rect x="10" y="12" width="220" height="38" rx="4" />
        </clipPath>
        <rect x="10" y="12" width="220" height="38" rx="4" fill="none" stroke="#555" strokeWidth="1.5" />
      </g>

      {/* Body */}
      <rect x="10" y="48" width="220" height="120" rx="5" fill="#181818" />
      <rect x="10" y="48" width="220" height="120" rx="5" stroke="#444" strokeWidth="1.5" />

      {/* Inner panel */}
      <rect x="18" y="57" width="204" height="103" rx="3" fill="#131313" />

      {/* Grid lines horizontal */}
      <line x1="18" y1="84" x2="222" y2="84" stroke="#2a2a2a" strokeWidth="0.8" />
      <line x1="18" y1="130" x2="222" y2="130" stroke="#2a2a2a" strokeWidth="0.8" />

      {/* Grid lines vertical */}
      <line x1="105" y1="57" x2="105" y2="160" stroke="#2a2a2a" strokeWidth="0.8" />
      <line x1="148" y1="84" x2="148" y2="160" stroke="#2a2a2a" strokeWidth="0.8" />
      <line x1="185" y1="84" x2="185" y2="160" stroke="#2a2a2a" strokeWidth="0.8" />

      {/* Labels row 1 */}
      <text x="24" y="70" fill="#888" fontSize="8" fontFamily="monospace" letterSpacing="0.5">DATE</text>
      <text x="110" y="70" fill="#888" fontSize="8" fontFamily="monospace" letterSpacing="0.5">PROD.</text>

      {/* Values row 1 */}
      <text x="24" y="80" fill="#eeeeee" fontSize="9.5" fontFamily="monospace" fontWeight="bold">{dateStr}</text>
      <text x="110" y="80" fill="#eeeeee" fontSize="9.5" fontFamily="monospace" fontWeight="bold">CINÉ O</text>

      {/* Labels row 2 */}
      <text x="24" y="97" fill="#888" fontSize="8" fontFamily="monospace">ROLL</text>
      <text x="110" y="97" fill="#888" fontSize="8" fontFamily="monospace">SCENE</text>
      <text x="152" y="97" fill="#888" fontSize="8" fontFamily="monospace">SON</text>
      <text x="190" y="97" fill="#888" fontSize="8" fontFamily="monospace">TAKE</text>

      {/* Values row 2 */}
      <text x="24" y="126" fill="#eeeeee" fontSize="10" fontFamily="monospace" fontWeight="bold">A001</text>
      <text x="110" y="126" fill="#eeeeee" fontSize="10" fontFamily="monospace" fontWeight="bold">07</text>
      <text x="152" y="126" fill="#00E0D0" fontSize="10" fontFamily="monospace" fontWeight="bold">02</text>
      <text x="190" y="126" fill="#eeeeee" fontSize="10" fontFamily="monospace" fontWeight="bold">—</text>

      {/* Labels row 3 */}
      <text x="24" y="141" fill="#888" fontSize="8" fontFamily="monospace">DIR.</text>
      <text x="110" y="141" fill="#888" fontSize="8" fontFamily="monospace">CAM.</text>
      <text x="152" y="141" fill="#888" fontSize="8" fontFamily="monospace">SYNC</text>

      {/* Values row 3 */}
      <text x="24" y="155" fill="#eeeeee" fontSize="8.5" fontFamily="monospace">—</text>
      <text x="110" y="155" fill="#eeeeee" fontSize="8.5" fontFamily="monospace">A CAM</text>
      <text x="152" y="155" fill="#eeeeee" fontSize="8.5" fontFamily="monospace">✓</text>
    </svg>
  );
}

// ── Underline input ───────────────────────────────────────────────────────────

interface FieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}

function Field({ type, placeholder, value, onChange, icon, rightSlot }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pb-4">
      <label
        className="absolute pointer-events-none transition-all duration-150"
        style={{
          left: 32,
          top: active ? 0 : 14,
          fontSize: active ? 10 : 14,
          color: focused ? "#00E0D0" : "#8E9AAF",
          lineHeight: 1,
          letterSpacing: active ? "0.06em" : 0,
        }}
      >
        {placeholder}
      </label>
      <div className="flex items-center gap-3 pt-5">
        <span className="shrink-0 transition-colors duration-150" style={{ color: focused ? "#00E0D0" : "#8E9AAF" }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-white focus:outline-none"
          style={{ fontSize: 15, caretColor: "#00E0D0" }}
        />
        {rightSlot}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
      <div
        className="absolute bottom-0 left-0 h-px transition-all duration-200"
        style={{ background: "#00E0D0", width: focused ? "100%" : "0%" }}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuthPreviewPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#010912", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Scene */}
      <CinemaScene />

      {/* Clapperboard hero */}
      <div
        className="relative flex-shrink-0 flex items-end justify-center"
        style={{ height: "44vh", maxHeight: 310, minHeight: 220, paddingBottom: 16 }}
      >
        <div style={{ width: "62%", maxWidth: 235 }}>
          <Clapperboard />
        </div>
      </div>

      {/* Brand */}
      <div className="relative flex-shrink-0 text-center px-6">
        <h1
          className="inline-flex items-center justify-center text-white leading-none"
          style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Ciné<LensO size={54} />
        </h1>
        <p className="mt-2.5" style={{ fontSize: 15, color: "#C9D2E3", fontWeight: 400 }}>
          Feuille de service collaborative
        </p>
        <p className="mt-1.5" style={{ fontSize: 13, color: "#00E0D0", fontWeight: 500 }}>
          Conçu pour les équipes cinéma &amp; TV en Martinique
        </p>
      </div>

      {/* Form card */}
      <div
        className="relative flex-1 flex flex-col justify-end px-4"
        style={{ paddingTop: 18, paddingBottom: 16 }}
      >
        <div
          className="rounded-3xl px-6 py-6"
          style={{
            background: "rgba(8,18,30,0.88)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <h2
            className="text-white mb-5"
            style={{ fontSize: 22, fontWeight: 700 }}
          >
            Connexion
          </h2>

          <div className="space-y-0">
            <Field
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              icon={<Mail className="w-4 h-4" strokeWidth={1.5} />}
            />
            <Field
              type={showPwd ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={setPassword}
              icon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{ color: "#8E9AAF" }}
                  className="shrink-0"
                  aria-label="Afficher/masquer"
                >
                  {showPwd
                    ? <Eye className="w-4 h-4" strokeWidth={1.5} />
                    : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              }
            />
          </div>

          <div className="mt-5">
            <button
              className="w-full font-bold flex items-center justify-center transition-all active:scale-[0.97]"
              style={{
                height: 54,
                borderRadius: 16,
                background: "#00E0D0",
                color: "#021414",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 0 28px rgba(0,224,208,0.28)",
              }}
            >
              Se connecter
            </button>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-3 mt-5 mb-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 12, color: "#5a6a80" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <p className="text-center" style={{ fontSize: 13, color: "#8E9AAF" }}>
            Pas encore de compte ?{" "}
            <span style={{ color: "#00E0D0", fontWeight: 600, cursor: "pointer" }}>S&#39;inscrire</span>
          </p>
        </div>

        {/* Footer link */}
        <button
          className="mt-4 flex items-center justify-center gap-1.5 mx-auto"
          style={{ fontSize: 12, color: "#8E9AAF" }}
        >
          <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
          Comment ça marche ?
        </button>

        {/* iPhone home indicator */}
        <div className="flex justify-center mt-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
          <div
            className="rounded-full"
            style={{ width: 134, height: 5, background: "rgba(255,255,255,0.60)" }}
          />
        </div>
      </div>
    </div>
  );
}
