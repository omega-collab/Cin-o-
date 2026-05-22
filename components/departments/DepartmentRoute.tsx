"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DepartmentSlug } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ICONS } from "@/lib/data/departmentIcons";
import { useAccessStore } from "@/lib/store/useAccessStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { verifyDepartmentCode } from "@/lib/services/auth.service";
import { DepartmentDetail } from "./DepartmentDetail";

interface DepartmentRouteProps {
  slug: DepartmentSlug;
}

export function DepartmentRoute({ slug }: DepartmentRouteProps) {
  const dept = DEPARTMENTS.find((d) => d.slug === slug);
  const isUnlocked = useAccessStore((s) => s.isUnlocked(slug));
  const unlock = useAccessStore((s) => s.unlock);
  const codesEnabled = useShootStore((s) => s.shoot.codesEnabled);
  const hasDeptCode = useShootStore((s) => !!(s.shoot.deptCodes?.[slug]));
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!dept) router.push("/departments");
  }, [dept, router]);

  // Auto-unlock when codes are disabled or this dept has no code configured
  useEffect(() => {
    if (!isUnlocked && (!codesEnabled || !hasDeptCode)) {
      unlock(slug);
    }
  }, [codesEnabled, hasDeptCode, isUnlocked, unlock, slug]);

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
          <div
            className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mb-4"
            aria-label={dept.name}
          >
            {(() => { const Icon = DEPT_ICONS[dept.slug as keyof typeof DEPT_ICONS]; return Icon ? <Icon className="w-8 h-8 text-cyan" /> : null; })()}
          </div>
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
              <p className="text-sm mt-2 text-center font-medium text-danger">{error}</p>
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
