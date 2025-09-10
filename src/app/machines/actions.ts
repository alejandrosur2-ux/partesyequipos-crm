'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function normalize(formData: FormData) {
  const obj: Record<string, any> = {}
  formData.forEach((v, k) => { obj[k] = v === '' ? null : v })
  return obj
}

export async function createMachine(formData: FormData) {
  const supabase = createSupabaseServerClient()
  const payload = normalize(formData)
  const { error } = await supabase.from('machines').insert(payload)
  if (error) throw new Error(error.message)
  revalidatePath('/machines')
}

export async function updateMachine(id: string, formData: FormData) {
  const supabase = createSupabaseServerClient()
  const payload = normalize(formData)
  const { error } = await supa
