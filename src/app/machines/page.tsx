import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteMachine } from "./actions";

type Machine = {
  id: string;
  name: string | null;
  serial: string | null;
  brand: string | null;
  model: string | null;
  status: string | null;
  location: string | null;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MachinesPage() {
  const sb = supabaseServer();
  const { data: machines, error } = await sb.from("machines").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Máquinas</h1>
        <p className="text-red-600 mt-4">Error al cargar máquinas: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Máquinas</h1>
        <Link
          href="/machines/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nueva
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200/60 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Serie</th>
              <th className="p-3">Marca</th>
              <th className="p-3">Modelo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Ubicación</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-zinc-200">
            {machines && machines.length > 0 ? (
              machines.map((m: Machine) => (
                <tr key={m.id} className="hover:bg-zinc-50">
                  <td className="p-3">{m.name ?? "—"}</td>
                  <td className="p-3">{m.serial ?? "—"}</td>
                  <td className="p-3">{m.brand ?? "—"}</td>
                  <td className="p-3">{m.model ?? "—"}</td>
                  <td className="p-3">{m.status ?? "—"}</td>
                  <td className="p-3">{m.location ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/machines/${m.id}`}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
                      >
                        Ver
                      </Link>
                      <form action={deleteMachine}>
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-zinc-500">
                  No hay máquinas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
