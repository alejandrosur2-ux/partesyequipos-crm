"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

type ActionState = { ok: boolean; message: string };

export async function createMachine(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const supabase = supabaseServer();
    const payload = readPayload(formData);

    if (!["disponible", "rentada", "en_reparacion"].includes(payload.status ?? "")) {
      payload.status = "disponible";
    }

    const { error } = await supabase.from("machines").insert(payload);
    if (error) throw error;

    revalidatePath("/machines");
    return { ok: true, message: "Creada" };
  } catch (e: any) {
    console.error("createMachine error:", e);
    return { ok: false, message: e.message ?? "Error al crear" };
  }
}

export async function updateMachine(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const supabase = supabaseServer();
    const id = formData.get("id") as string;
    if (!id) throw new Error("ID requerido");

    const payload = readPayload(formData);
    if (!["disponible", "rentada", "en_reparacion"].includes(payload.status ?? "")) {
      delete payload.status;
    }

    const { error } = await supabase.from("machines").update(payload).eq("id", id);
    if (error) throw error;

    revalidatePath("/machines");
    revalidatePath(`/machines/${id}`);
    return { ok: true, message: "Actualizada" };
  } catch (e: any) {
    console.error("updateMachine error:", e);
    return { ok: false, message: e.message ?? "Error al actualizar" };
  }
}

function readPayload(fd: FormData) {
  const num = (v: FormDataEntryValue | null) =>
    v === null || v === "" ? null : Number(v);

  return {
    code: (fd.get("code") as string) || null,
    name: (fd.get("name") as string) || null,
    brand: (fd.get("brand") as string) || null,
    model: (fd.get("model") as string) || null,
    serial: (fd.get("serial") as string) || null,
    type: (fd.get("type") as string) || null,
    status: (fd.get("status") as string) || null,
    base_rate_hour: num(fd.get("base_rate_hour")),
    base_rate_day: num(fd.get("base_rate_day")),
    fuel_consumption: num(fd.get("fuel_consumption")),
    location: (fd.get("location") as string) || null,
  };
}
