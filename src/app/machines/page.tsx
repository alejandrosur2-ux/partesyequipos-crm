// src/app/machines/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import Link from "next/link";

export default async function MachinesPage() {
  const sb = createClient();

  const { data: machines, error } = await sb
    .from("machines")
    .select("id, name, serial, status, daily_rate")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Máquinas</h1>
        <p className="text-red-500">Error cargando máquinas: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Máquinas</h1>
      <Link
        href="/machines/new"
        className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Nueva máquina
      </Link>

      {machines && machines.length > 0 ? (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Serie</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Tarifa diaria</th>
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
                  <Link
                    href={`/machines/${m.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay máquinas registradas.</p>
      )}
    </main>
  );
}
