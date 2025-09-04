// src/app/machines/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

type SearchParams = { q?: string; page?: string; status?: string };

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sb = createClient();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const status = (sp.status ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // ----- Server Action: eliminar desde la lista -----
  async function deleteAction(formData: FormData) {
    "use server";
    const sb = createClient();
    const id = String(formData.get("id"));
    const { error } = await sb.from("machines").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/machines");
  }

  // Build query con filtros
  let query = sb
    .from("machines")
    .select("id,name,serial,status,daily_rate,created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (q) {
    // busca por nombre o serie
    query = query.or(
      `name.ilike.%${q}%,serial.ilike.%${q}%`
    );
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data: machines, count, error } = await query.range(from, to);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Máquinas</h1>
        <p className="text-red-500">Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Máquinas</h1>
        <Link
          href="/machines/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Nueva máquina
        </Link>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap items-end gap-2">
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

        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Aplicar
        </button>
      </form>

      {/* Tabla */}
      {machines && machines.length > 0 ? (
        <>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Nombre</th>
                <th className="p-2 border text-left">Serie</th>
                <th className="p-2 border text-left">Estado</th>
                <th className="p-2 border text-left">Tarifa diaria</th>
                <th className="p-2 border text-left">Creada</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{m.name}</td>
                  <td className="p-2 border">{m.serial || "-"}</td>
                  <td className="p-2 border">{m.status}</td>
                  <td className="p-2 border">{m.daily_rate ?? "-"}</td>
                  <td className="p-2 border">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">
                    <div className="flex items-center gap-3 justify-center">
                      <Link
                        href={`/machines/${m.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </Link>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <DeleteButton />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <Pagination
            page={page}
            totalPages={totalPages}
            q={q}
            status={status}
          />
        </>
      ) : (
        <p>No hay máquinas con esos filtros.</p>
      )}
    </main>
  );
}

// --- Componentes auxiliares ---
function Pagination({
  page,
  totalPages,
  q,
  status,
}: {
  page: number;
  totalPages: number;
  q: string;
  status: string;
}) {
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const qs = (p: number) =>
    `/machines?${new URLSearchParams({
      page: String(p),
      ...(q ? { q } : {}),
      ...(status ? { status } : {}),
    }).toString()}`;

  return (
    <div className="flex items-center justify-between mt-3">
      <Link
        className={`px-3 py-2 border rounded ${page <= 1 ? "opacity-50 pointer-events-none" : ""}`}
        href={qs(prev)}
      >
        ← Anterior
      </Link>

      <span className="text-sm">
        Página {page} de {totalPages}
      </span>

      <Link
        className={`px-3 py-2 border rounded ${page >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
        href={qs(next)}
      >
        Siguiente →
      </Link>
    </div>
  );
}
