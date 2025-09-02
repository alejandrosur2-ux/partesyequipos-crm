// src/app/dashboard/page.tsx
import { supabaseServer } from '@/utils/supabase/server';
import MonthlyBarChart from '@/components/MonthlyBarChart';

export default async function Dashboard() {
  const sb = supabaseServer();

  // 1) Traer pagos
  const { data: paymentsRaw } = await sb.from('payments').select('amount,date');
  const payments = paymentsRaw ?? [];

  // 2) KPIs simples
  const totalIngresos = payments.reduce((a, p) => a + (Number(p.amount) || 0), 0);

  // 3) Agrupar por mes (YYYY-MM)
  const map = new Map<string, number>();
  for (const p of payments) {
    const d = new Date(p.date as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + (Number(p.amount) || 0));
  }

  // 4) Datos para tabla y gráfica
  const monthlyData = Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total }));

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400">Ingresos totales</div>
          <div className="text-3xl font-semibold">
            ${totalIngresos.toFixed(2)}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400">Meses con actividad</div>
          <div className="text-3xl font-semibold">
            {monthlyData.length}
          </div>
        </div>
      </section>

      {/* Gráfica */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Ingresos por mes</h2>
        <MonthlyBarChart data={monthlyData} />
      </section>

      {/* (Opcional) Tabla existente */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-zinc-300">Detalle (tabla)</h3>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400">
              <tr>
                <th className="text-left p-3">Mes</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {monthlyData.map((row) => (
                <tr key={row.month}>
                  <td className="p-3">{row.month}</td>
                  <td className="p-3 text-right">${row.total.toFixed(2)}</td>
                </tr>
              ))}
              {monthlyData.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-4 text-zinc-400">
                    Sin datos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
