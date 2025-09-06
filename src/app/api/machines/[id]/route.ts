// src/app/api/machines/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("machines")
    .select("id, name, brand, model, serial, status_enum")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, brand, model, serial, status } = await req.json();

    // Validación simple de estado
    const allowed = ["disponible", "rentada", "en_reparacion"] as const;
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const updates = {
      name: name ?? null,
      brand: brand ?? null,
      model: model ?? null,
      serial: serial ?? null,
      status_enum: status, // 👈 guarda en la columna ENUM
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("machines")
      .update(updates)
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
