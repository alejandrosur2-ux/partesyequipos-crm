// src/app/machines/[id]/edit/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import MachineForm from "../../shared/MachineForm";
import { updateMachine } from "../../actions";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export default async function EditMachinePage({ params }: Params) {
  const { id } = params;
  const supabase = supabaseServer();

  const { data: m, error } = await supabase
    .from("machines")
    .select(
      "id, name, code, brand, model, serial, status, type, location, base_rate_hour, base_rate_day, fuel_consumption"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("edit load error:", error);
    throw new Error("No se pudo cargar la máquina");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Editar máquina</h1>
        <Link href={`/machines/${id}`} className="underline">Ver</Link>
        <Link href="/machines" className="underline">Volver</Link>
      </div>

      <MachineForm initial={m} action={updateMachine} submitLabel="Guardar cambios" />
    </div>
  );
}
