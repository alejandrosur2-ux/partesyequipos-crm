// src/app/dashboard/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server-only";

type MachineRow = {
  id: string;
  name: string | null;
  status: "activo" | "taller" | "rentada" | "baja" | null;
  daily_rate: number | null;
  created_at: string;
  deleted_at?: string | null;
};

export default async function DashboardPage() {
  const sb = createClient();

  const { data: allRows = [] } = await sb
    .from("machines")
    .select("id,name,status,daily_rate,created_at,deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const rows = (allRows as MachineRow[]) ?? [];

  const total = rows.length;
  const activos = rows.filter((r) => r.status === "activo").length;
  const taller = rows.filter((r) => r.status === "taller").length;
  const rentadas = rows.filter((r) => r.status === "rentada").length;
  const bajas = rows.filter((r) => r.status === "baja").length;

  const tarifaProm = avg(rows.map((r) => safeNum(r.daily_rate)));

  // buckets últimos 6 meses
  const monthsBack = 6;
  const today = new Date();
  const buckets: { label: string; count: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({ label, count: 0 });
  }
  rows.forEach((r) => {
    const d = new Date(r.created_at);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const b = buckets.find((b) => b.label === label);
    if (b) b.count += 1;
  });
  const maxY = Math.max(1, ...buckets.map((b) => b.count));

  const recientes = rows.slice(0, 6);

  const segs = [
    { label: "Activo", value: activos, color: "#22c55e" },  // green-500
    { label: "Taller", value: taller, color: "#eab308" },   // yellow-500
    { label: "Rentada", value: rentadas, color: "#3b82f6" },// blue-500
    { label: "Baja", value: bajas, color: "#ef4444" },      // red-500
  ];
  const totalSegs = Math.max(1, activos + taller + rentadas + bajas);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8 space-y-6">
        {/* Quick tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickTile title="Máquinas" href="/machines" gradient="from-violet-500 to-fuchsia-500" icon={<ToolboxIcon />} />
          <QuickTile title="Reportes" href="/reports" gradient="from-cyan-500 to-sky-500" icon={<ChartIcon />} />
          <QuickTile title="Nueva máquina" href="/machines/new" gradient="from-emerald-500 to-teal-500" icon={<PlusIcon />} />
          <QuickTile title="Soporte" href="#" gradient="from-teal-600 to-emerald-600" icon={<ChatIcon />} />
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi title="Máquinas totales" value={total} />
          <Kpi title="Activas" value={activos} />
          <Kpi title="Rentadas" value={rentadas} />
          <Kpi title="Tarifa diaria promedio" value={formatMoney(tarifaProm)} />
        </section>

        {/* Chart row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Estados (distribución)">
            <DonutChart segments={segs} />
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {segs.map((s) => (
                <span key={s.label} className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  {s.label}: <strong>{s.value}</strong>
                </span>
              ))}
            </div>
          </Card>

          <Card title="Altas de máquinas (últimos 6 meses)" className="lg:col-span-2">
            <BarChart buckets={buckets} maxY={maxY} />
          </Card>
        </section>

        {/* Bottom row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Inventario (resumen)">
            <ul className="space-y-2 text-sm">
              <RowStat label="Con tarifa asignada" value={rows.filter((r) => safeNum(r.daily_rate) > 0).length} />
              <RowStat label="Sin tarifa" value={rows.filter((r) => !r.daily_rate || r.daily_rate === 0).length} />
              <RowStat
                label="Actualizado hoy"
                value={rows.filter((r) => isSameDay(new Date(r.created_at), new Date())).length}
              />
            </ul>
          </Card>

          <Card title="Novedades (últimas máquinas)" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead className="sticky top-0 bg-white/80 backdrop-blur border-b">
                  <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left text-slate-500">
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Tarifa diaria</th>
                    <th>Creada</th>
                    <th className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((r, i) => (
                    <tr key={r.id} className={`border-b ${i % 2 ? "bg-slate-50/60" : ""}`}>
                      <td className="px-3 py-2">{r.name ?? "-"}</td>
                      <td className="px-3 py-2 capitalize">{r.status ?? "-"}</td>
                      <td className="px-3 py-2">{r.daily_rate ?? "-"}</td>
                      <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        <Link href={`/machines/${r.id}`} className="text-sky-600 hover:underline">Ver</Link>
                      </td>
                    </tr>
                  ))}
                  {recientes.length === 0 && (
                    <tr>
                      <td className="p-3 text-center text-slate-500" colSpan={5}>Sin datos todavía.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

/* ---------- UI components ---------- */

function QuickTile({
  title,
  href,
  gradient,
  icon,
}: {
  title: string;
  href: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${gradient}
      flex items-center justify-between transition
      hover:shadow-xl hover:brightness-105 ring-1 ring-white/10`}
    >
      <div className="text-xl font-semibold drop-shadow-sm">{title}</div>
      <div className="opacity-90">{icon}</div>
    </Link>
  );
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur shadow-sm ring-1 ring-slate-200 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
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
    <section
      className={`rounded-2xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-slate-200 p-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function RowStat({ label, value }: { label: string; value: number | string }) {
  return (
    <li className="flex items-center justify-between border-b last:border-b-0 py-2 border-slate-100">
      <span className="text-slate-600">{label}</span>
      <strong className="text-slate-900">{value}</strong>
    </li>
  );
}

/* ---------- Charts (SVG) ---------- */

function DonutChart({
  segments,
  size = 160,
  strokeWidth = 18,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = Math.max(1, segments.reduce((a, b) => a + b.value, 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = segments.map((s) => {
    const frac = s.value / total;
    const len = circumference * frac;
    const dasharray = `${len} ${circumference - len}`;
    const arc = (
      <circle
        key={s.label}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        stroke={s.color}
        strokeWidth={strokeWidth}
        strokeDasharray={dasharray}
        strokeDashoffset={-offset}
        strokeLinecap="round"
      />
    );
    offset += len;
    return arc;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* fondo */}
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {arcs}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-slate-700"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          {total} total
        </text>
      </svg>
      <div className="hidden sm:block text-sm text-slate-600">
        <div>Distribución por estado</div>
        <div className="text-xs text-slate-500">Ultimos registros</div>
      </div>
    </div>
  );
}

function BarChart({
  buckets,
  maxY,
}: {
  buckets: { label: string; count: number }[];
  maxY: number;
}) {
  const W = 680;
  const H = 220;
  const padding = 36;
  const bw = (W - padding * 2) / buckets.length - 12;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[240px]">
      {/* grid horizontal */}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={padding}
          x2={W - padding}
          y1={H - padding - (H - padding * 2) * g}
          y2={H - padding - (H - padding * 2) * g}
          stroke="#e5e7eb"
        />
      ))}
      {/* bars */}
      {buckets.map((b, i) => {
        const x = padding + i * ((W - padding * 2) / buckets.length) + 6;
        const h = maxY ? ((H - padding * 2) * b.count) / maxY : 0;
        const y = H - padding - h;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={bw} height={h} rx="6" fill="#60a5fa" />
            <text x={x + bw / 2} y={H - padding + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
              {b.label}
            </text>
            <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#334155">
              {b.count}
            </text>
          </g>
        );
      })}
      {/* axes */}
      <line x1={padding} y1={H - padding} x2={W - padding} y2={H - padding} stroke="#cbd5e1" />
      <line x1={padding} y1={padding} x2={padding} y2={H - padding} stroke="#cbd5e1" />
    </svg>
  );
}

/* ---------- icons (inline, sin dependencias) ---------- */

function ToolboxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M7 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" stroke="white" strokeWidth="1.6" />
      <rect x="3" y="7" width="18" height="12" rx="2" stroke="white" strokeWidth="1.6" />
      <path d="M3 12h18" stroke="white" strokeWidth="1.6" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V5" stroke="white" strokeWidth="1.6" />
      <path d="M9 19V9" stroke="white" strokeWidth="1.6" />
      <path d="M14 19V12" stroke="white" strokeWidth="1.6" />
      <path d="M19 19V7" stroke="white" strokeWidth="1.6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M21 12a8 8 0 1 1-3.3-6.4L21 5l-.9 3.5A7.9 7.9 0 0 1 21 12Z" stroke="white" strokeWidth="1.6" />
    </svg>
  );
}

/* ---------- utils ---------- */

function safeNum(n: number | null | undefined) {
  return typeof n === "number" ? n : 0;
}
function avg(nums: number[]) {
  const s = nums.reduce((a, b) => a + b, 0);
  return nums.length ? s / nums.length : 0;
}
function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    n || 0
  );
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
