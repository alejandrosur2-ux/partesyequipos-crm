import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

// method override desde form
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const form = await req.formData();
  const override = form.get("_method");
  if (override === "DELETE") {
    return DELETE(req, { params });
  }
  return NextResponse.json({ ok: false, error: "Método no soportado" }, { status: 405 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseServer();

  const { error } = await supabase.from("machines").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  // revalidar lista y detalle
  revalidatePath("/machines");
  revalidatePath(`/machines/${params.id}`);

  // redirigir de vuelta a /machines
  return NextResponse.redirect(new URL("/machines", process.env.NEXT_PUBLIC_SITE_URL ?? "https://"+(process.env.VERCEL_URL || "localhost:3000")));
}
