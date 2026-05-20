// Stub: replace with Supabase Auth in production

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function verifyDepartmentCode(
  _departmentSlug: string,
  code: string
): Promise<AuthResult> {
  const validCode = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "0000";
  await new Promise((r) => setTimeout(r, 200)); // simulate latency
  if (code === validCode) {
    return { success: true };
  }
  return { success: false, error: "Code incorrect" };
}
