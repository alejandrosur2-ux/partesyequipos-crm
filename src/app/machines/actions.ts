"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

/** Crea una máquina */
export async function createMachine(formData: FormData) {
  const sb = supabaseServer();

  // tomar valores (aceptamos español/inglés en nombres)
  const get = (a: string, b?: string) =>
    String((formData.get(a) ?? (b ? formData.get(b) : "")) || "").trim() || null;

  const record = {
    name: get("name", "nombre"),
    serial: get("serial", "serie"),
    brand: get("brand", "marca"),
    model: get("model", "modelo"),
    status: get("status", "estado"),
    location: get("location", "ubicacion"),
  };

  const { data, error } = await sb.from("machines").insert(record).select("id").single();

  if (error) {
    // haz que el error se vea en el navegador/vercel
    throw new Error(`Error creando máquina: ${error.message}`);
  }

  revalidatePath("/machines");
  revalidatePath("/dashboard");

  if (data?.id) {
    redirect(`/machines/${data.id}`);
  } else {
    redirect("/machines");
  }
}

/** Elimina una máquina por id */
export async function deleteMachine(formData: FormData) {
  const sb = supabaseServer();
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Falta id de máquina.");
  }

  const { error } = await sb.from("machines").delete().eq("id", id);

  if (error) {
    throw new Error(`Error eliminando máquina: ${error.message}`);
  }

  revalidatePath("/machines");
  revalidatePath("/dashboard");
  redirect("/machines");
}
