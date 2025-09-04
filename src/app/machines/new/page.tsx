// src/app/machines/new/page.tsx
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function createMachine(formData: FormData) {
  "use server";
  const supabase = supabaseServer();

  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() || null;
  const dailyRateRaw = String(formData.get("daily_rate") ?? "").trim();
  const daily_rate = dailyRateRaw ? Number(dailyRateRaw) : null;

  if (!code || !type) {
    return { ok: false, message: "Código y tipo son obligatorios." };
  }

  const { error } = await supabase
    .from("machines")
    .insert([{ code, name, type, status, daily_rate }]);

  if (error) {
    return { ok: false, message: error.message };
  }

  // Refresca el listado y redirige
  revalidatePath("/machines");
  redirect("/machines");
}

export default function NewMachinePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nueva máquina</h1>
        <Link href="/machines" className="text-sm hover:underline">
          ← Volver
        </Link>
      </div>

      <form action={createMachine} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Código *</label>
          <input
            name="code"
            required
            placeholder="EXC-001"
            className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none border border-white/10"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            name="name"
            placeholder="Excavadora 20T"
            className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none border border-white/10"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tipo *</label>
          <input
            name="type"
            required
            placeholder="Excavadora / Retroexcavadora / Camión..."
            className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none border border-white/10"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Estatus</label>
          <select
            name="status"
            className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none border border-white/10"
            defaultValue=""
          >
            <option value="">— Selecciona —</option>
            <option value="Disponible">Disponible</option>
            <option value="Rentada">Rentada</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tarifa diaria (USD)</label>
          <input
            name="daily_rate"
            type="number"
            step="0.01"
            placeholder="200"
            className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none border border-white/10"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
