"use server";

import { revalidatePath, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function updateMachine(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const payload = {
    name: (formData.get("name") as string) || null,
    code: (formData.get("code") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    serial: (formData.get("serial") as string) || null,

    // Usa el ENUM correcto de tu DB:
    // opciones válidas: 'disponible' | 'rentada' | 'en_reparacion'
    status_enum: (formData.get("status_enum") as
      | "disponible"
      | "rentada"
      | "en_reparacion"
      | null) || null,

    // (opcional) si aún muestras 'status' textual en la tabla:
    status: (formData.get("status") as string) || null,
  };

  const supabase = supabaseServer();
  const { error } = await supabase.from("machines").update(payload).eq("id", id);

  if (error) {
    console.error("updateMachine error:", error);
    throw new Error("No se pudo guardar la máquina");
  }

  // refresca listado y vuelve a la página de detalle
  revalidatePath("/machines");
  redirect(`/machines/${id}`);
}
