// src/app/dashboard/page.tsx
import { supabaseServer } from "@/utils/supabase/server";

// --- utilidades pequeñas ---
const fmtMoney = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(
    n || 0
  );

const fmtDate = (d: string | null) =>
  d ? new Date(d).toISOString().slice(0, 10) : "—";

type RentalRow = { machine_id: string | null; status: string | null };
type PaymentRow = {
  id: string;
  amount: number | null;
  payment_date: string | null;
  method: string | null;
};

export default async function Dashboard() {
  const supabase = supabaseServer();

  // 1) Máquinas totales
  const { data: machines, error: errMachines } = await supabase
    .from("machines")
    .select("id");

  if (errMachines) {
    console.error("machines error:", errMachines);
  }

  const totalMachines = machines?.length ?? 0;

  // 2) Rentas abiertas (para disponibles y KPI “rentas activas”)
  const { data: rentalsOpen, error: errOpen } = await supabase
    .from("rentals")
    .select("machine_id,status")
    .eq("status", "abierta");

  if (errOpen) console.error("rentals open error:", errOpen);

  const openMachineIds = new Set(
    (rentalsOpen ?? [])
      .map((r: RentalRow) => r.machine_id)
      .filter((id): id is string => !!id)
  );

  const activeRentalsCount = openMachineIds.size; // máquinas con renta abierta (distintas)
  const availableMachines = Math.max(totalMachines - activeRentalsCount, 0);

  // 3) Pagos del mes actual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const { data: monthPayments, error: errMonth } = await supabase
    .from("payments")
    .select("amount,payment_date")
    .gte("payment_date", firstDay)
    .lte("payment_date", lastDay);

  if (errMonth) console.error("payments month error:", errMonth);

  const totalMonthPayments = (monthPayments ?? []).reduce(
    (a, p) => a + Number(p.amount ?? 0),
    0
  );

  // 4) Últimos pagos (tabla)
  const { data: lastPayments, error: errLast } = await supabase
    .from("payments")
    .select("id,amount,payment_date,method")
    .order("payment_date", { ascending: false })
    .limit(10);

  if (errLast) console.error("last payments error:", errLast);

  return (
    <main className="px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Dashboard — Sencillo</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-700/60 p-5">
          <div className="text-zinc-400">Máquinas</div>
          <div className="text-5xl font-semibold mt-2">{totalMachines}</div>
        </div>

        <div className="rounded-2xl border border-zinc-700/60 p-5">
          <div className="text-zinc-400">Rentas activas (hoy)</div>
          <div className="text-5xl font-semibold mt-2">{activeRentalsCount}</div>
        </div>

        <div className="rounded-2xl border border-zinc-700/60 p-5">
          <div className="text-zinc-400">Máquinas disponibles</div>
          <div className="text-5xl font-semibold mt-2">
            {availableMachines}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700/60 p-5">
          <div className="text-zinc-400">Pagos del mes</div>
          <div className="text-3xl md:text-4xl font-semibold mt-2">
            {fmtMoney(totalMonthPayments)}
          </div>
        </div>
      </div>

      {/* Últimos pagos */}
      <section className="mt-8 rounded-2xl border border-zinc-700/60 overflow-hidden">
        <div className="px-5 py-4 text-lg font-medium border-b border-zinc-700/60">
          Últimos pagos
        </div>

        {(!lastPayments || lastPayments.length === 0) && (
          <div className="px-5 py-6 text-zinc-400">Sin pagos aún.</div>
        )}

        {lastPayments && lastPayments.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-zinc-700/60">
                <th className="text-left font-normal px-5 py-3">Fecha</th>
                <th className="text-left font-normal px-5 py-3">
                  Descripción
                </th>
                <th className="text-right font-normal px-5 py-3">Monto</th>
              </tr>
            </thead>
            <tbody>
              {lastPayments.map((p: PaymentRow) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-800/50 last:border-b-0"
                >
                  <td className="px-5 py-3">{fmtDate(p.payment_date)}</td>
                  <td className="px-5 py-3">
                    {p.method ? p.method : "Pago"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {fmtMoney(Number(p.amount ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

