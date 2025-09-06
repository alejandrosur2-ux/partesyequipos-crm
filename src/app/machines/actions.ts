"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

/** Eliminar máquina por ID (desde el formulario en /machines) */
export async function deleteMachine(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const sb = supabaseServer();
  const { error } = await sb.from("machines").delete().eq("id", id);

  // Forzamos revalidación de las vistas relacionadas
  revalidatePath("/machines");
  revalidatePath("/dashboard");

  if (error) {
    // Puedes manejar error de otra forma si prefieres
    throw new Error(`Error eliminando máquina: ${error.message}`);
  }
}

/** Actualizar máquina (usado en la página /machines/[id]) */
export async function updateMachine(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Campos opcionales: tomamos el que venga, si no viene no lo sobreescribimos
  const patch: Record<string, any> = {};
  const fields = [
    ["name", "nombre"],
    ["serial", "serie"],
    ["brand", "marca"],
    ["model", "modelo"],
    ["status", "estado"],
    ["location", "ubicacion"], // también soporta "ubicación" si lo usas así
  ];

  for (const pair of fields) {
    // admitimos ambos nombres (ej. name / nombre)
    const val = formData.get(pair[0]) ?? formData.get(pair[1]);
    if (val != null && String(val).trim() !== "") {
      // guarda con el primer nombre del par para mantener consistencia
      patch[pair[0]] = String(val);
    }
  }

  const sb = supabaseServer();
  const { error } = await sb.from("machines").update(patch).eq("id", id);

  revalidatePath("/machines");
  revalidatePath(`/machines/${id}`);
  revalidatePath("/dashboard");

  if (error) {
    throw new Error(`Error actualizando máquina: ${error.message}`);
  }

  redirect(`/machines/${id}`);
}
