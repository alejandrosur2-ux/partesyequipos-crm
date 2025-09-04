// src/app/api/export/machines/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-only";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim();
  const from = (searchParams.get("from") ?? "").trim();
  const to = (searchParams.get("to") ?? "").trim();

  const sb = createClient();

  let query = sb
    .from("machines")
    .select(
      "id,name,serial,status,daily_rate,notes,created_at,updated_at,deleted_at",
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (q) query = query.or(`name.ilike.%${q}%,serial.ilike.%${q}%`);
  if (status) query = query.eq("status", status);
  if (from) query = query.gte("created_at", new Date(from).toISOString());
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  // Exporta hasta 10k filas (ajusta si necesitas más)
  const { data, error } = await query.order("created_at", { ascending: false }).range(0, 9999);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const header = [
    "id",
    "name",
    "serial",
    "status",
    "daily_rate",
    "notes",
    "created_at",
    "updated_at",
  ];

  const csv = [
    header.join(","), // encabezados
    ...rows.map((r) =>
      [
        r.id,
        csvSafe(r.name),
        csvSafe(r.serial),
        r.status,
        r.daily_rate ?? "",
        csvSafe(r.notes),
        r.created_at ?? "",
        r.updated_at ?? "",
      ].join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="machines_export.csv"`,
    },
  });
}

function csvSafe(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Escapar comillas y envolver en comillas si hay coma/salto de línea
  const needsQuotes = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
