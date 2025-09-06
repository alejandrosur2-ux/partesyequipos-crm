// src/lib/supabase/server-only.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}

// Alias por si en algún lugar lo llaman así
export const supabaseServer = createClient;
