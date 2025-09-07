// Server Component (SSR) — lista de máquinas
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const revalidate = 0; // sin caché, evita quedarse con datos viejos

type Machine = {
  id: string;
  name: string | null;
  code: string | null;
  brand: string | null;
  model: string | null;
  status: "disponible" | "rentada" | "en_reparacion" | string;
  location: string | null;
  serial: string | null;
};

export default async function MachinesPage() {
  const supabase = supabaseServer();

  // Traemos solo columnas existentes en tu tabla
  const { data, error } = await supabase
    .from("machines")
    .select("id,name,code,brand,model,status,location,serial")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error al cargar máquinas</p>
          <p className="text-sm opacity-80">{error.message}</p>
        </div>
      </div>
    );
  }

  const machines: Machine[] = data ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Máquinas</h1>
        <Link
          href="/machines/new"
          className="rounded-md bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700"
        >
          Nueva máquina
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full text-left text-sm text-black">
          <thead className="border-b bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Código</th>
              <th className="p-3">Marca</th>
              <th className="p-3">Modelo</th>
              <th className="p-3">Serie</th>
              <th className="p-3">Ubicación</th>
              <th className="p-3">Estado</th>
              <th className="p-3 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-gray-200">
            {machines.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-gray-500">
                  No hay máquinas aún.
                </td>
              </tr>
            )}
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-3">{m.name ?? "—"}</td>
                <td className="p-3">{m.code ?? "—"}</td>
                <td className="p-3">{m.brand ?? "—"}</td>
                <td className="p-3">{m.model ?? "—"}</td>
                <td className="p-3">{m.serial ?? "—"}</td>
                <td className="p-3">{m.location ?? "—"}</td>
                <td className="p-3 capitalize">
                  {m.status?.replace("_", " ") ?? "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/machines/${m.id}`}
                      className="rounded-md bg-gray-900 px-3 py-1 text-white hover:bg-gray-800"
                    >
                      Ver / Editar
                    </Link>
                    <form action={`/api/machines/${m.id}`} method="post">
                      <input type="hidden" name="_method" value="DELETE" />
                      <button
                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        onClick={(e) => {
                          if (!confirm("¿Eliminar máquina?")) e.preventDefault();
                        }}
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
