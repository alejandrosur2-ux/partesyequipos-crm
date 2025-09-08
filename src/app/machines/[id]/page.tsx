// src/app/machines/[id]/page.tsx
import { supabaseServer } from "@/lib/supabase/server"; // tu helper
import Link from "next/link";

type Props = { params: { id: string } };

export default async function MachineDetailPage({ params }: Props) {
  const supabase = supabaseServer();

  // lee SOLO de public.machines y SOLO columnas existentes
  const { data: m, error } = await supabase
    .from("machines")
    .select(
      "id, code, name, type, brand, model, serial, status, base_rate_hour, base_rate_day, fuel_consumption, location, created_at, updated_at"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    // ayuda a debuggear
    console.error("machines/[id] select error:", error);
    throw new Error("No se pudo cargar la máquina");
  }
  if (!m) {
    return (
      <div className="p-6">
        <p>No encontrada.</p>
        <Link href="/machines" className="underline">Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{m.name ?? m.code}</h1>
        <div className="flex gap-2">
          <Link href={`/machines/${m.id}/edit`} className="btn btn-primary">Editar</Link>
          <Link href="/machines" className="btn">Volver</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Código" value={m.code} />
        <Info label="Tipo" value={m.type} />
        <Info label="Marca" value={m.brand} />
        <Info label="Modelo" value={m.model} />
        <Info label="Serie" value={m.serial} />
        <Info label="Estado" value={m.status} />
        <Info label="Tarifa hora" value={m.base_rate_hour?.toString()} />
        <Info label="Tarifa día" value={m.base_rate_day?.toString()} />
        <Info label="Consumo" value={m.fuel_consumption?.toString()} />
        <Info label="Ubicación" value={m.location} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}
