// src/app/machines/new/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewMachinePage() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nueva máquina</h1>

      <form action={createMachine} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input name="name" className="w-full rounded border px-3 py-2 text-black" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Serie</label>
          <input name="serial" className="w-full rounded border px-3 py-2 text-black" />
        </div>
        <div>
          <label className="block text-sm mb-1">Estado</label>
          <select name="status" className="w-full rounded border px-3 py-2 text-black">
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Tarifa diaria</label>
          <input
            name="daily_rate"
            type="number"
            step="0.01"
            className="w-full rounded border px-3 py-2 text-black"
            defaultValue={0}
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
        >
          Guardar
        </button>
      </form>
    </main>
  );
}

export async function createMachine(formData: FormData) {
  "use server";
  const sb = supabaseServer();
  const payload = {
    name: String(formData.get("name") ?? ""),
    serial: String(formData.get("serial") ?? ""),
    status: String(formData.get("status") ?? "active"),
    daily_rate: Number(formData.get("daily_rate") ?? 0),
  };
  const { error } = await sb.from("machines").insert(payload);
  if (error) throw new Error(error.message);
  redirect("/machines");
}
