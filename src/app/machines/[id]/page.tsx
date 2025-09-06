// src/app/machines/[id]/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteMachine, updateMachine } from "../actions";

// 👇 importante para evitar el error de tipos con Next 15
type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MachineDetailPage({ params }: PageProps) {
  const { id } = await params;

  const sb = supabaseServer();
  const { data: machine, error } = await sb.from("machines").select("*").eq("id", id).single();

  if (error) {
    return (
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Máquina</h1>
          <Link href="/machines" className="text-sm text-zinc-600 hover:text-zinc-900">← Volver</Link>
        </div>
        <p className="text-red-600">Error al cargar: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {machine?.name ?? "Máquina"}
        </h1>
        <div className="flex items-center gap-3">
          <form action={deleteMachine}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Eliminar
            </button>
          </form>
          <Link href="/machines" className="text-sm text-zinc-600 hover:text-zinc-900">← Volver</Link>
        </div>
      </div>

      {/* Formulario de edición */}
      <form action={updateMachine} className="grid gap-4 md:max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-sm font-medium text-zinc-700">Nombre</label>
          <input name="name" defaultValue={machine?.name ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Serie</label>
            <input name="serial" defaultValue={machine?.serial ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Marca</label>
            <input name="brand" defaultValue={machine?.brand ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Modelo</label>
            <input name="model" defaultValue={machine?.model ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Estado</label>
            <input name="status" defaultValue={machine?.status ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Ubicación</label>
          <input name="location" defaultValue={machine?.location ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 p-2" />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </main>
  );
}
