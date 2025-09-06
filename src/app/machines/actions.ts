"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

// Normaliza string opcional
const S = (v: FormDataEntryValue | null): string | null => {
  if (!v) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

export async function createMachine(
  _prevState: any,
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  try {
    const sb = supabaseServer();

    // Campos
    let code = S(formData.get("code"));
    const name = S(formData.get("name"));
    const serial = S(formData.get("serial"));
    const brand = S(formData.get("brand"));
    const model = S(formData.get("model"));
    const status = S(formData.get("status"));
    const location = S(formData.get("location"));

    // Validación mínima
    if (!name) return { ok: false, message: "El nombre es obligatorio." };

    // Si no viene code, generamos uno para cumplir NOT NULL
    if (!code) {
      code = `M-${Date.now().toString(36).toUpperCase()}`;
    }

    const { data, error } = await sb
      .from("machines")
      .insert({
        code, // NOT NULL en DB
        name,
        serial,
        brand,
        model,
        status,
        location,
      })
      .select("id")
      .single();

    if (error) {
      // Mensaje más amigable para posibles violaciones de unique
      if (error.message?.toLowerCase().includes("duplicate")) {
        return { ok: false, message: "El código ya existe. Usa otro código." };
      }
      return { ok: false, message: error.message || "No se pudo crear la máquina." };
    }

    revalidatePath("/machines");
    revalidatePath("/dashboard");

    return { ok: true, id: data.id as string };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Error inesperado al crear la máquina." };
  }
}
