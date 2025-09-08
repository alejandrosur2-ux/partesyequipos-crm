// src/app/machines/[id]/page.tsx
import Link from "next/link";
import { getMachine } from "../actions";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function MachineViewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  try {
    const { id } = await params;
    const machine = await getMachine(id);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Máquina: {machine.name ?? "—"}</h1>
          <div className="flex gap-3">
            <Link href={`/machines/${id}/edit`} className="underline">Editar</Link>
            <Link href="/machines" className="underline">Ver todas</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border p-4 space-y-2">
            <Item label="Código" value={machine.code} />
            <Item label="Marca" value={machine.brand} />
            <Item label="Modelo" value={machine.model} />
            <Item label="Serie" value={machine.serial} />
            <Item label="Estado" value={machine.status} />
          </div>

          <div className="rounded border p-4 space-y-2">
            <Item label="Tarifa hora" value={machine.base_rate_hour} />
            <Item label="Tarifa día" value={machine.base_rate_day} />
            <Item label="Consumo combustible" value={machine.fuel_consumption} />
            <Item label="Creado" value={machine.created_at} />
            <Item label="Actualizado" value={machine.updated_at} />
          </div>
        </div>
      </div>
    );
  } catch (e: any) {
    console.error("MachineViewPage error:", e);
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold">Ocurrió un error en Máquinas</h1>
        <p className="opacity-70 text-sm">
          {e?.message ?? "Error desconocido"}
        </p>
        <Link href="/machines" className="underline">← Volver</Link>
      </div>
    );
  }
}

function Item({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-4">
      <div className="opacity-60">{label}</div>
      <div className="font-mono text-right">{value ?? "—"}</div>
    </div>
  );
}
