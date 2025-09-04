import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: machine, error } = await supabase
    .from("machines")
    .select("id,name,serial,status,daily_rate,notes,created_by")
    .eq("id", params.id)
    .single();

  if (error) return <p>Error: {error.message}</p>;
  if (!machine) return <p>No existe</p>;

  async function updateAction(formData: FormData) {
    "use server";
    const supabase = createClient();
    const payload = {
      name: String(formData.get("name") || ""),
      serial: String(formData.get("serial") || ""),
      status: String(formData.get("status") || "activo"),
      daily_rate: formData.get("daily_rate")
        ? Number(formData.get("daily_rate"))
        : null,
      notes: String(formData.get("notes") || ""),
    };

    const { error } = await supabase
      .from("machines")
      .update(payload)
      .eq("id", formData.get("id"));

    if (error) throw new Error(error.message);
    revalidatePath(`/machines/${formData.get("id")}`);
  }

  return (
    <main className="p-6 max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Editar máquina</h1>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" defaultValue={machine.id} />

        <label className="block">
          <span>Nombre</span>
          <input name="name" defaultValue={machine.name ?? ""} className="w-full border p-2 rounded" />
        </label>

        <label className="block">
          <span>Serie</span>
          <input name="serial" defaultValue={machine.serial ?? ""} className="w-full border p-2 rounded" />
        </label>

        <label className="block">
          <span>Estado</span>
          <select name="status" defaultValue={machine.status ?? "activo"} className="w-full border p-2 rounded">
            <option value="activo">activo</option>
            <option value="taller">taller</option>
            <option value="rentada">rentada</option>
            <option value="baja">baja</option>
          </select>
        </label>

        <label className="block">
          <span>Tarifa diaria</span>
          <input type="number" step="0.01" name="daily_rate"
                 defaultValue={machine.daily_rate ?? ""} className="w-full border p-2 rounded" />
        </label>

        <label className="block">
          <span>Notas</span>
          <textarea name="notes" defaultValue={machine.notes ?? ""} className="w-full border p-2 rounded" />
        </label>

        <button type="submit" className="border px-4 py-2 rounded">Guardar</button>
      </form>
    </main>
  );
}
