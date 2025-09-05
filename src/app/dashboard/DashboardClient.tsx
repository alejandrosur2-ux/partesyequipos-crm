"use client";

import dynamic from "next/dynamic";

// Cargar el gráfico solo en el cliente (nada de SSR)
const MachinesAddsBar = dynamic(
  () => import("@/components/charts/MachinesAddsBar"),
  {
    ssr: false,
    // opcional: placeholder mientras carga
    loading: () => (
      <div className="h-56 w-full grid place-items-center text-sm text-gray-500">
        Cargando gráfico…
      </div>
    ),
  }
);

type Machine = {
  id: string;
  name: string | null;
  status: string | null;
  daily_rate: number | null;
  created_at: string;
};

type Props = {
  total: number;
  activas: number;
  avgRate: number;
  ultimas: Machine[];
  altas6m: { mes: string; total: number }[];
};

export default function DashboardClient({
  total,
  activas,
  avgRate,
  ultimas,
  altas6m,
}: Props) {
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

      {/* Gráfica (carga solo en cliente) */}
      <section className="rounded-xl shadow-sm bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            Altas de máquinas (últimos 6 meses)
          </h3>
        </div>
        <div className="p-4">
          <MachinesAddsBar data={altas6m} />
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
                    <td className="p-3 capitalize">{m.status ?? "-"}</td>
                    <td className="p-3">{m.daily_rate ?? "-"}</td>
                    <td className="p-3">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString()
                        : "-"}
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
