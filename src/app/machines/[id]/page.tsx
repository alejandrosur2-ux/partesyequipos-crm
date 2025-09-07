// Editar máquina (SSR, sin hooks y sin loading.tsx)
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

// Deben coincidir con TU enum
const STATUS_OPTS = [
  { value: "disponible", label: "Disponible" },
  { value: "en-reparacion", label: "En reparación" },
  { value: "rentada", label: "Rentada" },
];

export default async function MachineDetailPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const { data: machine, error } = await supabase
    .from("machines")
    .select("id, code, name, brand, model, serial, location, status")
    .eq("id", params.id)
    .single();

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error al cargar</p>
          <p className="text-sm opacity-80">{error.message}</p>
          <a href="/machines" className="mt-3 inline-block rounded bg-gray-900 px-3 py-1 text-white">Volver</a>
        </div>
      </div>
    );
  }

  if (!machine) notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Editar máquina</h1>
        <Link
          href="/machines"
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Volver
        </Link>
      </div>

      <form action={`/api/machines/${machine.id}`} method="post" className="space-y-4 rounded-lg bg-white p-6 shadow text-black">
        <input type="hidden" name="_method" value="PATCH" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Código *</span>
            <input name="code" required defaultValue={machine.code ?? ""} className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Nombre</span>
            <input name="name" defaultValue={machine.name ?? ""} className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Marca</span>
            <input name="brand" defaultValue={machine.brand ?? ""} className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Modelo</span>
            <input name="model" defaultValue={machine.model ?? ""} className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">N° Serie</span>
            <input name="serial" defaultValue={machine.serial ?? ""} className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Ubicación</span>
            <input name="location" defaultValue={machine.location ?? ""} className="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Estado *</span>
            <select name="status" required defaultValue={machine.status ?? "disponible"} className="mt-1 w-full rounded border px-3 py-2 bg-white">
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-2">
          <button className="rounded-md bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700">
            Guardar cambios
          </button>

          <form action={`/api/machines/${machine.id}`} method="post">
            <input type="hidden" name="_method" value="DELETE" />
            <button
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              onClick={(e) => {
                if (!confirm("¿Eliminar máquina?")) e.preventDefault();
              }}
            >
              Eliminar
            </button>
          </form>
        </div>
      </form>
    </div>
  );
}
