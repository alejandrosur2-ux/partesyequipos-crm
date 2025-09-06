// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // Cliente simple para consultas desde el server (RSC / rutas API)
  return createClient(url, key, { auth: { persistSession: false } });
}
