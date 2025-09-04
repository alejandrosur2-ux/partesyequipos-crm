// src/app/page.tsx
import { createClient } from "@/lib/supabase/server-only";

export default async function DashboardPage() {
  const sb = createClient();

  // 1) Máquinas (total)
  const { count: totalMachines = 0 } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true });

  // 2) Máquinas activas
  const { count: activeMachines = 0 } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "activo");

  // 3) Oportunidades (ejemplo si ya tienes tabla opportunities)
  const { count: totalOpportunities = 0 } = await sb
    .from("crm_opportunities")
    .select("*", { count: "exact", head: true });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4 shadow">
          <h2 className="font-semibold">Total máquinas</h2>
          <p className="text-2xl">{totalMachines}</p>
        </div>
        <div className="border rounded p-4 shadow">
          <h2 className="font-semibold">Máquinas activas</h2>
          <p className="text-2xl">{activeMachines}</p>
        </div>
        <div className="border rounded p-4 shadow">
          <h2 className="font-semibold">Oportunidades</h2>
          <p className="text-2xl">{totalOpportunities}</p>
        </div>
      </div>
    </main>
  );
}

