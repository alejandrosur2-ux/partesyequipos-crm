// src/app/api/machines/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-only";

/** POST /api/machines  -> crea una máquina */
export async function POST(req: Request) {
  try {
    const { name, brand, model, serial, status } = await req.json();

    // Validaciones básicas
    const s = (status ?? "disponible") as "disponible" | "rentada" | "en_reparacion";
    if (!["disponible", "rentada", "en_reparacion"].includes(s)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    if (!name || String(name).trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    // Generar código (la tabla antes daba error de NOT NULL en code)
    const code = `MAQ-${Date.now().toString().slice(-6)}`;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("machines")
      .insert([
        {
          code,                 // evita "null value in column code"
          name: name?.trim(),
          brand: brand?.trim() || null,
          model: model?.trim() || null,
          serial: serial?.trim() || null,
          status: s,            // respeta el CHECK machines_status_chk
        },
      ])
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
