// Server Component
import { supabaseServer } from "@/utils/supabase/server";
import IncomeBarChart, { IncomePoint } from "@/components/charts/IncomeBarChart";
import MachinePie, { Slice } from "@/components/charts/MachinePie";

async function getIncomeByMonth() {
  const sb = supabaseServer();
  // Ejemplo: trae pagos del año actual y agrupa (haz los cambios a tu tabla/campos)
  const { data = [] } = await sb
    .from("payments")
    .select("amount, date")
    .gte("date", `${new Date().getFullYear()}-01-01`);

  // Agrupar por mes (ejemplo simple)
  const map = new Map<string, number>();
  for (const p of data) {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + Number(p.amount || 0));
  }

  const arr: IncomePoint[] = Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, income]) => ({ month, income }));

  return arr;
}

async function getMachineStatus() {
  const sb = supabaseServer();
  // Ejemplo: cuenta activas/inactivas
  const { data: machines = [] } = await sb.from("machines").select("status");
  const active = machines.filter((m: any) => m.status === "ACTIVE").length;
  const idle = machines.length - active;
  const pie: Slice[] = [
    { name: "Activas", value: active },
    { name: "Inactivas", value: idle },
  ];
  return pie;
}

export default async function DashboardPage() {
  const [incomeByMonth, machineSlices] = await Promise.all([
    getIncomeByMonth(),
    getMachineStatus(),
  ]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IncomeBarChart data={incomeByMonth} />
        <MachinePie data={machineSlices} />
      </div>
    </main>
  );
}
