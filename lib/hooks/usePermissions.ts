"use client";

import { useShootStore } from "@/lib/store/useShootStore";
import { useUserStore } from "@/lib/store/useUserStore";
import type { RestrictableInfo, VisibilityLevel } from "@/lib/types/shoot";
import type { DepartmentSlug } from "@/lib/types";

// canSee(info) returns true unless restrictions are enabled AND the admin
// has explicitly restricted this info AND the current user's department
// doesn't match. Default behaviour (no restrictions) = everyone sees
// everything, same as before this feature existed.
export function usePermissions() {
  const customization = useShootStore((s) => s.shoot.customization);
  const department = useUserStore((s) => s.department) as DepartmentSlug | null;

  function canSee(info: RestrictableInfo, infoDept?: DepartmentSlug): boolean {
    // Master switch off → everyone sees everything (default behaviour)
    if (!customization?.restrictionsEnabled) return true;

    const level: VisibilityLevel = customization.permissions[info] ?? "everyone";

    if (level === "everyone") return true;
    if (level === "production") return department === "production";
    if (level === "department") {
      if (department === "production") return true; // admin always sees all
      if (!infoDept) return true; // no dept tag = unrestricted at this level
      return department === infoDept;
    }
    return true;
  }

  return { canSee };
}
