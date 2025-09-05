// src/app/machines/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteMachine } from "./actions";

/** Fuerza runtime Node (importante con Supabase) */
export const runtime = "nodejs";

type Machine = {
  id: string;
  name: string | null;
  serial: string | null;
  status: string | null;
  daily_rate: number | null;
  created_at: string | null;
};

export default async function MachinesPage() {
  const sb = supabaseServer();

  let machines: Machine[] = [];
  try {
    const { data, error } = await sb
      .from("machines")
      .select("id,name,serial,status,daily_rate,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      // Renderizamos sin romper SSR
      console.error("Error cargando máquinas:", error.message);
      machines = [];
    } else {
      machines = data ?? [];
    }
  } catch (e) {
    console.error("Excepción cargando máquinas:", e);
    machines = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Máquinas</h1>
        <Link
          href="/machines/new"
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          Nueva máquina
        </Link>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/10">
        <table className="min-w-full text-left">
          <thead className="bg-white/10 text-gray-200">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Serie</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Tarifa diaria</th>
              <th className="p-3">Creada</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="[&_tr]:border-t [&_tr]:border-white/10">
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="p-3">{m.name ?? "—"}</td>
                <td className="p-3">{m.serial ?? "—"}</td>
                <td className="p-3 capitalize">{m.status ?? "—"}</td>
                <td className="p-3">
                  {m.daily_rate != null ? `$${m.daily_rate}` : "—"}
                </td>
                <td className="p-3">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString()
                    : "—"}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/machines/${m.id}`}
                      className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Ver →
                    </Link>

                    <form action={deleteMachine}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-md bg-red-600/90 hover:bg-red-600 transition-colors"
                        onClick={(e) => {
                          if (!confirm("¿Eliminar esta máquina?")) e.preventDefault();
                        }}
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
                <td className="p-4 text-gray-400" colSpan={6}>
                  {/** mensaje amable cuando no hay datos */}
                  No hay máquinas registradas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          ← Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
