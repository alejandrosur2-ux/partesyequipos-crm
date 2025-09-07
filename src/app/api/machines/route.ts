// src/app/api/machines/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-only";

function normalizeStatus(input: any) {
  const raw = String(input ?? "").toLowerCase().trim();
  // Acepta variantes y mapea al enum real
  if (["en_reparacion", "en reparacion", "en-reparacion", "en reparación"].includes(raw)) {
    return "en reparación";
  }
  if (["rentada", "alquilada"].includes(raw)) {
    return "rentada";
  }
  // fallback
  return "disponible";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const brand = body?.brand ? String(body.brand).trim() : null;
    const model = body?.model ? String(body.model).trim() : null;
    const serial = body?.serial ? String(body.serial).trim() : null;
    const status = normalizeStatus(body?.status);

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const code = `MAQ-${Date.now().toString().slice(-6)}`;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("machines")
      .insert([{ code, name, brand, model, serial, status }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, machine: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error inesperado" }, { status: 500 });
  }
}
