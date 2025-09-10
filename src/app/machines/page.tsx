// arriba: imports iguales

const PAGE_SIZE = 10;

async function safeFetchMachines({ q, status, page }: { q?: string; status?: string; page: number }) {
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('machines')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (q && q.trim()) {
      const like = `%${q}%`;
      query = query.or(`code.ilike.${like},brand.ilike.${like},model.ilike.${like}`);
    }
    if (status) query = query.eq('status', status);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Supabase error:', error.message);
      return { rows: [], count: 0, err: error.message };
    }
    return { rows: data ?? [], count: count ?? 0, err: null };
  } catch (e: any) {
    console.error('Unhandled fetch error:', e?.message || e);
    return { rows: [], count: 0, err: e?.message || 'unknown' };
  }
}

export default async function MachinesPage({ searchParams }: { searchParams: { q?: string; status?: string; page?: string } }) {
  const page = Number(searchParams.page ?? '1');
  const { rows, count, err } = await safeFetchMachines({ q: searchParams.q, status: searchParams.status, page });
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // ...el resto del componente igual, pero antes del listado:
  // muestra el error en UI en lugar de romper el render
  // Inserta esto antes del <div className="grid gap-3">
  // {err && <div className="card text-red-600 text-sm">Error cargando máquinas: {err}</div>}
}
