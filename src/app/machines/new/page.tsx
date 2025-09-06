// src/app/machines/new/page.tsx
import Link from "next/link";
import { createMachine } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewMachinePage() {
  return (
    <main className="p-6">
      <div className="mb-4">
        <Link href="/machines" className="text-sm text-indigo-600 hover:underline">
          ← Volver a Máquinas
        </Link>
      </div>

      <section className="max-w-3xl rounded-xl border border-zinc-200/60 bg-white shadow-sm">
        <div className="p-5 border-b border-zinc-100">
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Nueva máquina</h1>
          <p className="text-sm text-zinc-500">Completa los datos básicos y guarda.</p>
        </div>

        <form action={createMachine} className="p-5 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Nombre</label>
              <input
                name="name"
                placeholder="Nombre"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Serie</label>
              <input
                name="serial"
                placeholder="Serie"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Marca</label>
              <input
                name="brand"
                placeholder="Marca"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Modelo</label>
              <input
                name="model"
                placeholder="Modelo"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Estado</label>
              <input
                name="status"
                placeholder="Activo / Inactivo…"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Ubicación</label>
              <input
                name="location"
                placeholder="Planta / Bodega…"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Link
              href={`/machines`}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-300 hover:bg-zinc-50 text-zinc-700"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-3 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
