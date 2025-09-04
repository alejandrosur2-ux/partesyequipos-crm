// src/app/machines/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export default async function MachinesPage() {
  const sb = createClient();

  // ----- Server Action: eliminar desde la lista -----
  async function deleteAction(formData: FormData) {
    "use server";
    const sb = createClient();
    const id = String(formData.get("id"));
    const { error } = await sb.from("machines").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/machines");
  }

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
              <th className="p-2 border text-left">Nombre</th>
              <th className="p-2 border text-left">Serie</th>
              <th className="p-2 border text-left">Estado</th>
              <th className="p-2 border text-left">Tarifa diaria</th>
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
      ) : (
        <p>No hay máquinas registradas.</p>
      )}
    </main>
  );
}
