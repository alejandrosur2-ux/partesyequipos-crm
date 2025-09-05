// src/app/machines/actions.ts
"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Fuerza runtime Node (importante con Supabase) */
export const runtime = "nodejs";

/** Elimina una máquina por id y revalida páginas relacionadas */
export async function deleteMachine(formData: FormData) {
  const id = formData.get("id") as string | null;
  if (!id) return;

  const sb = supabaseServer();
  const { error } = await sb.from("machines").delete().eq("id", id);

  // Si falla, lanza para que el boundary lo muestre en desarrollo
  if (error) {
    throw new Error(`No se pudo eliminar la máquina: ${error.message}`);
  }

  revalidatePath("/machines");
  revalidatePath("/dashboard");
}
