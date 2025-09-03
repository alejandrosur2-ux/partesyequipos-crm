// src/app/dashboard/page.tsx
import { supabaseServer } from "@/utils/supabase/server";

type PaymentRow = {
  id: string;
  amount: number | string;
  payment_date: string | null;
  method: string | null;
  note: string | null;
};

export default async function Dashboard() {
  const sb = supabaseServer();

  // Máquinas totales
  const { count: machinesCount } = await sb
    .from("machines")
    .select("id", { count: "exact", head: true });

  // Rentas activas hoy (status = 'abierta')
  const { count: activeRentalsToday } = await sb
    .from("rentals")
    .select("id", { count: "exact", head: true })
    .eq("status", "abierta");

  // Máquinas disponibles (status = 'Disponible')
  const { count: availableMachines } = await sb
    .from("machines")
    .select("id", { count: "exact", head: true })
    .eq("status", "Disponible");

  // Pagos del mes actual
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    .toISOString()
    .slice(0, 10);

  const { data: paymentsThisMonth } = await sb
    .from("payments")
    .select("amount,payment_date")
    .gte("payment_date", monthStart)
    .lt("payment_date", nextMonthStart);

  const monthTotal = (paymentsThisMonth ?? []).reduce(
    (a, p) => a + Number(p.amount || 0),
    0
  );

  // Últimos pagos (3 recientes)
  const { data: lastPayments } = await sb
    .from("payments")
    .select("id,amount,payment_date,method,note")
    .order("payment_date", { ascending: false })
    .limit(3);

  const recent: PaymentRow[] = (lastPayments ?? []).map((p) => ({
    id: String(p.id),
    amount: p.amount,
    payment_date: p.payment_date,
    method: p.method,
    note: p.note,
  }));

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

  const fmtDate = (d: string | null) => (d ? d : "—");

  // Mini “Card” sin dependencia externa
  const Box = ({
    title,
    value,
  }: {
    title: string;
    value: string | number;
  }) => (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-4xl font-bold mt-2">{value}</div>
      </div>
    </div>
  );

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard — Sencillo</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Box title="Máquinas" value={machinesCount ?? 0} />
        <Box title="Rentas activas (hoy)" value={activeRentalsToday ?? 0} />
        <Box title="Máquinas disponibles" value={availableMachines ?? 0} />
        <Box title="Pagos del mes" value={fmt(monthTotal)} />
      </div>

      {/* Últimos pagos */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Últimos pagos</h2>
          <div className="grid grid-cols-12 text-sm text-muted-foreground border-b border-border pb-2">
            <div className="col-span-3">Fecha</div>
            <div className="col-span-6">Descripción</div>
            <div className="col-span-3 text-right">Monto</div>
          </div>
          <div className="divide-y divide-border">
            {(recent.length ? recent : []).map((p) => (
              <div key={p.id} className="grid grid-cols-12 py-3 items-center">
                <div className="col-span-3">{fmtDate(p.payment_date)}</div>
                <div className="col-span-6">
                  {p.note || (p.method ? `Pago ${p.method}` : "Pago")}
                </div>
                <div className="col-span-3 text-right">
                  {fmt(Number(p.amount || 0))}
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <div className="py-6 text-muted-foreground">Sin pagos aún.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
