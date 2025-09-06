import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name   = formData.get("name") as string;
    const brand  = formData.get("brand") as string;
    const model  = formData.get("model") as string;
    const serial = formData.get("serial") as string;
    const status = formData.get("status") as string; // 👈 del select

    const supabase = supabaseServer();
    const { error } = await supabase.from("machines").insert([
      {
        name,
        brand,
        model,
        serial,
        status_enum: status, // 👈 mapeo al ENUM real
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
