// src/app/dashboard/page.tsx
import { supabaseServer } from "@/utils/supabase/server";

type PaymentRow = {
  date: string;            // ISO date string
  amount: number | string | null;
};

export default async function Dashboard() {
  const sb = supabaseServer();

  // 1) Traer pagos
  const { data: payments, error } = await sb
    .from("machine_payments")
    .select("date, amount")
    .order("date", { ascending: true });

  if (error) {
    // Modo seguro: si hay error, mostramos vacíos pero no rompemos el build
    console.error("machine_payments error:", error);
  }

  // 2) Normalizar a arreglo seguro
  const safePayments: PaymentRow[] = Array.isArray(payments) ? payments : [];

  // 3) Agrupar por mes
  const map = new Map<string, number>();
  for (const p of safePayments) {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const prev = map.get(key) ?? 0;
    const val = Number(p.amount ?? 0) || 0;
    map.set(key, prev + val);
  }

  // 4) Datos para UI
  const monthlyData = Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([month, total]) => ({ month, total }));

  const totalIngresos = safePayments.reduce(
    (acc, p) => acc + (Number(p.amount ?? 0) || 0),
    0
  );

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Ingresos totales</p>
          <p className="text-xl font-bold">${totalIngresos.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Meses con actividad</p>
          <p className="text-xl font-bold">{monthlyData.length}</p>
        </div>
        {/* Agrega más tarjetas si quieres */}
      </section>

      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="text-lg font-semibold mb-4">Ingresos por mes</h2>

        {monthlyData.length === 0 ? (
          <p className="text-zinc-400">Sin datos aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[480px] w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-400 border-b border-zinc-800">
                  <th className="py-2 pr-4">Mes</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row) => (
                  <tr key={row.month} className="border-b border-zinc-900">
                    <td className="py-2 pr-4">{row.month}</td>
                    <td className="py-2">${row.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
