import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "EXC-001";
  const start = searchParams.get("start") ?? "2025-08-01";
  const end   = searchParams.get("end")   ?? "2025-08-31";

  try {
    const sb = supabaseServer();

    const { data: machine, error: mErr } = await sb
      .from("machines").select("id,code").eq("code", code).maybeSingle();
    if (mErr) throw mErr;
    if (!machine) return NextResponse.json({ ok:false, step:"machine", error:"No existe máquina" }, { status: 404 });

    const { data: rows, error: rErr } = await sb
      .from("v_machine_statement_lines_all")
      .select("date, source, description, debit, credit")
      .eq("machine_id", machine.id)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true });
    if (rErr) throw rErr;

    return NextResponse.json({ ok: true, machine, rows: rows ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
