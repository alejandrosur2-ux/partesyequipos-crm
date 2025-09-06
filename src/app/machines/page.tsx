// src/app/machines/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteMachine } from "./actions";

type Machine = {
  id: string;
  code: string;
  name: string | null;
  serial: string | null;
  brand: string | null;
  model: string | null;
  status: string | null;
  location: string | null;
};

export const revalidate = 0;

export default async function MachinesPage() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("machines")
    .select("id, code, name, serial, brand, model, status, location")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Máquinas</h1>
        <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3">
          Error al cargar máquinas: {error.message}
        </div>
      </div>
    );
  }

  const machines = (data || []) as Machine[];

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Máquinas</h1>
        <Link
          href="/machines/new"
          className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Nueva máquina
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Serie</th>
              <th className="text-left p-3">Marca</th>
              <th className="text-left p-3">Modelo</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Ubicación</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="p-3 font-medium">{m.code}</td>
                <td className="p-3">{m.name ?? "—"}</td>
                <td className="p-3">{m.serial ?? "—"}</td>
                <td className="p-3">{m.brand ?? "—"}</td>
                <td className="p-3">{m.model ?? "—"}</td>
                <td className="p-3">{m.status ?? "—"}</td>
                <td className="p-3">{m.location ?? "—"}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/machines/${m.id}`}
                      className="px-2 py-1 rounded-md border border-white/15 hover:bg-white/10"
                    >
                      Ver / Editar
                    </Link>

                    <form action={deleteMachine}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="px-2 py-1 rounded-md border border-red-500/40 text-red-300 hover:bg-red-500/10"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {machines.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-white/60">
                  Sin máquinas aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
