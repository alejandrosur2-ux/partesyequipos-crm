// src/app/api/machines/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-only";

function normalizeStatus(input: any) {
  const raw = String(input ?? "").toLowerCase().trim();
  if (["en_reparacion", "en reparacion", "en-reparacion", "en reparación"].includes(raw)) {
    return "en reparación";
  }
  if (["rentada", "alquilada"].includes(raw)) {
    return "rentada";
  }
  return "disponible";
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const body = await req.json();

    const payload: Record<string, any> = {};
    if (body.name !== undefined) payload.name = String(body.name).trim();
    if (body.brand !== undefined) payload.brand = body.brand ? String(body.brand).trim() : null;
    if (body.model !== undefined) payload.model = body.model ? String(body.model).trim() : null;
    if (body.serial !== undefined) payload.serial = body.serial ? String(body.serial).trim() : null;
    if (body.status !== undefined) payload.status = normalizeStatus(body.status);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("machines")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, machine: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error inesperado" }, { status: 500 });
  }
}
