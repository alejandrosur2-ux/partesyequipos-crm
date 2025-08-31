import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

export async function GET() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from("machines").select("id,code").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, sample: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
