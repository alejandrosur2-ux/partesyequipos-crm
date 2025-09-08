// src/app/machines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

// Ajusta a los valores que tu DB acepta hoy
const ALLOWED_STATUS = ["disponible", "rentada", "en_reparacion", "activo"] as const;
type Status = (typeof ALLOWED_STATUS)[number];

function pickStatus(v: FormDataEntryValue | null): Status | null {
  const s = (v ?? "").toString();
  return (ALLOWED_STATUS as readonly string[]).includes(s) ? (s as Status) : null;
}

function num(v: FormDataEntryValue | null) {
  const n = v?.toString().trim();
  return n ? Number(n) : null;
}

export async function createMachine(formData: FormData) {
  const supabase = supabaseServer();

  const payload = {
    name: (formData.get("name") as string) || null,
    code: (formData.get("code") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    serial: (formData.get("serial") as string) || null,
    status: pickStatus(formData.get("status")),
    type: (formData.get("type") as string) || null,
    location: (formData.get("location") as string) || null,
    base_rate_hour: num(formData.get("base_rate_hour")),
    base_rate_day: num(formData.get("base_rate_day")),
    fuel_consumption: num(formData.get("fuel_consumption")),
  };

  const { error } = await supabase.from("machines").insert(payload).select("id").maybeSingle();
  if (error) {
    console.error("createMachine error:", error);
    throw new Error(error.message);
  }
  revalidatePath("/machines");
}

export async function updateMachine(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("id requerido");

  const supabase = supabaseServer();
  const payload = {
    name: (formData.get("name") as string) || null,
    code: (formData.get("code") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    serial: (formData.get("serial") as string) || null,
    status: pickStatus(formData.get("status")),
    type: (formData.get("type") as string) || null,
    location: (formData.get("location") as string) || null,
    base_rate_hour: num(formData.get("base_rate_hour")),
    base_rate_day: num(formData.get("base_rate_day")),
    fuel_consumption: num(formData.get("fuel_consumption")),
  };

  const { error } = await supabase.from("machines").update(payload).eq("id", id);
  if (error) {
    console.error("updateMachine error:", error);
    throw new Error(error.message);
  }
  revalidatePath("/machines");
  revalidatePath(`/machines/${id}`);
}

export async function deleteMachine(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("id requerido");

  const supabase = supabaseServer();
  const { error } = await supabase.from("machines").delete().eq("id", id);
  if (error) {
    console.error("deleteMachine error:", error);
    throw new Error(error.message);
  }
  revalidatePath("/machines");
}
