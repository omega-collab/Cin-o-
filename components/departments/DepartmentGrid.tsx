"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useAccessStore } from "@/lib/store/useAccessStore";

type Role = "Chef de poste" | "1er AC" | "2e AC" | "3e AC";

const ROLES: Role[] = ["Chef de poste", "1er AC", "2e AC", "3e AC"];

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
  const [activeRole, setActiveRole] = useState<Role>("Chef de poste");
  const isUnlocked = useAccessStore((s) => s.isUnlocked);

  return (
    <div className="min-h-screen px-4 pt-6 pb-10">
      {/* Role selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={
              activeRole === role
                ? "active-pill shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                : "glass-card shrink-0 px-4 py-2 rounded-full text-sm font-medium text-textSoft border-stroke transition-all"
            }
          >
            {role}
          </button>
        ))}
      </div>

      {/* Department grid */}
      <div className="grid grid-cols-2 gap-3">
        {DEPARTMENTS.map((dept) => {
          const unlocked = isUnlocked(dept.slug);
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
                <span
                  className="text-3xl leading-none select-none mt-1"
                  role="img"
                  aria-label={dept.name}
                >
                  {dept.icon}
                </span>

                {/* Name */}
                <p className="text-base font-semibold mt-2 text-center leading-tight text-white">
                  {dept.name}
                </p>

                {/* Role subtitle */}
                <p className="text-xs text-muted text-center mt-0.5 leading-tight">
                  {DEPT_ROLES[dept.slug] ?? activeRole}
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
