"use server";

import { supabaseServer } from "@/lib/supabase/server";

type ActionState =
  | { ok: true; id: string }
  | { ok: false; message: string };

export async function createMachine(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const sb = supabaseServer();

    const name = (formData.get("name") || "").toString().trim();
    const serial = (formData.get("serial") || "").toString().trim();
    const brand = (formData.get("brand") || "").toString().trim();
    const model = (formData.get("model") || "").toString().trim();
    const status = (formData.get("status") || "").toString().trim();
    const location = (formData.get("location") || "").toString().trim();

    // Validación mínima para evitar nulls raros
    if (!name) {
      return { ok: false, message: "El nombre es obligatorio." };
    }

    const { data, error } = await sb
      .from("machines")
      .insert([{ name, serial, brand, model, status, location }])
      .select("id")
      .single();

    if (error) {
      return { ok: false, message: `Supabase: ${error.message}` };
    }

    if (!data?.id) {
      return { ok: false, message: "No se recibió el ID creado." };
    }

    return { ok: true, id: data.id };
  } catch (e: any) {
    return {
      ok: false,
      message: e?.message ?? "Error inesperado creando la máquina.",
    };
  }
}
