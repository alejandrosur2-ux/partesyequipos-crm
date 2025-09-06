// src/app/machines/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteMachine } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// util para tomar el primer campo disponible
function pick(obj: Record<string, any>, keys: string[], fallback: string = "—") {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return String(obj[k]);
  }
  return fallback;
}

export default async function MachinesPage() {
  const sb = supabaseServer();

  // Pedimos todas las columnas para evitar errores por nombres distintos
  const { data, error } = await sb.from("machines").select("*").order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Máquinas</h1>
        <p className="text-red-500">Error al cargar máquinas: {error.message}</p>
      </main>
    );
  }

  const machines: Record<string, any>[] = data ?? [];

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Máquinas</h1>
        <div className="flex gap-2">
          <Link
            href="/machines/new"
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
          >
            + Nueva máquina
          </Link>
          <Link
            href="/reports"
            className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm"
          >
            Reportes
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200/20 bg-white/50 backdrop-blur-sm shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/70 text-zinc-700">
            <tr className="[&>th]:py-3 [&>th]:px-3 text-left font-semibold">
              <th>Nombre</th>
              <th>Serie</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Creada</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-t [&>tr]:border-zinc-200/50">
            {machines.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-zinc-500">
                  Sin datos por ahora.
                </td>
              </tr>
            )}

            {machines.map((m) => {
              const id = pick(m, ["id"], "");
              const name = pick(m, ["name", "nombre"]);
              const serial = pick(m, ["serial", "serie"]);
              const brand = pick(m, ["brand", "marca"]);
              const model = pick(m, ["model", "modelo"]);
              const status = pick(m, ["status", "estado"]);
              const location = pick(m, ["location", "ubicacion", "ubicación"]);
              const created = pick(m, ["created_at", "createdAt", "fecha_creacion"]);

              const createdStr =
                created !== "—" && !Number.isNaN(Date.parse(created))
                  ? new Date(created).toLocaleDateString()
                  : "—";

              return (
                <tr key={id || Math.random()} className="hover:bg-zinc-50">
                  <td className="p-3 text-zinc-900">{name}</td>
                  <td className="p-3 text-zinc-900">{serial}</td>
                  <td className="p-3 text-zinc-900">{brand}</td>
                  <td className="p-3 text-zinc-900">{model}</td>
                  <td className="p-3">
                    <span className="inline-block rounded-full px-2 py-0.5 text-xs border border-zinc-300 text-zinc-700 bg-white">
                      {status}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-900">{location}</td>
                  <td className="p-3 text-zinc-900">{createdStr}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {id ? (
                        <Link
                          href={`/machines/${id}`}
                          className="px-2.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                        >
                          Ver
                        </Link>
                      ) : null}
                      {id ? (
                        <form action={deleteMachine}>
                          <input type="hidden" name="id" value={id} />
                          <button
                            type="submit"
                            className="px-2.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs"
                          >
                            Eliminar
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
