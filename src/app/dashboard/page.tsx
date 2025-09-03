// src/app/dashboard/page.tsx
import { supabaseServer } from '@/utils/supabase/server';

type Row = {
  month: string;        // 'YYYY-MM'
  month_start: string;  // date
  total: number;
};

export default async function Dashboard() {
  const sb = supabaseServer();

  const { data: rows, error } = await sb
    .from('monthly_income')
    .select('month, month_start, total')
    .order('month_start', { ascending: true });

  if (error) {
    console.error('Error cargando monthly_income:', error.message);
  }

  const list: Row[] = rows ?? [];

  const totalIngresos = list.reduce((a, r) => a + Number(r.total ?? 0), 0);
  const mesesConActividad = list.length;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 bg-black/20">
          <div className="text-sm opacity-70">Ingresos totales</div>
          <div className="text-3xl font-bold">
            {totalIngresos.toLocaleString('es-GT', { style: 'currency', currency: 'USD' })}
          </div>
        </div>

        <div className="rounded-2xl border p-4 bg-black/20">
          <div className="text-sm opacity-70">Meses con actividad</div>
          <div className="text-3xl font-bold">{mesesConActividad}</div>
        </div>
      </div>

      <section className="rounded-2xl border p-4 bg-black/20">
        <h2 className="text-xl font-semibold mb-3">Ingresos por mes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Mes</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center opacity-60">Sin datos aún.</td>
                </tr>
              ) : (
                list.map(r => (
                  <tr key={r.month} className="border-t border-white/10">
                    <td className="py-2">{r.month}</td>
                    <td className="py-2 text-right">
                      {Number(r.total).toLocaleString('es-GT', { style: 'currency', currency: 'USD' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
