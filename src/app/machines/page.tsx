// src/app/machines/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import Banner from "@/components/Banner";

type SearchParams = {
  q?: string;
  page?: string;
  status?: string;
  msg?: string;
  sort?: string;
  dir?: "asc" | "desc";
};

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sb = createClient();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const status = (sp.status ?? "").trim();
  const msg = (sp.msg ?? "").trim();

  // --- Ordenamiento ---
  // columnas permitidas para ordenar
  const sortable = new Set(["name", "serial", "status", "daily_rate", "created_at"]);
  const sort = sortable.has(String(sp.sort)) ? String(sp.sort) : "created_at";
  const dir = sp.dir === "asc" ? "asc" : "desc"; // default desc (más reciente primero)
  const ascending = dir === "asc";

  // --- Paginación ---
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // ----- Server Action: Soft delete -----
  async function deleteAction(formData: FormData) {
    "use server";
    const sb = createClient();
    const id = String(formData.get("id"));

    const { error } = await sb
      .from("machines")
      .update({ deleted_at: new Date().toISOString() }) // SOFT DELETE
      .eq("id", id);

    if (error) throw new Error(error.message);
    redirect("/machines?msg=eliminada");
  }

  // ---- Query con filtros + soft delete + orden ----
  let query = sb
    .from("machines")
    .select("id,name,serial,status,daily_rate,created_at,deleted_at", {
      count: "exact",
    })
    .is("deleted_at", null) // SOLO no eliminadas
    .order(sort, { ascending });

  if (q) {
    query = query.or(`name.ilike.%${q}%,serial.ilike.%${q}%`);
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
      {msg && <Banner type="ok">Máquina {msg} correctamente.</Banner>}

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

        {/* preserva sort/dir al aplicar filtros */}
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />

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
                <ThSort
                  label="Nombre"
                  col="name"
                  activeCol={sort}
                  dir={dir}
                  q={q}
                  status={status}
                />
                <ThSort
                  label="Serie"
                  col="serial"
                  activeCol={sort}
                  dir={dir}
                  q={q}
                  status={status}
                />
                <ThSort
                  label="Estado"
                  col="status"
                  activeCol={sort}
                  dir={dir}
                  q={q}
                  status={status}
                />
                <ThSort
                  label="Tarifa diaria"
                  col="daily_rate"
                  activeCol={sort}
                  dir={dir}
                  q={q}
                  status={status}
                />
                <ThSort
                  label="Creada"
                  col="created_at"
                  activeCol={sort}
                  dir={dir}
                  q={q}
                  status={status}
                />
                <th className="p-2 border text-center">Acciones</th>
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

          <Pagination
            page={page}
            totalPages={totalPages}
            q={q}
            status={status}
            sort={sort}
            dir={dir}
          />
        </>
      ) : (
        <p>No hay máquinas con esos filtros.</p>
      )}
    </main>
  );
}

/* ---------- Helpers UI ---------- */

function ThSort({
  label,
  col,
  activeCol,
  dir,
  q,
  status,
}: {
  label: string;
  col: string;
  activeCol: string;
  dir: "asc" | "desc";
  q: string;
  status: string;
}) {
  // si ya está activa, alterna la dirección; si no, empieza asc
  const nextDir: "asc" | "desc" =
    activeCol === col ? (dir === "asc" ? "desc" : "asc") : "asc";

  const href = `/machines?${new URLSearchParams({
    page: "1",
    sort: col,
    dir: nextDir,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
  }).toString()}`;

  const marker =
    activeCol === col ? (dir === "asc" ? " ↑" : " ↓") : "";

  return (
    <th className="p-2 border text-left">
      <Link href={href} className="hover:underline">
        {label}
        <span className="opacity-60">{marker}</span>
      </Link>
    </th>
  );
}

function Pagination({
  page,
  totalPages,
  q,
  status,
  sort,
  dir,
}: {
  page: number;
  totalPages: number;
  q: string;
  status: string;
  sort: string;
  dir: "asc" | "desc";
}) {
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const qs = (p: number) =>
    `/machines?${new URLSearchParams({
      page: String(p),
      sort,
      dir,
      ...(q ? { q } : {}),
      ...(status ? { status } : {}),
    }).toString()}`;

  return (
    <div className="flex items-center justify-between mt-3">
      <Link
        className={`px-3 py-2 border rounded ${
          page <= 1 ? "opacity-50 pointer-events-none" : ""
        }`}
        href={qs(prev)}
      >
        ← Anterior
      </Link>

      <span className="text-sm">
        Página {page} de {totalPages}
      </span>

      <Link
        className={`px-3 py-2 border rounded ${
          page >= totalPages ? "opacity-50 pointer-events-none" : ""
        }`}
        href={qs(next)}
      >
        Siguiente →
      </Link>
    </div>
  );
}
