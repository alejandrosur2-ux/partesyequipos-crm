// src/lib/supabase/server-only.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // Cliente de servidor sin cookies (perfecto para API Routes / server components)
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "server" } },
  });
}
