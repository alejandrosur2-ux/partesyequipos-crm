// src/app/machines/new/page.tsx
import Link from "next/link";
import { createMachine } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewMachinePage() {
  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Nueva máquina</h1>
        <Link href="/machines" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Volver
        </Link>
      </div>

      <form action={createMachine} className="max-w-2xl space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Nombre</label>
          <input name="name" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" placeholder="Ej: Compresor Kaeser" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Serie</label>
            <input name="serial" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" placeholder="ABC-1234" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Marca</label>
            <input name="brand" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" placeholder="Marca" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Modelo</label>
            <input name="model" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" placeholder="Modelo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Estado</label>
            <input name="status" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" placeholder="Activo / Inactivo" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Ubicación</label>
          <input name="location" className="mt-1 w-full rounded-lg border border-zinc-300 p-2" placeholder="Planta / Bodega" />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </main>
  );
}
