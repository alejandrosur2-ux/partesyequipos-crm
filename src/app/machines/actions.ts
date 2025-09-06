"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

// helper para sanear strings
const S = (v: FormDataEntryValue | null): string | null => {
  if (!v) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

/** CREATE (ya lo tenías funcionando, lo dejo incluido para consistencia) */
export async function createMachine(
  _prev: any,
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  try {
    const sb = supabaseServer();

    let code = S(formData.get("code"));
    const name = S(formData.get("name"));
    const serial = S(formData.get("serial"));
    const brand = S(formData.get("brand"));
    const model = S(formData.get("model"));
    const status = S(formData.get("status"));
    const location = S(formData.get("location"));

    if (!name) return { ok: false, message: "El nombre es obligatorio." };
    if (!code) code = `M-${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await sb
      .from("machines")
      .insert({ code, name, serial, brand, model, status, location })
      .select("id")
      .single();

    if (error) {
      if (error.message?.toLowerCase().includes("duplicate")) {
        return { ok: false, message: "El código ya existe. Usa otro." };
      }
      return { ok: false, message: error.message };
    }

    revalidatePath("/machines");
    revalidatePath("/dashboard");
    return { ok: true, id: data.id as string };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Error al crear." };
  }
}

/** UPDATE */
export async function updateMachine(
  _prev: any,
  formData: FormData
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const sb = supabaseServer();

    const id = S(formData.get("id"));
    if (!id) return { ok: false, message: "Falta el id." };

    const code = S(formData.get("code"));
    const name = S(formData.get("name"));
    const serial = S(formData.get("serial"));
    const brand = S(formData.get("brand"));
    const model = S(formData.get("model"));
    const status = S(formData.get("status"));
    const location = S(formData.get("location"));

    // construimos objeto solo con campos presentes
    const payload: Record<string, string | null> = {};
    if (code !== null) payload.code = code;
    if (name !== null) payload.name = name;
    if (serial !== null) payload.serial = serial;
    if (brand !== null) payload.brand = brand;
    if (model !== null) payload.model = model;
    if (status !== null) payload.status = status;
    if (location !== null) payload.location = location;

    const { error } = await sb.from("machines").update(payload).eq("id", id);

    if (error) {
      if (error.message?.toLowerCase().includes("duplicate")) {
        return { ok: false, message: "El código ya existe para otra máquina." };
      }
      return { ok: false, message: error.message };
    }

    revalidatePath(`/machines/${id}`);
    revalidatePath("/machines");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Error al actualizar." };
  }
}

/** DELETE */
export async function deleteMachine(formData: FormData) {
  const id = S(formData.get("id"));
  if (!id) return;

  const sb = supabaseServer();
  await sb.from("machines").delete().eq("id", id);

  revalidatePath("/machines");
  revalidatePath("/dashboard");
  // si se elimina desde la ficha, lo mandamos a la lista
  redirect("/machines");
}
