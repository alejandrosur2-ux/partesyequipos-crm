'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMachine(id: string, formData: FormData) {
  const supabase = createSupabaseServerClient()

  // convierte los valores "" a null
  const payload: any = {}
  formData.forEach((value, key) => {
    payload[key] = value === '' ? null : value
  })

  const { error } = await supabase.from('machines').update(payload).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/machines')
}
