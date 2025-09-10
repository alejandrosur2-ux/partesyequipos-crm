import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Alias para compatibilidad con imports existentes:
 *   import { supabaseServer } from '@/lib/supabase/server'
 * Uso: const supabase = supabaseServer()
 */
export function supabaseServer() {
  return createSupabaseServerClient()
}
