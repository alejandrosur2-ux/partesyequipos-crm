// src/lib/supabase/server.ts
// Adaptador para mantener compatibilidad con import { supabaseServer } from "@/lib/supabase/server"

import { createClient } from "./server-only";

// Si tu helper original se llama distinto, ajusta aquí:
export function supabaseServer() {
  return createClient();
}
