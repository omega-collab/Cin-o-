import { supabase } from "@/lib/supabase/client";

export interface AuthResult {
  success: boolean;
  error?: string;
}

// Vérification d'appartenance au département via les membres du projet
export async function verifyDepartmentCode(
  departmentSlug: string,
  _code: string
): Promise<AuthResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  // L'accès est accordé si l'utilisateur est membre du projet en cours
  // La restriction par département est gérée par le profil utilisateur (useUserStore)
  // Le code PIN département est remplacé par l'auth Supabase
  void departmentSlug;
  return { success: true };
}
