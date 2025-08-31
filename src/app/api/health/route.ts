import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

type MachineRow = { id: string; code: string } | null;

export async function GET() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from("machines")
      .select("id,code")
      .limit(1);

    if (error) throw error;
    const sample: MachineRow[] = (data ?? []) as MachineRow[];
    return NextResponse.json({ ok: true, sample });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
