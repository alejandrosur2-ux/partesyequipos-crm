// src/app/machines/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Page({
  params,
}: {
  // 👇 En Next 15 a veces viene como Promise
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 👈 Importante

  const supabase = createClient();
  const { data: machine, error } = await supabase
    .from("machines")
    .select(
      // usa solo columnas reales; ajusta si usas la vista v_machines_es
      "id,name,serial,status,daily_rate,brand,model,notes,created_at,updated_at"
    )
    .eq("id", id)
    .single();

  if (error) {
    // Evita crashear el render del Server Component
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Máquinas</h1>
        <p className="mt-4 text-red-400">
          Error al cargar la máquina: {error.message}
        </p>
        <Link href="/machines" className="mt-6 inline-block underline">
          ← Volver
        </Link>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Máquinas</h1>
        <p className="mt-4">No se encontró la máquina solicitada.</p>
        <Link href="/machines" className="mt-6 inline-block underline">
          ← Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{machine.name}</h1>
        <Link
          href={`/machines/${machine.id}/edit`}
          className="rounded px-3 py-1.5 bg-white/10 hover:bg-white/20"
        >
          Editar
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 p-4">
          <h2 className="mb-3 text-sm uppercase tracking-wide text-white/60">
            Información
          </h2>
          <div className="space-y-2 text-white/90">
            <div><span className="text-white/60">Serie:</span> {machine.serial ?? "—"}</div>
            <div><span className="text-white/60">Estado:</span> {machine.status}</div>
            <div><span className="text-white/60">Tarifa diaria:</span> {Number(machine.daily_rate ?? 0).toLocaleString()}</div>
            <div><span className="text-white/60">Marca:</span> {machine.brand ?? "—"}</div>
            <div><span className="text-white/60">Modelo:</span> {machine.model ?? "—"}</div>
            <div><span className="text-white/60">Creada:</span> {new Date(machine.created_at).toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 p-4">
          <h2 className="mb-3 text-sm uppercase tracking-wide text-white/60">
            Observaciones
          </h2>
          <p className="text-white/90">{machine.notes ?? "Sin observaciones."}</p>
        </div>
      </div>
    </div>
  );
}
