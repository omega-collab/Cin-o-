"use client";

import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Mode = "login" | "register";

const INPUT =
  "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cyan/40";

export function AuthModal() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        const initials = displayName
          .split(" ")
          .map((w) => w[0]?.toUpperCase() ?? "")
          .slice(0, 2)
          .join("");

        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName, initials },
          },
        });
        if (err) throw err;
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-appBg, #071018)" }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-1">
          <span className="text-4xl">🎬</span>
          <h1 className="text-2xl font-bold text-white mt-2">CinéO</h1>
          <p className="text-sm text-muted">Feuille de service collaborative</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h2>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-green-400 bg-green-900/20 border border-green-800/30 rounded-xl px-3 py-2">
              {success}
            </p>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Prénom Nom"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className={`${INPUT} pl-9`}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${INPUT} pl-9`}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={`${INPUT} pl-9`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Se connecter" : "Créer le compte"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-cyan underline-offset-2 hover:underline"
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
