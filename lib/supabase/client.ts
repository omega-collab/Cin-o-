import { createClient } from "@supabase/supabase-js";
import { createMockClient } from "./mockClient";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// When both env vars are missing we fall back to an in-memory mock client.
// This unlocks local UI development and end-to-end tests without a Supabase
// project. In production, both vars are present and the real client is used.
const useMock = !url || !key;

if (useMock && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Mode démo activé (env vars manquantes) — données en mémoire seulement, aucune persistance backend."
  );
}

export const supabase = useMock
  ? (createMockClient() as unknown as ReturnType<typeof createClient>)
  : createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

export type SupabaseClient = typeof supabase;
