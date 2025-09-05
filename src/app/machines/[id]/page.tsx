// src/app/machines/[id]/page.tsx
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

const fmtMoney = (n: number | null | undefined) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        maximumFractionDigits: 0,
      }).format(n)
    : "-";

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Intl.DateTimeFormat("es-GT", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(iso))
    : "-";

interface Props {
  params: { id: string };
}

export default async function MachineDetailPage({ params }: Props) {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("machines")
    .select("id, name, serial, status, daily_rate, notes, created_at")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    redirect("/machines");
  }

  const m = data as Machine;

  // -------- Server Action: actualizar máquina ----------
  async function updateMachine(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string) || null;
    const serial = (formData.get("serial") as string) || null;
    const status = (formData.get("status") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    const rateRaw = formData.get("daily_rate") as string | null;
    const daily_rate =
      rateRaw && rateRaw.trim() !== "" ? Number(rateRaw) : null;

    const sb = supabaseServer();
    const { error } = await sb
      .from("machines")
      .update({ name, serial, status, daily_rate, notes })
      .eq("id", params.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/machines/${params.id}`);
    redirect(`/machines/${params.id}`);
  }

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {m.name ?? "-"}
        </h1>

        <Link
          href="/machines"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white transition-colors"
        >
          ← Volver
        </Link>
      </div>

      {/* Info + Notas */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur p-5">
          <h2 className="text-white/90 font-medium mb-4">Información</h2>

          <div className="space-y-3">
            <Row label="Nombre" value={m.name ?? "-"} />
            <Row label="Serie" value={m.serial ?? "-"} />
            <Row
              label="Estado"
              value={
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (m.status ?? "").toLowerCase() === "activo" ||
                    (m.status ?? "").toLowerCase() === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {m.status ?? "-"}
                </span>
              }
            />
            <Row label="Tarifa diaria" value={fmtMoney(m.daily_rate)} />
            <Row label="Creada" value={fmtDate(m.created_at)} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur p-5">
          <h2 className="text-white/90 font-medium mb-4">Observaciones</h2>
          <p className="text-gray-200">
            {m.notes?.trim() ? m.notes : "Sin observaciones."}
          </p>
        </div>
      </section>

      {/* Formulario de edición */}
      <section className="mt-8">
        <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white/90 font-medium">Editar datos</h2>
          </div>

          <div className="mt-4">
            <MachineEditForm
              machine={m}
              action={updateMachine}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/** Fila label/valor con buen contraste */
function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-gray-400">{label}</div>
      <div className="col-span-2 text-white">{value}</div>
    </div>
  );
}
