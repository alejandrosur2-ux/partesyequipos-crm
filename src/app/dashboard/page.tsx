// src/app/dashboard/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default async function DashboardPage() {
  const sb = supabaseServer();

  // 1) Contar máquinas
  const { count: total = 0 } = await sb.from("machines").select("*", { count: "exact", head: true });
  const { count: activas = 0 } = await sb.from("machines").select("*", { count: "exact", head: true }).eq("status", "activo");

  // 2) Promedio de tarifa
  const { data: tarifas } = await sb.from("machines").select("daily_rate").not("daily_rate", "is", null);
  const avgRate = tarifas && tarifas.length > 0 ? tarifas.reduce((a, b) => a + (b.daily_rate || 0), 0) / tarifas.length : 0;

  // 3) Últimas máquinas
  const { data: ultimas } = await sb.from("machines").select("*").order("created_at", { ascending: false }).limit(6);

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md">
          <CardHeader>
            <CardTitle>Máquinas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
            <p>Total registradas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
          <CardHeader>
            <CardTitle>Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activas}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
          <CardHeader>
            <CardTitle>Rendimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p>En renta</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md">
          <CardHeader>
            <CardTitle>Tarifa promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${avgRate.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Altas de máquinas (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { mes: "2025-04", total: 0 },
                  { mes: "2025-05", total: 0 },
                  { mes: "2025-06", total: 0 },
                  { mes: "2025-07", total: 0 },
                  { mes: "2025-08", total: 0 },
                  { mes: "2025-09", total: total },
                ]}
              >
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Novedades */}
      <Card>
        <CardHeader>
          <CardTitle>Novedades (últimas máquinas)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="[&_td]:text-gray-900 [&_th]:text-gray-700 [&_tr]:hover:bg-gray-50">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Tarifa diaria</th>
                  <th className="text-left p-2">Creada</th>
                  <th className="text-left p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {ultimas?.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-2 font-medium">{m.name}</td>
                    <td className="p-2">{m.status}</td>
                    <td className="p-2">{m.daily_rate ?? "-"}</td>
                    <td className="p-2">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="p-2">
                      <a href={`/machines/${m.id}`} className="text-blue-600 hover:underline">
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
