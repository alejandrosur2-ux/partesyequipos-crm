// Server Component
import EditMachineForm from "./EditMachineForm";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = { params: { id: string } };

export default async function EditPage({ params }: PageProps) {
  const { id } = params;
  const supabase = supabaseServer();

  const { data: machine, error } = await supabase
    .from("machines")
    .select(
      "id, code, name, brand, model, serial, status, status_enum"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("edit load error:", error);
    throw new Error("Error al cargar la máquina");
  }
  if (!machine) throw new Error("Máquina no encontrada");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Editar máquina</h1>
      <EditMachineForm machine={machine} />
    </div>
  );
}
