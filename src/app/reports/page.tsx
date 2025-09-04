// src/app/reports/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import Link from "next/link";

type SearchParams = {
  q?: string;
  status?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sb = createClient();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const status = (sp.status ?? "").trim();
  const from = (sp.from ?? "").trim();
  const to = (sp.to ?? "").trim();

  // Query base: solo no eliminadas
  let query = sb
    .from("machines")
    .select(
      "id,name,serial,status,daily_rate,notes,created_at,updated_at,deleted_at",
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (q) {
    query = query.or(`name.ilike.%${q}%,serial.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (from) {
    query = query.gte("created_at", new Date(from).toISOString());
  }
  if (to) {
    // incluir todo el día "to"
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  // Trae un bloque grande (ajústalo si necesitas más/menos)
  const { data: rows, count, error } = await query
    .order("created_at", { ascending: false })
    .range(0, 1999);

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-red-600 mt-4">Error: {error.message}</p>
      </main>
    );
  }

  const qs = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString();

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reportes — Máquinas</h1>
        <div className="flex gap-2">
          <Link className="underline" href="/machines">
            ← Volver a Máquinas
          </Link>
          <a
            href={`/api/export/machines${qs ? `?${qs}` : ""}`}
            className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm">Buscar</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nombre o serie"
            className="border p-2 rounded w-64"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm">Estado</label>
          <select name="status" defaultValue={status} className="border p-2 rounded">
            <option value="">Todos</option>
            <option value="activo">activo</option>
            <option value="taller">taller</option>
            <option value="rentada">rentada</option>
            <option value="baja">baja</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm">Desde (fecha creación)</label>
          <input type="date" name="from" defaultValue={from} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col">
          <label className="text-sm">Hasta (fecha creación)</label>
          <input type="date" name="to" defaultValue={to} className="border p-2 rounded" />
        </div>

        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Aplicar
        </button>
      </form>

      <div className="text-sm opacity-70">
        {count ?? 0} resultado(s) {count && count > 2000 ? "(mostrando primeros 2000)" : ""}
      </div>

      {/* Tabla “todo” */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">Nombre</th>
              <th className="p-2 border text-left">Serie</th>
              <th className="p-2 border text-left">Estado</th>
              <th className="p-2 border text-left">Tarifa diaria</th>
              <th className="p-2 border text-left">Notas</th>
              <th className="p-2 border text-left">Creada</th>
              <th className="p-2 border text-left">Actualizada</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-2 border">{r.name}</td>
                <td className="p-2 border">{r.serial ?? "-"}</td>
                <td className="p-2 border">{r.status}</td>
                <td className="p-2 border">{r.daily_rate ?? "-"}</td>
                <td className="p-2 border">{r.notes ?? "-"}</td>
                <td className="p-2 border">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                </td>
                <td className="p-2 border">
                  {r.updated_at ? new Date(r.updated_at).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
