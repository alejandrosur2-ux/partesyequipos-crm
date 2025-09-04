// src/app/machines/[id]/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function MachineDetailPage({ params }: Props) {
  const sb = supabaseServer();

  // Traer la máquina por ID
  const { data: machine, error } = await sb
    .from("machines")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !machine) {
    // Si no existe, mandamos 404
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {machine.name ?? "Máquina"}
        </h1>
        <Link
          href="/machines"
          className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Información</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nombre</dt>
              <dd className="font-medium">{machine.name ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Serie</dt>
              <dd className="font-medium">{machine.serial ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Estado</dt>
              <dd className="capitalize font-medium">{machine.status ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tarifa diaria</dt>
              <dd className="font-medium">
                {machine.daily_rate ? `$${machine.daily_rate}` : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Creada</dt>
              <dd className="font-medium">
                {machine.created_at
                  ? new Date(machine.created_at).toLocaleString()
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Observaciones</h2>
          <p className="text-sm text-gray-700">
            {machine.notes ?? "Sin observaciones."}
          </p>
        </div>
      </div>
    </div>
  );
}
