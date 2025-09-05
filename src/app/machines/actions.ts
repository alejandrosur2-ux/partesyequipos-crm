// src/app/machines/actions.ts
"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Elimina una máquina por id y revalida páginas relacionadas */
export async function deleteMachine(formData: FormData) {
  const id = formData.get("id") as string | null;
  if (!id) return;

  const sb = supabaseServer();
  const { error } = await sb.from("machines").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar la máquina: ${error.message}`);
  }

  revalidatePath("/machines");
  revalidatePath("/dashboard");
}
