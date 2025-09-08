// src/app/machines/[id]/edit/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import MachineForm from "../../shared/MachineForm";

type Props = { params: { id: string } };

export default async function EditMachinePage({ params }: Props) {
  const supabase = supabaseServer();
  const { data: m } = await supabase
    .from("machines")
    .select("id, code, name, brand, model, serial, status, type, base_rate_hour, base_rate_day, fuel_consumption, location")
    .eq("id", params.id)
    .maybeSingle();

  return <MachineForm mode="edit" initialData={m ?? undefined} />;
}
