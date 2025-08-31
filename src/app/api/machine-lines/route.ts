import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

type Machine = { id: string; code: string } | null;
type Line = {
  date: string;
  source: string;
  description: string | null;
  debit: number | null;
  credit: number | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "EXC-001";
  const start = searchParams.get("start") ?? "2025-08-01";
  const end = searchParams.get("end") ?? "2025-08-31";

  try {
    const sb = supabaseServer();

    const { data: m, error: mErr } = await sb
      .from("machines")
      .select("id,code")
      .eq("code", code)
      .maybeSingle();

    if (mErr) throw mErr;
    const machine = (m ?? null) as Machine;
    if (!machine) {
      return NextResponse.json(
        { ok: false, step: "machine", error: "No existe máquina" },
        { status: 404 }
      );
    }

    const { data: rows, error: rErr } = await sb
      .from("v_machine_statement_lines_all")
      .select("date, source, description, debit, credit")
      .eq("machine_id", machine.id)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true });

    if (rErr) throw rErr;

    const safeRows: Line[] = (rows ?? []) as Line[];
    return NextResponse.json({ ok: true, machine, rows: safeRows });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
