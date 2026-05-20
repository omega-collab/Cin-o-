"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DepartmentSlug } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useAccessStore } from "@/lib/store/useAccessStore";
import { verifyDepartmentCode } from "@/lib/services/auth.service";
import { DepartmentDetail } from "./DepartmentDetail";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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

  if (!dept) {
    router.push("/departments");
    return null;
  }

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
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">{dept.icon}</span>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{dept.name}</h2>
          <p className="text-slate-500 text-sm mt-1">Accès protégé par code</p>
        </div>
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code département"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1.5 text-center">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading || code.length === 0}>
            {loading ? "Vérification…" : "Accéder"}
          </Button>
        </form>
        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600 transition-colors text-center"
        >
          ← Retour
        </button>
      </Card>
    </div>
  );
}
