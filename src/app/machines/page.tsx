const PAGE_SIZE = 10

async function safeFetch({ q, status, page }: { q?: string; status?: string; page: number }) {
  try {
    // Validar envs en runtime (producción)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return { rows: [], count: 0, err: 'Faltan variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.' }
    }

    const supabase = createSupabaseServerClient()
    let query = supabase
      .from('machines')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (q && q.trim()) {
      const like = `%${q}%`
      query = query.or(`code.ilike.${like},brand.ilike.${like},model.ilike.${like}`)
    }
    if (status) query = query.eq('status', status)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Supabase error:', error.message)
      return { rows: [], count: 0, err: error.message }
    }
    return { rows: data ?? [], count: count ?? 0, err: null }
  } catch (e: any) {
    console.error('safeFetch crash:', e?.message || e)
    return { rows: [], count: 0, err: e?.message || 'Error desconocido en safeFetch' }
  }
}
