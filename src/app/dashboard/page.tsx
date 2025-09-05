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

  // Total
  const { count: totalCount } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true });
  const total = totalCount ?? 0;

  // Activas
  const { count: activeCount } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  const activas = activeCount ?? 0;

  // Últimas
  const { data: ultimasRaw } = await sb
    .from("machines")
    .select("id,name,status,daily_rate,created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  const ultimas: MachineRow[] = (ultimasRaw ?? []) as MachineRow[];

  const actividadPct = total > 0 ? Math.round((activas / total) * 100) : 0;

  const fmt = new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Título */}
        <header>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-neutral-300">
            Resumen rápido de tus máquinas.
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl shadow-md text-white bg-gradient-to-r from-purple-600 to-purple-500">
            <div className="p-4 border-b border-white/20">
              <h3 className="text-sm font-medium">Máquinas</h3>
            </div>
            <div className="p-5">
              <p className="text-4xl font-bold leading-tight">{total}</p>
              <p className="opacity-90">Total registradas</p>
            </div>
          </div>

          <div className="rounded-xl shadow-md text-white bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="p-4 border-b border-white/20">
              <h3 className="text-sm font-medium">Activas</h3>
            </div>
            <div className="p-5">
              <p className="text-4xl font-bold leading-tight">{activas}</p>
              <p className="opacity-90">En operación</p>
            </div>
          </div>

          <div className="rounded-xl shadow-md text-white bg-gradient-to-r from-teal-600 to-teal-500">
            <div className="p-4 border-b border-white/20">
              <h3 className="text-sm font-medium">Estado</h3>
            </div>
            <div className="p-5">
              <p className="text-4xl font-bold leading-tight">
                {actividadPct}%
              </p>
              <p className="opacity-90">Actividad relativa</p>
            </div>
          </div>
        </section>

        {/* Tabla Novedades */}
        <section className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/60 backdrop-blur">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-200">
              Novedades (últimas máquinas)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/80 sticky top-0 backdrop-blur z-10">
                <tr className="[&_th]:text-left [&_th]:px-4 [&_th]:py-3 [&_th]:text-neutral-200">
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Tarifa diaria</th>
                  <th>Creada</th>
                  <th className="text-right pr-6">Acción</th>
                </tr>
              </thead>

              <tbody className="[&_td]:px-4 [&_td]:py-3">
                {ultimas.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-neutral-400 px-4 py-6 text-center"
                    >
                      Sin datos por ahora.
                    </td>
                  </tr>
                )}

                {ultimas.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`${
                      i % 2 === 0 ? "bg-neutral-900/30" : "bg-neutral-900/10"
                    } hover:bg-neutral-800/40 transition-colors border-t border-neutral-850`}
                  >
                    <td className="font-medium text-neutral-50">
                      {m.name ?? "-"}
                    </td>
                    <td className="capitalize text-neutral-200">
                      {m.status ?? "-"}
                    </td>
                    <td className="text-neutral-200">
                      {m.daily_rate ?? "-"}
                    </td>
                    <td className="text-neutral-200">
                      {m.created_at ? fmt.format(new Date(m.created_at)) : "-"}
                    </td>
                    <td className="text-right pr-6">
                      <a
                        href={`/machines/${m.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-500/40 px-3 py-1 text-blue-300 hover:text-white hover:bg-blue-600/20 transition-colors"
                      >
                        Ver
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                        >
                          <path d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
