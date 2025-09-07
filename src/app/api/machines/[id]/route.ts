import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

// Method override via form
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const form = await req.formData();
  const override = form.get("_method");
  if (override === "DELETE") return DELETE(req, ctx);
  if (override === "PATCH") return PATCH(req, ctx);
  return NextResponse.json({ ok: false, error: "Método no soportado" }, { status: 405 });
}

// Actualizar
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const form = await req.formData();

  const code = (form.get("code") || "").toString().trim();
  const name = (form.get("name") || "").toString().trim() || null;
  const brand = (form.get("brand") || "").toString().trim() || null;
  const model = (form.get("model") || "").toString().trim() || null;
  const serial = (form.get("serial") || "").toString().trim() || null;
  const location = (form.get("location") || "").toString().trim() || null;
  const status = (form.get("status") || "disponible").toString().trim();

  if (!code) {
    return NextResponse.json({ ok: false, error: "El código es obligatorio" }, { status: 400 });
  }

  const allowed = ["disponible", "en-reparacion", "rentada"]; // AJUSTA a tu enum real
  if (!allowed.includes(status)) {
    return NextResponse.json({ ok: false, error: `Estado inválido: ${status}` }, { status: 400 });
  }

  const { error } = await supabase
    .from("machines")
    .update({ code, name, brand, model, serial, location, status })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  revalidatePath("/machines");
  revalidatePath(`/machines/${params.id}`);
  return NextResponse.redirect(new URL(`/machines/${params.id}`, process.env.NEXT_PUBLIC_SITE_URL ?? "https://"+(process.env.VERCEL_URL || "localhost:3000")));
}

// Borrar
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { error } = await supabase.from("machines").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  revalidatePath("/machines");
  return NextResponse.redirect(new URL("/machines", process.env.NEXT_PUBLIC_SITE_URL ?? "https://"+(process.env.VERCEL_URL || "localhost:3000")));
}
