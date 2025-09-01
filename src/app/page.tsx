export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabaseServer } from "@/utils/supabase/server";

// Utilidades
const todayStr = () => new Date().toISOString().slice(0, 10);
const monthStartStr = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const monthEndStr = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
};
const fmtMoney = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

export default async function DashboardPage() {
  const sb = supabaseServer();

  // 1) Máquinas (total)
  const { count: totalMachines = 0 } = await sb
    .from("machines")
    .select("id", { head: true, count: "exact" });

  // 2) Rentas activas hoy (start_date <= hoy y end_date >= hoy)
  const { count: activeRentals = 0 } = await sb
    .from("rentals")
    .select("id", { head: true, count: "exact" })
    .lte("start_date", todayStr())
    .gte("end_date", todayStr());

  // 3) Máquinas disponibles (si tienes columna status='Disponible')
  //   Si no usas esa columna, deja este KPI en 0 o comenta el bloque.
  let availableMachines = 0;
  {
    const { count } = await sb
      .from("machines")
      .select("id", { head: true, count: "exact" })
      .eq("status", "Disponible");
    availableMachines = count ?? 0;
  }

  // 4) Pagos del mes (suma)
  const { data: mpRows = [] } = await sb
    .from("machine_payments")
    .select("amount, date")
    .gte("date", monthStartStr())
    .lte("date", monthEndStr());

  const monthPayments = mpRows.reduce((acc: number, r: any) => acc + (Number(r.amount) || 0), 0);

  // 5) Últimos pagos (tabla)
  const { data: lastPayments = [] } = await sb
    .from("machine_payments")
    .select("date, description, amount")
    .order("date", { ascending: false })
    .limit(5);

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard — Sencillo</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-4 bg-zinc-900/40">
          <div className="text-sm text-zinc-400">Máquinas</div>
          <div className="text-3xl font-bold">{totalMachines}</div>
        </div>
        <div className="rounded-2xl border p-4 bg-zinc-900/40">
          <div className="text-sm text-zinc-400">Rentas activas (hoy)</div>
          <div className="text-3xl font-bold">{activeRentals}</div>
        </div>
        <div className="rounded-2xl border p-4 bg-zinc-900/40">
          <div className="text-sm text-zinc-400">Máquinas disponibles</div>
          <div className="text-3xl font-bold">{availableMachines}</div>
        </div>
        <div className="rounded-2xl border p-4 bg-zinc-900/40">
          <div className="text-sm text-zinc-400">Pagos del mes</div>
          <div className="text-3xl font-bold">{fmtMoney(monthPayments)}</div>
        </div>
      </div>

      {/* Últimos pagos */}
      <div className="rounded-2xl border p-4 bg-zinc-900/40">
        <h2 className="text-lg font-semibold mb-3">Últimos pagos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-zinc-400">
              <tr>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {lastPayments.length === 0 && (
                <tr>
                  <td className="py-3" colSpan={3}>
                    <span className="text-zinc-400">Sin pagos aún.</span>
                  </td>
                </tr>
              )}
              {lastPayments.map((p: any, i: number) => (
                <tr key={i}>
                  <td className="py-2 pr-4">{String(p.date)}</td>
                  <td className="py-2 pr-4">{p.description ?? "-"}</td>
                  <td className="py-2 pr-4">{fmtMoney(Number(p.amount) || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        * Este tablero lee directamente de Supabase: <code>machines</code>, <code>rentals</code> y{" "}
        <code>machine_payments</code>.
      </p>
    </main>
  );
}

