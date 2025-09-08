// src/app/machines/[id]/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export default async function MachineDetailPage({ params }: Params) {
  const { id } = params;
  const supabase = supabaseServer();

  const { data: m, error } = await supabase
    .from("machines")
    .select("id, name, code, brand, model, serial, status, type, location, base_rate_hour, base_rate_day, fuel_consumption, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error("view load error:", error);
    throw new Error("No se pudo cargar la máquina");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{m.name ?? "Máquina"}</h1>
        <Link href={`/machines/${id}/edit`} className="underline">Editar</Link>
        <Link href="/machines" className="underline">Volver</Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Item label="Código" value={m.code} />
        <Item label="Marca" value={m.brand} />
        <Item label="Modelo" value={m.model} />
        <Item label="Serie" value={m.serial} />
        <Item label="Estado" value={m.status} />
        <Item label="Tipo" value={m.type} />
        <Item label="Ubicación" value={m.location} />
        <Item label="Tarifa hora" value={m.base_rate_hour?.toString()} />
        <Item label="Tarifa día" value={m.base_rate_day?.toString()} />
        <Item label="Consumo (L/h)" value={m.fuel_consumption?.toString()} />
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border rounded px-3 py-2">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}
