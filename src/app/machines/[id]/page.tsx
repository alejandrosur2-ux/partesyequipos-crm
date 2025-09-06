// src/app/machines/[id]/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import MachineEditForm from "./MachineEditForm";

type PageProps = { params: Promise<{ id: string }> };
export const runtime = "nodejs";

export default async function MachineDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer();

  const { data: machine, error } = await supabase
    .from("machines")
    .select("id, name, brand, model, serial, status_enum")
    .eq("id", id)
    .single();

  if (error || !machine) redirect("/machines");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Editar máquina</h1>

      {/* 👇 Forzamos texto oscuro dentro del card */}
      <div className="bg-white text-gray-900 rounded-lg shadow p-6">
        <MachineEditForm
          id={machine.id}
          initial={{
            name: machine.name ?? "",
            brand: machine.brand ?? "",
            model: machine.model ?? "",
            serial: machine.serial ?? "",
            status_enum: (machine.status_enum as any) ?? "disponible",
          }}
        />
      </div>
    </div>
  );
}
