import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  res.status(200).json({
    ok: Boolean(url && key),
    url_present: Boolean(url),
    key_present: Boolean(key),
    marker: "env-check-pages-router"
  });
}
