// src/app/machines/[id]/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;            // sin caché mientras depuramos
export const dynamic = "force-dynamic"; // fuerza SSR

type Params = { id: string };

export default async function MachineDetailPage({
  params,
}: {
  params: Promise<Params>; // 👈 importante (Next 15)
}) {
  const { id } = await params;

  const supabase = supabaseServer();

  const { data: machine, error } = await supabase
    .from("machines")
    .select(
      "id, code, name, brand, model, serial, type, location, status, base_rate_hour, base_rate_day, fuel_consumption, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle(); // 👈 no truena si no existe

  if (error) {
    // Esto sí se ve en logs de Vercel y evita el digest opaco
    console.error("machines/[id] error:", error);
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Máquina</h1>
        <div className="rounded border p-4 text-red-600 bg-red-50 dark:bg-transparent">
          Error al cargar la máquina.<br />
          <span className="opacity-70 text-sm">{error.message}</span>
        </div>
        <Link href="/machines" className="underline">← Volver</Link>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Máquina</h1>
        <div className="rounded border p-4">No existe la máquina solicitada.</div>
        <Link href="/machines" className="underline">← Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {machine.name ?? "Sin nombre"} ({machine.code ?? "—"})
        </h1>
        <div className="flex gap-3">
          <Link href={`/machines/${machine.id}/edit`} className="btn btn-primary">Editar</Link>
          <Link href="/machines" className="btn">Ver todas</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Info label="Estado" value={machine.status ?? "—"} />
        <Info label="Marca" value={machine.brand ?? "—"} />
        <Info label="Modelo" value={machine.model ?? "—"} />
        <Info label="Serie" value={machine.serial ?? "—"} />
        <Info label="Tipo" value={machine.type ?? "—"} />
        <Info label="Ubicación" value={machine.location ?? "—"} />
        <Info label="Tarifa hora" value={fmtMoney(machine.base_rate_hour)} />
        <Info label="Tarifa día" value={fmtMoney(machine.base_rate_day)} />
        <Info label="Consumo (L/h)" value={fmtNum(machine.fuel_consumption)} />
        <Info label="Creado" value={fmtDate(machine.created_at)} />
        <Info label="Actualizado" value={fmtDate(machine.updated_at)} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs opacity-60 mb-1">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function fmtMoney(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}
function fmtNum(n?: number | null) {
  if (n == null) return "—";
  return String(n);
}
function fmtDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("es-MX");
  } catch {
    return d;
  }
}
