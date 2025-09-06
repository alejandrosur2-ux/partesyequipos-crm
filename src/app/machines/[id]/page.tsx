// src/app/machines/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server-only";

type Machine = {
  id: string;
  name: string | null;
  serial: string | null;
  brand: string | null;
  model: string | null;
  status: string | null;
  location: string | null;
  description: string | null;
  created_at: string | null;
};

// 👇 Nota: params es Promise en Next 15
export default async function MachineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient();

  const { data: machine, error } = await supabase
    .from("machines")
    .select("*")
    .eq("id", id)
    .single<Machine>();

  if (error) {
    // Si id no existe o hay error, lleva a 404
    return notFound();
  }

  if (!machine) {
    return notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-4">
        <Link
          href="/machines"
          className="text-sm text-blue-400 hover:underline"
        >
          ← Volver a máquinas
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h1 className="text-2xl font-semibold mb-2">
          {machine.name ?? "Sin nombre"}
        </h1>
        <p className="text-white/70 mb-6">
          ID: <span className="text-white/90">{machine.id}</span>
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Serie" value={machine.serial} />
          <Field label="Marca" value={machine.brand} />
          <Field label="Modelo" value={machine.model} />
          <Field label="Estado" value={machine.status} />
          <Field label="Ubicación" value={machine.location} />
          <Field label="Creada" value={machine.created_at} />
        </div>

        <div className="mt-6">
          <Field
            label="Descripción"
            value={machine.description}
            full
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string | null;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wide text-white/60 mb-1">
        {label}
      </div>
      <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-white/90">
        {value && value.trim().length > 0 ? value : "—"}
      </div>
    </div>
  );
}
