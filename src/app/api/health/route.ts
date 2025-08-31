import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

export async function GET() {
  try {
    // Comprobar que las ENV existen en runtime
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    if (!url || !key) {
      return NextResponse.json(
        {
          ok: false,
          reason: "missing_env",
          url_present: Boolean(url),
          key_present: Boolean(key),
          note: "Faltan variables en Vercel (Production).",
        },
        { status: 500 }
      );
    }

    const sb = supabaseServer();

    const { data, error } = await sb
      .from("machines")
      .select("id, code")
      .limit(1);

    if (error) {
      // Desglosar lo más posible el error de Supabase
      const safeError = {
        message: (error as any)?.message ?? String(error),
        code: (error as any)?.code ?? null,
        details: (error as any)?.details ?? null,
        hint: (error as any)?.hint ?? null,
        name: (error as any)?.name ?? null,
        raw: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      };
      return NextResponse.json({ ok: false, reason: "supabase_error", error: safeError }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      url_present: true,
      key_present: true,
      sample: data ?? [],
    });
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "message" in e
        ? (e as { message: string }).message
        : String(e);
    const raw = JSON.stringify(e, Object.getOwnPropertyNames(e ?? {}));
    return NextResponse.json({ ok: false, reason: "unknown", error: msg, raw }, { status: 500 });
  }
}
