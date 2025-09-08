"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

type ActionState = { ok: boolean; message: string };

const VALID_STATUS = ["disponible", "rentada", "en_reparacion"] as const;

function readPayload(fd: FormData) {
  const num = (v: FormDataEntryValue | null) =>
    v === null || v === "" ? null : Number(v);

  let status = (fd.get("status") as string) || null;
  if (status && !VALID_STATUS.includes(status as any)) {
    // normaliza por si llega "En reparación", etc.
    const map: Record<string, string> = {
      "en reparacion": "en_reparacion",
      "en_reparacion": "en_reparacion",
      "rentada": "rentada",
      "disponible": "disponible",
    };
      status = map[status.toLowerCase()] ?? "disponible";
  }

  return {
    code: (fd.get("code") as string) || null,
    name: (fd.get("name") as string) || null,
    brand: (fd.get("brand") as string) || null,
    model: (fd.get("model") as string) || null,
    serial: (fd.get("serial") as string) || null,
    type: (fd.get("type") as string) || null,
    status,
    base_rate_hour: num(fd.get("base_rate_hour")),
    base_rate_day: num(fd.get("base_rate_day")),
    fuel_consumption: num(fd.get("fuel_consumption")),
    location: (fd.get("location") as string) || null,
  };
}

export async function createMachine(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const supabase = supabaseServer();
    const payload = readPayload(fd);

    const { error } = await supabase.from("machines").insert(payload);
    if (error) throw error;

    revalidatePath("/machines");
    return { ok: true, message: "Creada" };
  } catch (e: any) {
    console.error("createMachine error:", e);
    return { ok: false, message: e?.message ?? "Error al crear" };
  }
}

export async function updateMachine(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const supabase = supabaseServer();
    const id = fd.get("id") as string;
    if (!id) throw new Error("ID requerido");

    const payload = readPayload(fd);
    const { error } = await supabase.from("machines").update(payload).eq("id", id);
    if (error) throw error;

    revalidatePath("/machines");
    revalidatePath(`/machines/${id}`);
    return { ok: true, message: "Actualizada" };
  } catch (e: any) {
    console.error("updateMachine error:", e);
    return { ok: false, message: e?.message ?? "Error al actualizar" };
  }
}

export async function deleteMachine(fd: FormData) {
  const id = fd.get("id") as string;
  const supabase = supabaseServer();
  const { error } = await supabase.from("machines").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/machines");
}
