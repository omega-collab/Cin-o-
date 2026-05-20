"use client";

import Link from "next/link";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useAccessStore } from "@/lib/store/useAccessStore";

const DEPT_ROLES: Record<string, string> = {
  camera: "Chef opérateur",
  electro: "Chef électricien",
  machino: "Chef machiniste",
  son: "Chef son",
  regie: "Premier assistant",
  deco: "Chef décorateur",
  hmc: "Chef maquilleur",
  production: "Directeur de prod.",
  cantine: "Responsable cantine",
};

export function DepartmentGrid() {
  const isUnlocked = useAccessStore((s) => s.isUnlocked);

  return (
    <div
      className="min-h-screen px-4 pt-6 pb-10"
      style={{ backgroundColor: "#0B0C14" }}
    >
      <h2
        className="font-bold mb-4"
        style={{ color: "#FFFFFF", fontSize: "24px", lineHeight: "32px" }}
      >
        Départements
      </h2>
      <div
        className="grid grid-cols-2 gap-3"
      >
        {DEPARTMENTS.map((dept) => {
          const unlocked = isUnlocked(dept.slug);
          return (
            <Link
              key={dept.slug}
              href={`/departments/${dept.slug}`}
              className="block"
              style={{ minHeight: "100px" }}
            >
              <div
                className="relative flex flex-col items-center justify-center gap-2 px-3 py-4 h-full transition-opacity active:opacity-70"
                style={{
                  backgroundColor: "#13141F",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px",
                  minHeight: "100px",
                }}
              >
                {/* Lock / unlock dot */}
                <span
                  className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: unlocked ? "#00D4B4" : "#4B5563",
                  }}
                  aria-label={unlocked ? "Déverrouillé" : "Verrouillé"}
                />

                {/* Icon */}
                <span className="text-4xl leading-none select-none" role="img" aria-label={dept.name}>
                  {dept.icon}
                </span>

                {/* Name */}
                <p
                  className="font-semibold text-sm text-center leading-tight"
                  style={{ color: "#FFFFFF" }}
                >
                  {dept.name}
                </p>

                {/* Role subtitle */}
                <p
                  className="text-xs text-center leading-tight"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {DEPT_ROLES[dept.slug] ?? "Chef de poste"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
