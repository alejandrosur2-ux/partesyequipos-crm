// src/app/machines/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

/** Eliminar máquina por id */
export async function deleteMachine(formData: FormData) {
  const id = formData.get('id') as string | null;
  if (!id) return { ok: false, error: 'Falta id' };

  const sb = supabaseServer();
  const { error } = await sb.from('machines').delete().eq('id', id);

  if (error) {
    return { ok: false, error: error.message };
  }

  // Revalidar páginas relacionadas
  revalidatePath('/machines');
  revalidatePath('/dashboard');
  return { ok: true };
}
