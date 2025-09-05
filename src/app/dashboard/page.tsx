// src/app/dashboard/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

type MachineRow = {
  id: string;
  name: string | null;
  status: string | null;
  daily_rate: number | null;
  created_at: string;
};

export const revalidate = 0;

export default async function DashboardPage() {
  const sb = supabaseServer();

  // Total de máquinas
  const { count: totalCount, error: totalErr } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true });
  if (totalErr) console.error("Error total machines:", totalErr);
  const total: number = totalCount ?? 0;

  // Máquinas activas
  const { count: activeCount, error: actErr } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  if (actErr) console.error("Error active machines:", actErr);
  const activas: number = activeCount ?? 0;

  // Últimas máquinas
  const { data: ultimasRaw, error: lastErr } = await sb
    .from("machines")
    .select("id,name,status,daily_rate,created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (lastErr) console.error("Error latest machines:", lastErr);

  // NORMALIZACIÓN: garantizamos array no-nulo
  const ultimas: MachineRow[] = (ultimasRaw ?? []) as MachineRow[];

  const actividadPct = total > 0 ? Math.round((activas / total) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Resumen rápido de tus máquinas.</p>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl shadow-md text-white bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-sm font-medium">Máquinas</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{total}</p>
            <p className="opacity-80">Total registradas</p>
          </div>
        </div>

        <div className="rounded-xl shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-sm font-medium">Activas</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{activas}</p>
            <p className="opacity-80">En operación</p>
          </div>
        </div>

        <div className="rounded-xl shadow-md text-white bg-gradient-to-r from-teal-500 to-teal-600">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-sm font-medium">Estado</h3>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold">{actividadPct}%</p>
            <p className="opacity-80">Actividad relativa</p>
          </div>
        </div>
      </section>

      {/* Tabla de novedades */}
      <section className="rounded-xl shadow-sm bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            Novedades (últimas máquinas)
          </h3>
        </div>

        <div className="p-2 md:p-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="[&_th]:text-left [&_th]:p-3 [&_th]:text-gray-700">
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Tarifa diaria</th>
                  <th>Creada</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody className="[&_td]:p-3 [&_td]:text-gray-900">
                {ultimas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-gray-500">
                      Sin datos por ahora.
                    </td>
                  </tr>
                )}

                {ultimas.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="font-medium">{m.name ?? "-"}</td>
                    <td className="capitalize">{m.status ?? "-"}</td>
                    <td>{m.daily_rate ?? "-"}</td>
                    <td>
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <a
                        href={`/machines/${m.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
