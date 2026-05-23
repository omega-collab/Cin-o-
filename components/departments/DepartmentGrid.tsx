"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ICONS } from "@/lib/data/departmentIcons";
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
  // Subscribe to the actual Set so the UI reacts to unlock/lock changes.
  const unlockedDepartments = useAccessStore((s) => s.unlockedDepartments);

  return (
    <div className="min-h-screen px-4 pt-6 pb-10">
      <div className="grid grid-cols-2 gap-3">
        {DEPARTMENTS.map((dept) => {
          const unlocked = unlockedDepartments.has(dept.slug);
          return (
            <Link
              key={dept.slug}
              href={`/departments/${dept.slug}`}
              className="block active:opacity-70 transition-opacity"
            >
              <div className="glass-card relative flex flex-col items-center rounded-3xl p-4 min-h-[110px]">
                {/* Lock dot */}
                <span
                  className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: unlocked ? "#00E0D0" : "#4B5563" }}
                  aria-label={unlocked ? "Déverrouillé" : "Verrouillé"}
                />

                {/* Icon */}
                <div className="mt-1 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {(() => { const Icon = DEPT_ICONS[dept.slug as keyof typeof DEPT_ICONS]; return Icon ? <Icon className="w-5 h-5 text-cyan" aria-label={dept.name} /> : null; })()}
                </div>

                {/* Name */}
                <p className="text-base font-semibold mt-2 text-center leading-tight text-white">
                  {dept.name}
                </p>

                {/* Role subtitle */}
                <p className="text-xs text-muted text-center mt-0.5 leading-tight">
                  {DEPT_ROLES[dept.slug] ?? "Département"}
                </p>

                {/* Chevron */}
                <ChevronRight
                  size={14}
                  className="absolute bottom-3 right-3 text-muted opacity-50"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
