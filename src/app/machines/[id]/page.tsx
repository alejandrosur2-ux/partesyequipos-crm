// src/app/machines/[id]/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import Banner from "@/components/Banner";

export default async function MachineDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { msg?: string; err?: string };
}) {
  const sb = createClient();
  const bannerMsg = searchParams?.msg;
  const bannerErr = searchParams?.err;

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

    const statusAllowed = new Set(["activo", "taller", "rentada", "baja"]);
    const nameVal = String(formData.get("name") || "").trim();
    const statusVal = String(formData.get("status") || "activo");

    if (!nameVal) return redirect(`/machines/${id}?err=El nombre es obligatorio`);
    if (!statusAllowed.has(statusVal))
      return redirect(`/machines/${id}?err=Estado inválido`);

    const payload = {
      name: nameVal,
      serial: String(formData.get("serial") || "") || null,
      status: statusVal,
      daily_rate: formData.get("daily_rate")
        ? Number(formData.get("daily_rate"))
        : null,
      notes: String(formData.get("notes") || "") || null,
    };

    const { error } = await sb.from("machines").update(payload).eq("id", id);
    if (error) return redirect(`/machines/${id}?err=${encodeURIComponent(error.message)}`);

    // banner de éxito en la misma página
    redirect(`/machines/${id}?msg=guardada`);
  }

  // ----- Server Action: eliminar -----
  async function deleteAction(formData: FormData) {
    "use server";
    const sb = createClient();
    const id = String(formData.get("id"));
    const { error } = await sb.from("machines").delete().eq("id", id);
    if (error) throw new Error(error.message);
    // banner en la lista
    redirect("/machines?msg=eliminada");
  }

  return (
    <main className="p-6 max-w-xl space-y-4">
      {bannerMsg && <Banner type="ok">Máquina {bannerMsg}.</Banner>}
      {bannerErr && <Banner type="err">{bannerErr}</Banner>}

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
            <DeleteButton />
          </form>
        </div>
      </form>

      <p className="text-xs opacity-60">
        Creada: {new Date(m.created_at).toLocaleString()}
      </p>
    </main>
  );
}
