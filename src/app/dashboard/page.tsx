// src/app/dashboard/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// ------- utilidades locales (sin archivo extra) -------
const fmtQ = (n: number | null | undefined) => `Q ${Number(n ?? 0).toFixed(2)}`;
const since = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "justo ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const dxy = Math.floor(h / 24);
  return `${dxy} d`;
};
// ------------------------------------------------------

type Machine = {
  id: string;
  name: string | null;
  serial: string | null;
  status: string | null;
  daily_rate: number | null;
  created_at: string | null;
};

export default async function DashboardPage() {
  const sb = supabaseServer();

  const { count: totalRaw } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true });

  const { count: actRaw } = await sb
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const total = totalRaw ?? 0;
  const activas = actRaw ?? 0;
  const actividad = total > 0 ? Math.round((activas / total) * 100) : 0;

  const { data: ultimasRaw } = await sb
    .from("machines")
    .select("id,name,serial,status,daily_rate,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const ultimas: Machine[] = ultimasRaw ?? [];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Panel general
          </h1>
          <Link
            href="/machines/new"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
          >
            + Nueva máquina
          </Link>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-gray-900/60 p-5">
            <p className="text-sm text-gray-300">Máquinas totales</p>
            <p className="mt-1 text-3xl font-bold">{total}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-gray-900/60 p-5">
            <p className="text-sm text-gray-300">Activas</p>
            <p className="mt-1 text-3xl font-bold">{activas}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-gray-900/60 p-5">
            <p className="text-sm text-gray-300">Actividad</p>
            <p className="mt-1 text-3xl font-bold">{actividad}%</p>
          </div>
        </section>

        {/* Novedades / Últimas máquinas */}
        <section className="rounded-xl border border-white/10 bg-gray-900/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-medium">Novedades · últimas máquinas</h2>
            <Link
              href="/machines"
              className="text-sm underline-offset-4 hover:underline text-gray-300"
            >
              Ver todas
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/70">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left text-gray-200">
                  <th>Nombre</th>
                  <th>Serie</th>
                  <th>Estado</th>
                  <th>Tarifa</th>
                  <th>Creada</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-t [&>tr]:border-white/10">
                {ultimas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-300">
                      Sin datos por ahora.
                    </td>
                  </tr>
                )}

                {ultimas.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-gray-100">{m.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-200">{m.serial ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                          m.status === "active"
                            ? "bg-emerald-600/20 text-emerald-200 border border-emerald-500/30"
                            : "bg-amber-600/20 text-amber-200 border border-amber-500/30",
                        ].join(" ")}
                      >
                        {m.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-200">{fmtQ(m.daily_rate)}</td>
                    <td className="px-4 py-3 text-gray-300">{since(m.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/machines/${m.id}`}
                          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 hover:bg-white/20 transition"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/machines/${m.id}?edit=1`}
                          className="rounded-lg border border-sky-400/30 text-sky-200 bg-sky-500/10 px-3 py-1.5 hover:bg-sky-500/20 transition"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
