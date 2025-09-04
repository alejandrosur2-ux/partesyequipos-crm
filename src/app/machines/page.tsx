import { createClient } from "@/lib/supabase/server-only";

import Link from "next/link";

type Props = {
  searchParams?: { q?: string; status?: string; page?: string };
};

export default async function Page({ searchParams }: Props) {
  const supabase = createClient();

  const q = (searchParams?.q || "").trim();
  const status = (searchParams?.status || "").trim();
  const page = Number(searchParams?.page || 1);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("machines")
    .select("id,name,serial,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    // busca en nombre o serie
    query = query.or(`name.ilike.%${q}%,serial.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) return <p>Error: {error.message}</p>;

  const total = count || 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-xl font-semibold">Mis máquinas</h1>

      {/* Filtros GET */}
      <form className="flex gap-2">
        <input
          name="q"
          placeholder="Buscar (nombre o serie)"
          defaultValue={q}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          name="status"
          defaultValue={status}
          className="border px-3 py-2 rounded"
        >
          <option value="">Todos</option>
          <option value="activo">activo</option>
          <option value="taller">taller</option>
          <option value="rentada">rentada</option>
          <option value="baja">baja</option>
        </select>
        <button className="border px-4 py-2 rounded" type="submit">
          Filtrar
        </button>
      </form>

      {/* Lista */}
      <ul className="space-y-2">
        {data?.map((m) => (
          <li key={m.id} className="border p-3 rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-sm opacity-70">Serie: {m.serial || "—"} · {m.status}</div>
            </div>
            <Link href={`/machines/${m.id}`} className="underline">Editar</Link>
          </li>
        ))}
        {!data?.length && <li>No hay resultados</li>}
      </ul>

      {/* Paginación */}
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-70">Página {page} de {lastPage}</span>
        <div className="ml-auto flex gap-2">
          <Link
            href={{ pathname: "/machines", query: { q, status, page: Math.max(1, page - 1) } }}
            className="border px-3 py-1 rounded pointer-events-auto"
          >
            ← Anterior
          </Link>
          <Link
            href={{ pathname: "/machines", query: { q, status, page: Math.min(lastPage, page + 1) } }}
            className="border px-3 py-1 rounded"
          >
            Siguiente →
          </Link>
        </div>
      </div>
    </main>
  );
}
