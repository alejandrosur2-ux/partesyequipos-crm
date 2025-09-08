// src/app/machines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function getMachine(id: string) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("machines")
    .select(
      `
      id, code, name, brand, model, serial, status,
      base_rate_hour, base_rate_day, fuel_consumption,
      created_at, updated_at
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getMachine error:", error);
    throw new Error("No se pudo obtener la máquina");
  }
  if (!data) {
    throw new Error("Máquina no encontrada");
  }
  return data;
}

export async function updateMachine(formData: FormData) {
  const supabase = supabaseServer();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Falta id");

  const payload: Record<string, any> = {
    code: (formData.get("code") ?? "") || null,
    name: (formData.get("name") ?? "") || null,
    brand: (formData.get("brand") ?? "") || null,
    model: (formData.get("model") ?? "") || null,
    serial: (formData.get("serial") ?? "") || null,
  };

  // Estado: dejamos solo la columna de texto "status" para evitar choques con enums
  const statusInput = (formData.get("status") ?? "") as string;
  if (statusInput) payload.status = statusInput;

  // Campos numéricos opcionales
  const baseRateHour = (formData.get("base_rate_hour") ?? "") as string;
  const baseRateDay = (formData.get("base_rate_day") ?? "") as string;
  const fuelConsumption = (formData.get("fuel_consumption") ?? "") as string;

  if (baseRateHour !== "") payload.base_rate_hour = Number(baseRateHour);
  if (baseRateDay !== "") payload.base_rate_day = Number(baseRateDay);
  if (fuelConsumption !== "") payload.fuel_consumption = Number(fuelConsumption);

  // Intento de update con status
  let { error } = await supabase.from("machines").update(payload).eq("id", id);

  // Si falla por tema enum u otra restricción de status, reintenta sin tocar status
  if (error && /enum|check constraint|invalid input value/i.test(error.message)) {
    console.warn("updateMachine reintento sin status por error:", error.message);
    delete payload.status;
    const retry = await supabase.from("machines").update(payload).eq("id", id);
    if (retry.error) {
      console.error("updateMachine error (retry):", retry.error);
      throw new Error("No se pudo actualizar la máquina");
    }
  } else if (error) {
    console.error("updateMachine error:", error);
    throw new Error("No se pudo actualizar la máquina");
  }

  // Revalidar lista y detalle
  revalidatePath("/machines");
  revalidatePath(`/machines/${id}`);

  return { ok: true, id };
}
