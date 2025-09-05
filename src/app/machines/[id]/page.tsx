// src/app/machines/[id]/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import MachineEditForm from "./MachineEditForm";

type Machine = {
  id: string;
  name: string | null;
  serial: string | null;
  status: string | null;
  daily_rate: number | null;
  notes: string | null;
  created_at: string | null;
};

interface Props {
  params: { id: string };
}

export default async function MachineDetailPage({ params }: Props) {
  const sb = supabaseServer();

  // 1) Cargar máquina
  const { data: machine, error } = await sb
    .from("machines")
    .select(
      "id, name, serial, status, daily_rate, notes, created_at"
    )
    .eq("id", params.id)
    .single();

  if (error || !machine) {
    redirect("/machines"); // si no existe
  }

  // 2) Acciones del servidor (editar / eliminar)
  async function updateMachine(formData: FormData) {
    "use server";

    const name = (formData.get("name") as string)?.trim() || null;
    const serial = (formData.get("serial") as string)?.trim() || null;
    const status = (formData.get("status") as string)?.trim() || null;
    const daily_rate_raw = formData.get("daily_rate") as string;
    const daily_rate =
      daily_rate_raw === "" || daily_rate_raw == null
        ? null
        : Number(daily_rate_raw);
    const notes = (formData.get("notes") as string)?.trim() || null;

    const sb = supabaseServer();
    const { error } = await sb
      .from("machines")
      .update({
        name,
        serial,
        status,
        daily_rate,
        notes,
      })
      .eq("id", params.id);

    if (error) {
      throw new Error(error.message);
    }

    // refrescar páginas relacionadas
    revalidatePath("/dashboard");
    revalidatePath(`/machines/${params.id}`);
  }

  async function deleteMachine() {
    "use server";
    const sb = supabaseServer();
    const { error } = await sb.from("machines").delete().eq("id", params.id);
    if (error) {
      throw new Error(error.message);
    }
    revalidatePath("/dashboard");
    revalidatePath("/machines");
    redirect("/machines");
  }

  // 3) UI
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          {machine.name ?? "Sin nombre"}
        </h1>

        <a
          href="/dashboard"
          className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
        >
          ← Volver
        </a>
      </div>

      {/* Tarjetas (mejora de contraste) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium text-gray-200 mb-4">
            Información
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <InfoRow label="Nombre" value={machine.name ?? "—"} />
            <InfoRow label="Serie" value={machine.serial ?? "—"} />
            <InfoRow label="Estado" value={machine.status ?? "—"} />
            <InfoRow
              label="Tarifa diaria"
              value={
                machine.daily_rate != null ? `$${machine.daily_rate}` : "—"
              }
            />
            <InfoRow
              label="Creada"
              value={
                machine.created_at
                  ? new Date(machine.created_at).toLocaleString()
                  : "—"
              }
            />
          </dl>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium text-gray-200 mb-4">
            Observaciones
          </h2>
          <p className="text-gray-200">
            {machine.notes && machine.notes.trim() !== ""
              ? machine.notes
              : "Sin observaciones."}
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-200">
          Editar máquina
        </h2>

        <form action={deleteMachine}>
          <button
            type="submit"
            className="px-3 py-2 rounded-md bg-red-600/80 hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <MachineEditForm machine={machine as Machine} action={updateMachine} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-gray-400">{label}</dt>
      <dd className="text-base font-medium text-white">{value}</dd>
    </div>
  );
}
