// src/app/api/export/machines/route.ts
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("machines")
    .select("id,name,serial,status,daily_rate,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data ?? []), {
    headers: { "content-type": "application/json" },
  });
}
