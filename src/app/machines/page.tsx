// Crear máquina (SSR, sin hooks)
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

// Ajusta estos valores a los que EXISTEN en tu enum machine_status
const STATUS_OPTS = [
  { value: "disponible", label: "Disponible" },
  { value: "en-reparacion", label: "En reparación" }, // OJO: con guion si tu enum es así
  { value: "rentada", label: "Rentada" },
];

export default async function NewMachinePage() {
  // Solo para verificar conexión; no usamos datos aquí
  await supabaseServer();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Nueva máquina</h1>
        <Link
          href="/machines"
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Volver
        </Link>
      </div>

      <form action="/api/machines" method="post" className="space-y-4 rounded-lg bg-white p-6 shadow text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Código *</span>
            <input name="code" required className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Nombre</span>
            <input name="name" className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Marca</span>
            <input name="brand" className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Modelo</span>
            <input name="model" className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">N° Serie</span>
            <input name="serial" className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Ubicación</span>
            <input name="location" className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Estado *</span>
            <select name="status" required className="mt-1 w-full rounded border px-3 py-2 bg-white">
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-2">
          <button className="rounded-md bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700">
            Guardar
          </button>
          <a href="/machines" className="rounded-md border px-4 py-2">Cancelar</a>
        </div>
      </form>
    </div>
  );
}
