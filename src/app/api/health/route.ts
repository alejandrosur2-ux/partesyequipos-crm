import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb.from("machines").select("id,code").limit(1);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, sample: data ?? [] });
}
