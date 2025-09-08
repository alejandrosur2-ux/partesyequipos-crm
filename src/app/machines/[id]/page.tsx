// src/app/machines/[id]/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type Props = { params: { id: string } };
export const revalidate = 0;

export default async function MachineShowPage({ params }: Props) {
  const supabase = supabaseServer();
  const { data: m, error } = await supabase
    .from("machines")
    .select("id, code, name, brand, model, serial, status, type, base_rate_hour, base_rate_day, fuel_consumption, location, created_at, updated_at")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-bold">Error al cargar la máquina</h1>
        <pre className="text-sm opacity-80">{String(error.message)}</pre>
        <Link href="/machines" className="underline">Volver</Link>
      </div>
    );
  }
  if (!m) {
    return (
      <div className="p-6 space-y-3">
        <p>No existe la máquina.</p>
        <Link href="/machines" className="underline">Volver</Link>
      </div>
    );
  }

  const Item = ({ k, v }: { k: string; v?: string | number | null }) => (
    <div className="rounded border p-3">
      <div className="text-xs opacity-70">{k}</div>
      <div className="font-medium">{v ?? "—"}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{m.name ?? m.code ?? "Máquina"}</h1>
        <Link className="px-3 py-1 rounded bg-blue-600 text-white" href={`/machines/${m.id}/edit`}>
          Editar
        </Link>
        <Link className="px-3 py-1 rounded bg-slate-600 text-white" href="/machines">
          Volver
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Item k="Código" v={m.code} />
        <Item k="Marca" v={m.brand} />
        <Item k="Modelo" v={m.model} />
        <Item k="Serie" v={m.serial} />
        <Item k="Estado" v={m.status} />
        <Item k="Tipo" v={m.type} />
        <Item k="Ubicación" v={m.location} />
        <Item k="Tarifa hora" v={m.base_rate_hour as any} />
        <Item k="Tarifa día" v={m.base_rate_day as any} />
        <Item k="Consumo (L/h)" v={m.fuel_consumption as any} />
      </div>
    </div>
  );
}
