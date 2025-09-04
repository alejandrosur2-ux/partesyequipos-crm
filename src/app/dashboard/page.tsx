// src/app/dashboard/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default async function DashboardPage() {
  const sb = supabaseServer();

  // 1) totales
  const { count: total = 0 } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true });

  const { count: activas = 0 } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "activo");

  // 2) promedio tarifa
  const { data: tarifas } = await sb
    .from("machines")
    .select("daily_rate")
    .not("daily_rate", "is", null);

  const avgRate =
    tarifas && tarifas.length
      ? tarifas.reduce((a, b) => a + (b.daily_rate || 0), 0) / tarifas.length
      : 0;

  // 3) últimas
  const { data: ultimas } = await sb
    .from("machines")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const altas6m = [
    { mes: "2025-04", total: 0 },
    { mes: "2025-05", total: 0 },
    { mes: "2025-06", total: 0 },
    { mes: "2025-07", total: 0 },
    { mes: "2025-08", total: 0 },
    { mes: "2025-09", total: total },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <section className="rounded-xl shadow-md text-white bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-sm font-medium">Máquinas</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{total}</p>
            <p className="opacity-80">Total registradas</p>
          </div>
        </section>

        <section className="rounded-xl shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-sm font-medium">Activas</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{activas}</p>
            <p className="opacity-80">En operación</p>
          </div>
        </section>

        <section className="rounded-xl shadow-md text-white bg-gradient-to-r from-green-500 to-green-600">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-sm font-medium">Rendimiento</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">0</p>
            <p className="opacity-80">En renta</p>
          </div>
        </section>

        <section className="rounded-xl shadow-md text-white bg-gradient-to-r from-teal-500 to-teal-600">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-sm font-medium">Tarifa diaria promedio</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">${avgRate.toFixed(0)}</p>
          </div>
        </section>
      </div>

      {/* Gráfica */}
      <section className="rounded-xl shadow-sm bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            Altas de máquinas (últimos 6 meses)
          </h3>
        </div>
        <div className="p-4">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={altas6m}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Novedades */}
      <section className="rounded-xl shadow-sm bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            Novedades (últimas máquinas)
          </h3>
        </div>

        <div className="p-2 md:p-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm [&_td]:text-gray-900 [&_th]:text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Tarifa diaria</th>
                  <th className="text-left p-3">Creada</th>
                  <th className="text-left p-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {ultimas?.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className="p-3 capitalize">{m.status}</td>
                    <td className="p-3">{m.daily_rate ?? "-"}</td>
                    <td className="p-3">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <a
                        href={`/machines/${m.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}

                {(!ultimas || ultimas.length === 0) && (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={5}>
                      Sin datos por ahora.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
