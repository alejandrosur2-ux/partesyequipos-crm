// src/app/machines/[id]/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { updateMachine } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next 15: params es una Promise en el tipo PageProps
interface PageProps {
  params: Promise<{ id: string }>;
}

function pick(obj: Record<string, any>, keys: string[], fallback = "—") {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return String(obj[k]);
  }
  return fallback;
}

export default async function MachineDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sb = supabaseServer();

  const { data, error } = await sb.from("machines").select("*").eq("id", id).maybeSingle();

  if (error) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/machines" className="text-sm text-indigo-600 hover:underline">
            ← Volver a Máquinas
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-2">Máquina</h1>
        <p className="text-red-600">Error: {error.message}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="p-6">
        <div className="mb-4">
          <Link href="/machines" className="text-sm text-indigo-600 hover:underline">
            ← Volver a Máquinas
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-2">Máquina no encontrada</h1>
      </main>
    );
  }

  const name = pick(data, ["name", "nombre"]);
  const serial = pick(data, ["serial", "serie"]);
  const brand = pick(data, ["brand", "marca"]);
  const model = pick(data, ["model", "modelo"]);
  const status = pick(data, ["status", "estado"]);
  const location = pick(data, ["location", "ubicacion", "ubicación"]);
  const created = pick(data, ["created_at", "createdAt", "fecha_creacion"]);
  const createdStr =
    created !== "—" && !Number.isNaN(Date.parse(created))
      ? new Date(created).toLocaleDateString()
      : "—";

  return (
    <main className="p-6">
      <div className="mb-4">
        <Link href="/machines" className="text-sm text-indigo-600 hover:underline">
          ← Volver a Máquinas
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Datos */}
        <section className="rounded-xl border border-zinc-200/60 bg-white shadow-sm">
          <div className="p-5 border-b border-zinc-100">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Ficha de la máquina</h1>
            <p className="text-sm text-zinc-500">ID: {id}</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-900">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Nombre</p>
              <p className="text-base font-medium">{name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Serie</p>
              <p className="text-base font-medium">{serial}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Marca</p>
              <p className="text-base font-medium">{brand}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Modelo</p>
              <p className="text-base font-medium">{model}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Estado</p>
              <p className="text-base font-medium">{status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Ubicación</p>
              <p className="text-base font-medium">{location}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Creada</p>
              <p className="text-base font-medium">{createdStr}</p>
            </div>
          </div>
        </section>

        {/* Edición rápida */}
        <section className="rounded-xl border border-zinc-200/60 bg-white shadow-sm">
          <div className="p-5 border-b border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-900">Editar datos</h2>
            <p className="text-sm text-zinc-500">Actualiza solo los campos que quieras cambiar.</p>
          </div>

          <form action={updateMachine} className="p-5 grid grid-cols-1 gap-4">
            <input type="hidden" name="id" value={id} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Nombre</label>
                <input
                  name="name"
                  defaultValue={name !== "—" ? name : ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nombre / nombre"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Serie</label>
                <input
                  name="serial"
                  defaultValue={serial !== "—" ? serial : ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Serie / serial"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Marca</label>
                <input
                  name="brand"
                  defaultValue={brand !== "—" ? brand : ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Marca / brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Modelo</label>
                <input
                  name="model"
                  defaultValue={model !== "—" ? model : ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Modelo / model"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Estado</label>
                <input
                  name="status"
                  defaultValue={status !== "—" ? status : ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Activo / Inactivo…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Ubicación</label>
                <input
                  name="location"
                  defaultValue={location !== "—" ? location : ""}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Planta / Bodega…"
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
                Guardar cambios
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
