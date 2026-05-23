import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Tolerate missing env vars at build / prerender time (Next.js will require
// this module while generating static pages). Use placeholders so the client
// can be constructed without throwing; any real call will fail with a
// network error and the UI shows the syncError banner. A warning is logged
// in development so the misconfiguration is still visible.
const safeUrl = url ?? "https://invalid.supabase.co";
const safeKey = key ?? "invalid-anon-key";

if ((!url || !key) && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Variables d'environnement manquantes — définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type SupabaseClient = typeof supabase;
