// src/app/machines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function updateMachine(formData: FormData) {
  const id = formData.get("id") as string;
  const payload = {
    name: (formData.get("name") as string) || null,
    code: (formData.get("code") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    serial: (formData.get("serial") as string) || null,
    status: (formData.get("status") as string) || null,
    type: (formData.get("type") as string) || null,
    location: (formData.get("location") as string) || null,
    base_rate_hour: formData.get("base_rate_hour")
      ? Number(formData.get("base_rate_hour"))
      : null,
    base_rate_day: formData.get("base_rate_day")
      ? Number(formData.get("base_rate_day"))
      : null,
    fuel_consumption: formData.get("fuel_consumption")
      ? Number(formData.get("fuel_consumption"))
      : null,
  };

  const supabase = supabaseServer();
  const { error } = await supabase.from("machines").update(payload).eq("id", id);
  if (error) {
    // Deja un mensaje claro en consola del server (útil con el digest)
    console.error("updateMachine error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/machines");
  revalidatePath(`/machines/${id}`);
}
