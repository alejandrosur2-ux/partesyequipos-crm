// src/app/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server-only";

export default async function DashboardPage() {
  const sb = createClient();

  // Trae conteos
  const [allRes, activeRes] = await Promise.all([
    sb.from("machines").select("*", { count: "exact", head: true }),
    sb
      .from("machines")
      .select("*", { count: "exact", head: true })
      .eq("status", "activo"),
  ]);

  // Asegura números (no null)
  const total = allRes.count ?? 0;
  const activas = activeRes.count ?? 0;

  // Últimas 8 máquinas
  const { data: recent } = await sb
    .from("machines")
    .select("id,name,serial,status,daily_rate,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel general</h1>
        <div className="flex gap-2">
          <Link
            href="/machines/new"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Nueva máquina
          </Link>
          <Link
            href="/machines"
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Ver todas
          </Link>
        </div>
      </header>

      {/* Métricas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Máquinas totales" value={total} />
        <StatCard title="Máquinas activas" value={activas} />
        <StatCard title="Inactivas" value={Math.max(total - activas, 0)} />
      </section>

      {/* Últimas máquinas */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Últimas máquinas</h2>
        {recent && recent.length > 0 ? (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Nombre</th>
                <th className="p-2 border text-left">Serie</th>
                <th className="p-2 border text-left">Estado</th>
                <th className="p-2 border text-left">Tarifa diaria</th>
                <th className="p-2 border text-left">Creada</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{m.name}</td>
                  <td className="p-2 border">{m.serial ?? "-"}</td>
                  <td className="p-2 border">{m.status}</td>
                  <td className="p-2 border">{m.daily_rate ?? "-"}</td>
                  <td className="p-2 border">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2 border text-center">
                    <Link
                      href={`/machines/${m.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

// ---- UI helpers ----
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="border rounded p-4 shadow-sm">
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border rounded p-6 text-center">
      <p className="mb-2">Aún no hay máquinas.</p>
      <Link
        href="/machines/new"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
      >
        Crear la primera
      </Link>
    </div>
  );
}
