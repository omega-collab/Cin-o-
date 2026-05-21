"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DepartmentSlug } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useAccessStore } from "@/lib/store/useAccessStore";
import { verifyDepartmentCode } from "@/lib/services/auth.service";
import { DepartmentDetail } from "./DepartmentDetail";

interface DepartmentRouteProps {
  slug: DepartmentSlug;
}

export function DepartmentRoute({ slug }: DepartmentRouteProps) {
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  const isUnlocked = useAccessStore((s) => s.isUnlocked(slug));
  const unlock = useAccessStore((s) => s.unlock);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!dept) router.push("/departments");
  }, [dept, router]);

  if (!dept) return null;

  if (isUnlocked) {
    return <DepartmentDetail slug={slug} />;
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await verifyDepartmentCode(slug, code);
    setLoading(false);
    if (result.success) {
      unlock(slug);
    } else {
      setError(result.error ?? "Code incorrect");
      setCode("");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="glass-card-strong w-full max-w-xs mx-auto rounded-app p-8">
        {/* Icon + name */}
        <div className="flex flex-col items-center mb-7">
          <span
            className="text-6xl leading-none select-none mb-4"
            role="img"
            aria-label={dept.name}
          >
            {dept.icon}
          </span>
          <h2 className="text-2xl font-bold text-center text-white">{dept.name}</h2>
          <p className="text-sm mt-1 text-center text-muted">Accès protégé par code</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••"
              className="w-full h-16 rounded-2xl text-center text-2xl font-mono tracking-widest focus:outline-none bg-white/5 border border-stroke text-white placeholder:text-white/25 caret-cyan"
              autoFocus
            />
            {error && (
              <p className="text-sm mt-2 text-center font-medium text-redSoft">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || code.length === 0}
            className="active-pill w-full h-13 text-base font-semibold rounded-2xl transition-opacity disabled:opacity-40 min-h-[52px]"
          >
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>

        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-sm text-center text-muted transition-opacity active:opacity-60 min-h-[44px]"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
