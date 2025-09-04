// src/app/dashboard/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server-only";

// Tipos simples para evitar nulls en cálculos
type MachineRow = {
  id: string;
  name: string | null;
  status: "activo" | "taller" | "rentada" | "baja" | null;
  daily_rate: number | null;
  created_at: string;
};

export default async function DashboardPage() {
  const sb = createClient();

  // ---- 1) KPI rápidos
  // Totales por estado (solo no eliminadas)
  const baseSelect =
    "id,name,status,daily_rate,created_at,deleted_at";

  const { data: allRows = [] } = await sb
    .from("machines")
    .select(baseSelect)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const rows = (allRows as MachineRow[]) ?? [];

  const total = rows.length;
  const activos = rows.filter((r) => r.status === "activo").length;
  const taller = rows.filter((r) => r.status === "taller").length;
  const rentadas = rows.filter((r) => r.status === "rentada").length;
  const bajas = rows.filter((r) => r.status === "baja").length;

  const tarifaProm = avg(rows.map((r) => safeNum(r.daily_rate)));

  // ---- 2) Serie mensual: altas de máquinas últimos 6 meses
  const monthsBack = 6;
  const today = new Date();
  const buckets: { label: string; count: number }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    buckets.push({ label, count: 0 });
  }

  rows.forEach((r) => {
    const d = new Date(r.created_at);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const b = buckets.find((b) => b.label === label);
    if (b) b.count += 1;
  });

  const maxY = Math.max(1, ...buckets.map((b) => b.count));

  // ---- 3) “Por cobrar / por pagar” estilo barra apilada (usamos estados como ejemplo)
  // aquí solo hacemos una demo con proporciones por estado
  const sumEstados = activos + taller + rentadas + bajas || 1;
  const segs = [
    { label: "Activo", value: activos, color: "bg-green-500" },
    { label: "Taller", value: taller, color: "bg-yellow-500" },
    { label: "Rentada", value: rentadas, color: "bg-blue-500" },
    { label: "Baja", value: bajas, color: "bg-red-500" },
  ];

  // ---- 4) Últimas máquinas creadas
  const recientes = rows.slice(0, 6);

  return (
    <main className="p-6 space-y-6">
      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickTile
          title="Máquinas"
          href="/machines"
          icon="🧰"
          color="bg-violet-600"
        />
        <QuickTile title="Reportes" href="/reports" icon="📊" color="bg-cyan-600" />
        <QuickTile
          title="Nueva máquina"
          href="/machines/new"
          icon="➕"
          color="bg-emerald-600"
        />
        <QuickTile title="Soporte" href="#" icon="💬" color="bg-teal-600" />
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Máquinas totales" value={total} />
        <Kpi title="Activas" value={activos} />
        <Kpi title="Rentadas" value={rentadas} />
        <Kpi title="Tarifa diaria promedio" value={formatMoney(tarifaProm)} />
      </section>

      {/* Gráficos y barras */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Torta simple (act/pasivo) -> usamos una “semi” torta con legendas (sin lib) */}
        <Card title="Estados (distribución)">
          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-gray-200 overflow-hidden">
              <div className="h-3 bg-green-500 inline-block"
                   style={{ width: `${(activos / sumEstados) * 100}%` }} />
              <div className="h-3 bg-yellow-500 inline-block"
                   style={{ width: `${(taller / sumEstados) * 100}%` }} />
              <div className="h-3 bg-blue-500 inline-block"
                   style={{ width: `${(rentadas / sumEstados) * 100}%` }} />
              <div className="h-3 bg-red-500 inline-block"
                   style={{ width: `${(bajas / sumEstados) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {segs.map((s) => (
                <span key={s.label} className="inline-flex items-center gap-2">
                  <span className={`w-3 h-3 rounded ${s.color}`} />
                  {s.label}: <strong>{s.value}</strong>
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Barras mensuales (SVG) */}
        <Card title="Altas de máquinas (últimos 6 meses)">
          <BarChart buckets={buckets} maxY={maxY} />
        </Card>

        {/* “Por cobrar / pagar” estilo barra (demo con estados) */}
        <Card title="Resumen rápido (proporciones por estado)">
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200 overflow-hidden">
              {segs.map((s) => (
                <div
                  key={s.label}
                  className={`h-4 ${s.color} inline-block`}
                  style={{ width: `${(s.value / sumEstados) * 100}%` }}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Total: <strong>{sumEstados}</strong> máquinas
            </div>
          </div>
        </Card>
      </section>

      {/* Tabla resumen + recientes */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Inventario (resumen)">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Con tarifa asignada</span>
              <strong>
                {rows.filter((r) => safeNum(r.daily_rate) > 0).length}
              </strong>
            </li>
            <li className="flex justify-between">
              <span>Sin tarifa</span>
              <strong>
                {rows.filter((r) => !r.daily_rate || r.daily_rate === 0).length}
              </strong>
            </li>
            <li className="flex justify-between">
              <span>Actualizado hoy</span>
              <strong>
                {
                  rows.filter((r) => isSameDay(new Date(r.created_at), new Date()))
                    .length
                }
              </strong>
            </li>
          </ul>
        </Card>

        <Card className="lg:col-span-2" title="Novedades (últimas máquinas)">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border text-left">Nombre</th>
                  <th className="p-2 border text-left">Estado</th>
                  <th className="p-2 border text-left">Tarifa diaria</th>
                  <th className="p-2 border text-left">Creada</th>
                  <th className="p-2 border text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{r.name ?? "-"}</td>
                    <td className="p-2 border">{r.status ?? "-"}</td>
                    <td className="p-2 border">{r.daily_rate ?? "-"}</td>
                    <td className="p-2 border">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-2 border text-center">
                      <Link
                        href={`/machines/${r.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {recientes.length === 0 && (
                  <tr>
                    <td className="p-3 border text-center" colSpan={5}>
                      Sin datos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </main>
  );
}

/* ---------------- UI helpers ---------------- */

function QuickTile({
  title,
  href,
  icon,
  color,
}: {
  title: string;
  href: string;
  icon: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`${color} text-white rounded-xl p-4 flex items-center justify-between shadow hover:opacity-95 transition`}
    >
      <div className="text-xl font-semibold">{title}</div>
      <div className="text-3xl">{icon}</div>
    </Link>
  );
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border p-4 bg-white ${className}`}>
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </section>
  );
}

/** Mini bar chart con SVG, sin librerías */
function BarChart({
  buckets,
  maxY,
}: {
  buckets: { label: string; count: number }[];
  maxY: number;
}) {
  const W = 520;
  const H = 180;
  const padding = 30;
  const bw = (W - padding * 2) / buckets.length - 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px]">
      {/* Ejes */}
      <line x1={padding} y1={H - padding} x2={W - padding} y2={H - padding} stroke="#e5e7eb" />
      <line x1={padding} y1={padding} x2={padding} y2={H - padding} stroke="#e5e7eb" />

      {/* Barras */}
      {buckets.map((b, i) => {
        const x = padding + i * ((W - padding * 2) / buckets.length) + 5;
        const h = maxY ? ((H - padding * 2) * b.count) / maxY : 0;
        const y = H - padding - h;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={bw} height={h} rx="4" fill="#60a5fa" />
            <text
              x={x + bw / 2}
              y={H - padding + 14}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {b.label}
            </text>
            <text
              x={x + bw / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#374151"
            >
              {b.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- utils ---------------- */

function safeNum(n: number | null | undefined) {
  return typeof n === "number" ? n : 0;
}
function avg(nums: number[]) {
  const s = nums.reduce((a, b) => a + b, 0);
  return nums.length ? s / nums.length : 0;
}
function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
