// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

/**
 * Cliente de Supabase para uso en el servidor.
 * (Sin dependencias de @supabase/ssr para evitar errores de build)
 */
export function supabaseServer() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    throw new Error("Faltan variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  client = createClient(url, anon, {
    global: {
      headers: { "X-Client-Info": "partesyequipos-crm" },
    },
  });

  return client;
}
