// src/app/dashboard/page.tsx
import { supabaseServer } from '@/utils/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default async function Dashboard() {
  const sb = supabaseServer();

  // --- Datos de rentas ---
  const { data: rentals } = await sb.from('rentals').select('id, start_date, end_date, daily_rate');
  const { data: payments } = await sb.from('machine_payments').select('id, amount, date');
  const { data: machines } = await sb.from('machines').select('id');
  const { data: clients } = await sb.from('clients').select('id');

  // KPIs
  const totalIngresos = (payments ?? []).reduce((a, p) => a + Number(p.amount || 0), 0);
  const totalRentas = rentals?.length ?? 0;
  const totalClientes = clients?.length ?? 0;
  const totalMaquinas = machines?.length ?? 0;

  // Gráfica de ingresos por mes (ejemplo)
  const ingresosPorMes: { mes: string; ingresos: number }[] = [];
  (payments ?? []).forEach((p) => {
    const mes = new Date(p.date).toISOString().slice(0, 7); // YYYY-MM
    const item = ingresosPorMes.find((i) => i.mes === mes);
    if (item) item.ingresos += Number(p.amount);
    else ingresosPorMes.push({ mes, ingresos: Number(p.amount) });
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard — Partes y Equipos</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm">Ingresos</div><div className="text-xl font-bold">Q {totalIngresos.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm">Rentas</div><div className="text-xl font-bold">{totalRentas}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm">Clientes</div><div className="text-xl font-bold">{totalClientes}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm">Máquinas</div><div className="text-xl font-bold">{totalMaquinas}</div></CardContent></Card>
      </div>

      {/* Gráfica de ingresos por mes */}
      <Card>
        <CardContent className="p-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ingresosPorMes}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
