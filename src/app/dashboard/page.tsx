export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabaseServer } from "@/utils/supabase/server";

async function getKpis() {
  const sb = supabaseServer();
  const { count } = await sb.from("machines").select("id", { head: true, count: "exact" });
  return { machines: count ?? 0 };
}

export default async function DashboardPage() {
  const kpis = await getKpis();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-4 bg-zinc-900/40">
          <div className="text-sm text-zinc-400">Máquinas</div>
          <div className="text-3xl font-bold">{kpis.machines}</div>
        </div>
      </div>
    </main>
  );
}
