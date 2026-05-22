import { supabase } from "@/lib/supabase/client";
import { useShootStore } from "@/lib/store/useShootStore";
import type { DepartmentSlug } from "@/lib/types";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function verifyDepartmentCode(
  departmentSlug: string,
  code: string
): Promise<AuthResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { codesEnabled, deptCodes } = useShootStore.getState().shoot;
  if (!codesEnabled) return { success: true };

  const expected = deptCodes[departmentSlug as DepartmentSlug];
  if (!expected) return { success: true };

  if (code === expected) return { success: true };
  return { success: false, error: "Code incorrect" };
}
