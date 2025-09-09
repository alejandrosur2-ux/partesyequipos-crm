// src/app/machines/[id]/edit/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import EditMachineForm from "./EditMachineForm";

export const dynamic = "force-dynamic"; // evitar cache
export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const supabase = supabaseServer();
  const { data: machine, error } = await supabase
    .from("machines")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("load machine error:", error);
    throw new Error("Error al cargar la máquina");
  }
  if (!machine) notFound();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar: {machine.name ?? "Máquina"}</h1>
        <div className="space-x-3">
          <Link className="underline" href={`/machines/${id}`}>Ver</Link>
          <Link className="underline" href="/machines">Ver todas</Link>
        </div>
      </div>

      {/* Client component con el formulario */}
      <EditMachineForm machine={machine} />
    </div>
  );
}
