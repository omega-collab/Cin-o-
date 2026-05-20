"use client";

import { useState } from "react";
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
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ backgroundColor: "#0B0C14" }}
    >
      {/* Central card */}
      <div
        className="w-full max-w-sm px-6 py-8"
        style={{
          backgroundColor: "#13141F",
          borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Icon + name */}
        <div className="flex flex-col items-center mb-7">
          <span
            className="text-6xl leading-none select-none mb-4"
            role="img"
            aria-label={dept.name}
          >
            {dept.icon}
          </span>
          <h2
            className="text-xl font-bold text-center"
            style={{ color: "#FFFFFF" }}
          >
            {dept.name}
          </h2>
          <p
            className="text-sm mt-1 text-center"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Accès protégé par code
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          {/* Code input */}
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••"
              className="w-full text-center font-mono focus:outline-none transition-all"
              style={{
                backgroundColor: "#1C1D2B",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                fontSize: "2em",
                letterSpacing: "0.5em",
                minHeight: "64px",
                caretColor: "#00D4B4",
              }}
              autoFocus
            />
            {error && (
              <p
                className="text-sm mt-2 text-center font-medium"
                style={{ color: "#EF4444" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || code.length === 0}
            className="w-full font-semibold text-base rounded-xl transition-opacity disabled:opacity-40"
            style={{
              backgroundColor: "#00D4B4",
              color: "#0B0C14",
              minHeight: "52px",
            }}
          >
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-sm text-center transition-opacity active:opacity-60"
          style={{ color: "rgba(255,255,255,0.35)", minHeight: "44px" }}
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
