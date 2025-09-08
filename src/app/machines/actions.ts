// src/app/machines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function updateMachine(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Falta id");

  const payload = {
    name: toStr(formData.get("name")),
    code: toStr(formData.get("code")),
    brand: toStr(formData.get("brand")),
    model: toStr(formData.get("model")),
    serial: toStr(formData.get("serial")),
    type: toStr(formData.get("type")),
    location: toStr(formData.get("location")),
    status: toStr(formData.get("status")), // usar exactamente los valores válidos en tu BD
    base_rate_hour: toNum(formData.get("base_rate_hour")),
    base_rate_day: toNum(formData.get("base_rate_day")),
    fuel_consumption: toNum(formData.get("fuel_consumption")),
    updated_at: new Date().toISOString(),
  };

  // elimina campos undefined para no pisar con null
  Object.keys(payload).forEach((k) => {
    // @ts-ignore
    if (payload[k] === undefined) delete payload[k];
  });

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("machines")
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    console.error("updateMachine error:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/machines/${id}`);
  revalidatePath(`/machines`);
  redirect(`/machines/${id}`);
}

function toStr(v: FormDataEntryValue | null) {
  const s = v?.toString().trim();
  return s ? s : null;
}
function toNum(v: FormDataEntryValue | null) {
  const s = v?.toString().trim();
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
