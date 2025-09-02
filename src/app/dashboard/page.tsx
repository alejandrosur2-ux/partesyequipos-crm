// src/app/dashboard/page.tsx
import { supabaseServer } from '@/utils/supabase/server';

type Payment = { amount: number | string; date: string };
type Rental = { id: string };
type Simple = { id: string };

export default async function Dashboard() {
  const sb = supabaseServer();

  // Carga de datos (seguras con fallback)
  const { data: rentals = [] } = await sb.from('rentals').select('id') as { data: Rental[] | null };
  const { data: payments = [] } = await sb.from('machine_payments').select('amount, date') as { data: Payment[] | null };
  const { data: machines = [] } = await sb.from('machines').select('id') as { data: Simple[] | null };
  const { data: clients = [] } = await sb.from('clients').select('id') as { data: Simple[] | null };

  // KPIs
  const totalIngresos = payments.reduce((a, p) => a + (Number(p.amount) || 0), 0);
  const totalRentas = rentals.length;
  const totalClientes = clients.length;
  const totalMaquinas = machines.length;

  // Serie simple de ingresos por mes (YYYY-MM)
  const mapMeses = new Map<string, number>();
  for (const p of payments) {
    const mes = new Date(p.date).toISOString().slice(0, 7);
    mapMeses.set(mes, (mapMeses.get(mes) || 0) + (Number(p.amount) || 0));
  }
  const ingresosPorMes = Array.from(mapMeses.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([mes, ingresos]) => ({ mes, ingresos }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard — Partes y Equipos</h1>

      {/* KPIs con solo Tailwind */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400">Ingresos</div>
          <div className="text-2xl font-bold">Q {totalIngresos.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400">Rentas</div>
          <div className="text-2xl font-bold">{totalRentas}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400">Clientes</div>
          <div className="text-2xl font-bold">{totalClientes}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400">Máquinas</div>
          <div className="text-2xl font-bold">{totalMaquinas}</div>
        </div>
      </div>

      {/* Placeholder de gráfica si aún no está `recharts` */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-2 text-sm text-zinc-400">Ingresos por mes</div>
        <pre className="text-xs overflow-auto whitespace-pre-wrap">
{JSON.stringify(ingresosPorMes, null, 2)}
        </pre>
        <p className="mt-2 text-xs text-zinc-500">
          (Esto se mostrará como gráfica cuando instalemos <code>recharts</code>).
        </p>
      </div>
    </div>
  );
}
