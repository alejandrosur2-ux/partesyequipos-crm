// src/app/dashboard/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

/** Tipado mínimo para la tabla de máquinas */
type Machine = {
  id: string;
  name: string | null;
  status: string | null;
  daily_rate: number | null;
  created_at: string | null;
};

/** Helpers de formato (moneda y fecha) */
const fmtMoney = (n: number | null | undefined) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        maximumFractionDigits: 0,
      }).format(n) + " / día"
    : "-";

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Intl.DateTimeFormat("es-GT", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(iso))
    : "-";

/** Badge de estado */
function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "").toLowerCase();
  const isActive = s === "activo" || s === "active";
  const badgeClass = isActive
    ? "bg-green-500/20 text-green-400"
    : "bg-gray-500/20 text-gray-300";
  const label = status ?? "-";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const sb = supabaseServer();

  // Conteos
  const { count: totalCount } = await sb
    .from("machines")
    .select("id", { count: "exact", head: true });

  const { count: activeCount } = await sb
    .from("machines")
    .select("id", { count: "exact", head: true })
    .in("status", ["activo", "active"]);

  const total = totalCount ?? 0;
  const activas = activeCount ?? 0;
  const actividad = total > 0 ? Math.round((activas / total) * 100) : 0;

  // Últimas máquinas (7)
  const { data: ultimasData } = await sb
    .from("machines")
    .select("id, name, status, daily_rate, created_at")
    .order("created_at", { ascending: false })
    .limit(7);

  const ultimas: Machine[] = Array.isArray(ultimasData) ? ultimasData : [];

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-white">Dashboard</h1>
      <p className="text-gray-400 mt-1">Resumen rápido de tus máquinas.</p>

      {/* Tarjetas de métricas */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-fuchsia-600/70 to-purple-700/60 border border-fuchsia-500/30">
          <div className="p-4">
            <p className="text-sm opacity-80">Máquinas</p>
            <p className="text-4xl font-bold mt-3">{total}</p>
            <p className="opacity-80 mt-1">Total registradas</p>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-600/70 to-sky-700/60 border border-blue-500/30">
          <div className="p-4">
            <p className="text-sm opacity-80">Activas</p>
            <p className="text-4xl font-bold mt-3">{activas}</p>
            <p className="opacity-80 mt-1">En operación</p>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-600/70 to-teal-700/60 border border-emerald-500/30">
          <div className="p-4">
            <p className="text-sm opacity-80">Estado</p>
            <p className="text-4xl font-bold mt-3">{actividad}%</p>
            <p className="opacity-80 mt-1">Actividad relativa</p>
          </div>
        </div>
      </section>

      {/* Tabla de novedades */}
      <section className="mt-8">
        <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur">
          <div className="px-4 py-3 border-b border-white/10">
            <h2 className="text-white/90 font-medium">
              Novedades (últimas máquinas)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-gray-300">
                <tr>
                  <th className="p-3 font-medium">Nombre</th>
                  <th className="p-3 font-medium">Estado</th>
                  <th className="p-3 font-medium">Tarifa diaria</th>
                  <th className="p-3 font-medium">Creada</th>
                  <th className="p-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="[&_td]:p-3 [&_td]:text-gray-200">
                {ultimas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-gray-500 p-4">
                      Sin datos por ahora.
                    </td>
                  </tr>
                )}

                {ultimas.map((m) => (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="font-medium">{m.name ?? "-"}</td>
                    <td>
                      <StatusBadge status={m.status} />
                    </td>
                    <td>{fmtMoney(m.daily_rate)}</td>
                    <td>{fmtDate(m.created_at)}</td>
                    <td className="text-right">
                      <Link
                        href={`/machines/${m.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs transition-colors"
                      >
                        Ver <span aria-hidden>➜</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
