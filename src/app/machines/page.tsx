import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import { deleteMachine as deleteMachineAction } from './actions'

const PAGE_SIZE = 10

async function safeFetch({ q, status, page }: { q?: string; status?: string; page: number }) {
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
  if (error) return { rows: [], count: 0, err: error.message }
  return { rows: data ?? [], count: count ?? 0, err: null }
}

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const page = Number(searchParams.page ?? '1')
  const { rows, count, err } = await safeFetch({
    q: searchParams.q,
    status: searchParams.status,
    page,
  })
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  async function remove(id: string) {
    'use server'
    await deleteMachineAction(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Máquinas</h1>
        <Link href="/machines/new" className="btn-primary">
          Nueva máquina
        </Link>
      </div>

      <form className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Buscar (código, marca, modelo)…"
          className="input"
        />
        <select name="status" defaultValue={searchParams.status ?? ''} className="input">
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="rentada">Rentada</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="inactiva">Inactiva</option>
        </select>
        <button className="btn-primary">Filtrar</button>
      </form>

      {err && <div className="card text-red-600 text-sm">Error cargando máquinas: {err}</div>}

      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                {row.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.image_url}
                    alt={row.code}
                    className="h-20 w-28 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="h-20 w-28 rounded-lg border grid place-content-center text-xs text-neutral-500">
                    Sin imagen
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/machines/${row.id}`} className="font-semibold hover:underline">
                      {row.code}
                    </Link>
                    <StatusBadge value={row.status} />
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {row.brand} {row.model} • {row.year ?? '—'}
                  </div>
                  <div className="text-sm">
                    Q {Number(row.daily_rate ?? 0).toFixed(2)} / día • Q{' '}
                    {Number(row.hourly_rate ?? 0).toFixed(2)} / hora
                  </div>
                  <div className="text-xs text-neutral-500">Ubicación: {row.location ?? '—'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/machines/${row.id}`} className="btn-primary">
                  Editar
                </Link>
                <form action={remove.bind(null, row.id)}>
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      if (!confirm('¿Eliminar máquina?')) e.preventDefault()
                    }}
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-center text-neutral-500">No hay resultados.</div>}
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1
          const sp = new URLSearchParams({ ...searchParams, page: String(p) } as any).toString()
          const active = p === page
          return (
            <Link
              key={p}
              href={`/machines?${sp}`}
              className={`px-3 py-1 rounded-lg border ${
                active ? 'bg-black text-white' : 'bg-white dark:bg-neutral-900'
              }`}
            >
              {p}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
