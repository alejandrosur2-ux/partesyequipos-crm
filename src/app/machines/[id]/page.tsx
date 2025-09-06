// src/app/machines/[id]/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import MachineEditForm from "./MachineEditForm";

type Props = { params: { id: string } };

export default async function MachineDetailPage({ params }: Props) {
  const { id } = params;
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("machines")
    .select("id, code, name, serial, brand, model, status, location, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Máquina</h1>
        <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3">
          {error ? error.message : "No encontrada"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar máquina</h1>
        <p className="text-white/60 text-sm">ID: {data.id}</p>
      </div>

      <MachineEditForm machine={data} />
    </div>
  );
}
