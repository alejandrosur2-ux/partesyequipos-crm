// src/lib/supabase/server.ts
import "server-only"; // <- impide que lo importen desde client/pages
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies(); // Next 15: Promise
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => (await cookieStore).get(name)?.value,
        set: async (name: string, value: string, options: CookieOptions) => {
          (await cookieStore).set({ name, value, ...options });
        },
        remove: async (name: string, options: CookieOptions) => {
          (await cookieStore).set({ name, value: "", ...options });
        },
      },
    }
  );
}
