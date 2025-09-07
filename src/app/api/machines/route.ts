import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const form = await req.formData();

  const code = (form.get("code") || "").toString().trim();
  const name = (form.get("name") || "").toString().trim() || null;
  const brand = (form.get("brand") || "").toString().trim() || null;
  const model = (form.get("model") || "").toString().trim() || null;
  const serial = (form.get("serial") || "").toString().trim() || null;
  const location = (form.get("location") || "").toString().trim() || null;
  const status = (form.get("status") || "disponible").toString().trim();

  const allowed = ["disponible", "en-reparacion", "rentada"]; // AJUSTA a tu enum real
  if (!code) return NextResponse.json({ ok: false, error: "El código es obligatorio" }, { status: 400 });
  if (!allowed.includes(status)) return NextResponse.json({ ok: false, error: `Estado inválido: ${status}` }, { status: 400 });

  const { error } = await supabase.from("machines").insert({ code, name, brand, model, serial, location, status });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  revalidatePath("/machines");
  return NextResponse.redirect(new URL("/machines", req.url));
}
