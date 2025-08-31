import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return NextResponse.json({
    ok: Boolean(url && key),
    url_present: Boolean(url),
    key_present: Boolean(key),
  });
}
