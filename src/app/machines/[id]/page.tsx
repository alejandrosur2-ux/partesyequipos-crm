// src/app/machines/[id]/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

interface Props {
  params: { id: string };
}

export default async function MachineDetail({ params }: Props) {
  const sb = supabaseServer();
  const { data: machine } = await sb
    .from("machines")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!machine) {
    return <div className="p-4">Máquina no encontrada</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{machine.name}</h1>
      <p><strong>Serie:</strong> {machine.serial || "-"}</p>
      <p><strong>Estado:</strong> {machine.status}</p>
      <p><strong>Tarifa diaria:</strong> {machine.daily_rate ?? "-"}</p>
      <p><strong>Creada:</strong> {new Date(machine.created_at).toLocaleString()}</p>
    </div>
  );
}
