// src/app/machines/[id]/edit/page.tsx
import Link from "next/link";
import { getMachine, updateMachine } from "../../actions";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = { id: string };

const STATUS_OPTIONS = [
  { value: "", label: "—" },
  { value: "disponible", label: "Disponible" },
  { value: "rentada", label: "Rentada" },
  { value: "en_reparacion", label: "En reparación" },
  // agrega otras si las usas como texto en la columna `status`
];

export default async function MachineEditPage({
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
          <h1 className="text-2xl font-semibold">Editar máquina</h1>
          <div className="flex gap-3">
            <Link href={`/machines/${id}`} className="underline">← Ver</Link>
            <Link href="/machines" className="underline">Ver todas</Link>
          </div>
        </div>

        <form action={updateMachine} className="rounded border p-4 grid md:grid-cols-2 gap-4">
          <input type="hidden" name="id" value={id} />

          <Field label="Nombre">
            <input name="name" defaultValue={machine.name ?? ""} className="input" />
          </Field>

          <Field label="Código">
            <input name="code" defaultValue={machine.code ?? ""} className="input" />
          </Field>

          <Field label="Marca">
            <input name="brand" defaultValue={machine.brand ?? ""} className="input" />
          </Field>

          <Field label="Modelo">
            <input name="model" defaultValue={machine.model ?? ""} className="input" />
          </Field>

          <Field label="Serie">
            <input name="serial" defaultValue={machine.serial ?? ""} className="input" />
          </Field>

          <Field label="Estado (texto)">
            <select name="status" defaultValue={machine.status ?? ""} className="input">
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Tarifa hora">
            <input type="number" step="0.01" name="base_rate_hour" defaultValue={machine.base_rate_hour ?? ""} className="input" />
          </Field>

          <Field label="Tarifa día">
            <input type="number" step="0.01" name="base_rate_day" defaultValue={machine.base_rate_day ?? ""} className="input" />
          </Field>

          <Field label="Consumo combustible">
            <input type="number" step="0.01" name="fuel_consumption" defaultValue={machine.fuel_consumption ?? ""} className="input" />
          </Field>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
            <Link href={`/machines/${id}`} className="btn">Cancelar</Link>
          </div>
        </form>

        {/* estilos mínimos por si tu CSS utilitario no está */}
        <style jsx>{`
          .input { width:100%; padding:0.5rem 0.75rem; border:1px solid rgba(0,0,0,.15); border-radius:0.5rem; background:transparent }
          .btn { padding:0.5rem 0.9rem; border:1px solid rgba(0,0,0,.15); border-radius:0.5rem; display:inline-block }
          .btn-primary { background:#2563eb; color:white; border-color:transparent }
        `}</style>
      </div>
    );
  } catch (e: any) {
    console.error("MachineEditPage error:", e);
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <div className="text-sm opacity-70">{label}</div>
      {children}
    </label>
  );
}
