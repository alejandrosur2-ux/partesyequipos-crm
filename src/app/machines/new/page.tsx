// src/app/machines/new/page.tsx
import { createClient } from "@/lib/supabase/server-only";
import { redirect } from "next/navigation";
import Banner from "@/components/Banner";
import Link from "next/link";

export default function NewMachinePage({
  searchParams,
}: {
  searchParams: { err?: string };
}) {
  async function createAction(formData: FormData) {
    "use server";
    const sb = createClient();

    const name = String(formData.get("name") || "").trim();
    const serial = String(formData.get("serial") || "").trim() || null;
    const status = String(formData.get("status") || "activo");
    const daily_rate = formData.get("daily_rate")
      ? Number(formData.get("daily_rate"))
      : null;

    const statusAllowed = new Set(["activo", "taller", "rentada", "baja"]);
    if (!name) return redirect("/machines/new?err=El nombre es obligatorio");
    if (!statusAllowed.has(status))
      return redirect("/machines/new?err=Estado inválido");

    const { data, error } = await sb
      .from("machines")
      .insert({ name, serial, status, daily_rate })
      .select("id")
      .single();

    if (error)
      return redirect(`/machines/new?err=${encodeURIComponent(error.message)}`);

    redirect(`/machines/${data.id}?msg=creada`);
  }

  return (
    <main className="p-6 max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nueva máquina</h1>
        <Link href="/machines" className="underline">
          ← Volver
        </Link>
      </div>

      {searchParams.err && <Banner type="err">{searchParams.err}</Banner>}

      <form action={createAction} className="space-y-3">
        <label className="block">
          <span className="text-sm">Nombre</span>
          <input name="name" className="border p-2 w-full rounded" required />
        </label>

        <label className="block">
          <span className="text-sm">Serie (opcional)</span>
          <input name="serial" className="border p-2 w-full rounded" />
        </label>

        <label className="block">
          <span className="text-sm">Estado</span>
          <select
            name="status"
            defaultValue="activo"
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
            className="border p-2 w-full rounded"
          />
        </label>

        <button
          type="submit"
          className="px-4 py-2 border rounded bg-blue-600 text-white"
        >
          Crear
        </button>
      </form>
    </main>
  );
}
