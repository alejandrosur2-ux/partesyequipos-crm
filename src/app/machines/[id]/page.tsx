// src/app/machines/[id]/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

type PageProps = { params: { id: string } };

export default async function MachineDetailPage({ params }: PageProps) {
  const sb = createClient();

  const { data: m, error } = await sb
    .from("machines")
    .select("id,name,serial,status,daily_rate,notes,created_at")
    .eq("id", params.id)
    .single();

  if (error || !m) notFound();

  // ----- Server Action: actualizar -----
  async function updateAction(formData: FormData) {
    "use server";
    const sb = createClient();
    const id = String(formData.get("id"));

    const payload = {
      name: String(formData.get("name") || ""),
      serial: String(formData.get("serial") || "") || null,
      status: String(formData.get("status") || "activo"),
      daily_rate: formData.get("daily_rate")
        ? Number(formData.get("daily_rate"))
        : null,
      notes: String(formData.get("notes") || "") || null,
    };

    const { error } = await sb.from("machines").update(payload).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath(`/machines/${id}`);
  }

  // ----- Server Action: eliminar -----
  async function deleteAction(formData: FormData) {
    "use server";
    const sb = createClient();
    const id = String(formData.get("id"));
    const { error } = await sb.from("machines").delete().eq("id", id);
    if (error) throw new Error(error.message);
    redirect("/machines");
  }

  return (
    <main className="p-6 max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Máquina</h1>
        <Link href="/machines" className="underline">
          ← Volver
        </Link>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" defaultValue={m.id} />

        <label className="block">
          <span className="text-sm">Nombre</span>
          <input
            name="name"
            defaultValue={m.name ?? ""}
            className="border p-2 w-full rounded"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Serie (opcional)</span>
          <input
            name="serial"
            defaultValue={m.serial ?? ""}
            className="border p-2 w-full rounded"
          />
        </label>

        <label className="block">
          <span className="text-sm">Estado</span>
          <select
            name="status"
            defaultValue={m.status ?? "activo"}
            className="border p-2 w-full rounded"
          >
            <option value="activo">activo</option>
            <option value="taller">taller</option>
            <option value="rentada">rentada</option>
            <option value="baja">baja</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Tarifa diaria (opcional)</span>
          <input
            type="number"
            step="0.01"
            name="daily_rate"
            defaultValue={m.daily_rate ?? ""}
            className="border p-2 w-full rounded"
          />
        </label>

        <label className="block">
          <span className="text-sm">Notas (opcional)</span>
          <textarea
            name="notes"
            defaultValue={m.notes ?? ""}
            className="border p-2 w-full rounded"
            rows={4}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
          >
            Guardar
          </button>

          <form action={deleteAction}>
            <input type="hidden" name="id" defaultValue={m.id} />
            <button
              type="submit"
              className="px-4 py-2 border rounded bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </form>
        </div>
      </form>

      <p className="text-xs opacity-60">
        Creada: {new Date(m.created_at).toLocaleString()}
      </p>
    </main>
  );
}
