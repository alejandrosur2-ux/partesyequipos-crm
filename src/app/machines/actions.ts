// src/app/machines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

/** Crear máquina */
export async function createMachine(formData: FormData) {
  const sb = supabaseServer();

  const payload = {
    name: (formData.get("name") as string) || null,
    serial: (formData.get("serial") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    status: (formData.get("status") as string) || null,
    location: (formData.get("location") as string) || null,
  };

  const { data, error } = await sb.from("machines").insert(payload).select("id").single();
  if (error) throw new Error("Error al crear máquina: " + error.message);

  revalidatePath("/machines");
  redirect(`/machines/${data.id}`); // al detalle recién creada
}

/** Actualizar máquina */
export async function updateMachine(formData: FormData) {
  const sb = supabaseServer();

  const id = formData.get("id") as string;
  if (!id) throw new Error("Falta id");

  const payload = {
    name: (formData.get("name") as string) || null,
    serial: (formData.get("serial") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    status: (formData.get("status") as string) || null,
    location: (formData.get("location") as string) || null,
  };

  const { error } = await sb.from("machines").update(payload).eq("id", id);
  if (error) throw new Error("Error al actualizar: " + error.message);

  revalidatePath("/machines");
  revalidatePath(`/machines/${id}`);
}

/** Eliminar máquina */
export async function deleteMachine(formData: FormData) {
  const sb = supabaseServer();
  const id = formData.get("id") as string;
  if (!id) throw new Error("Falta id");

  const { error } = await sb.from("machines").delete().eq("id", id);
  if (error) throw new Error("Error al eliminar: " + error.message);

  revalidatePath("/machines");
}
