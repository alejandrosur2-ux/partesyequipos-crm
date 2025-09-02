// src/app/dashboard/page.tsx
import { supabaseServer } from "@/utils/supabase/server";

// Tipos básicos (ajústalos si tus columnas difieren)
type Payment = { id: string; amount: number | string };
type Rental = { id: string };
type Client = { id: string };
type Machine = { id: string };

export default async function Dashboard() {
  const sb = supabaseServer();

  // 1) Trae datos
  const [{ data: paymentsRaw }, { data: rentalsRaw }, { data: clientsRaw }, { data: machinesRaw }] =
    await Promise.all([
      sb.from("payments").select("id, amount"),
      sb.from("rentals").select("id"),
      sb.from("clients").select("id"),
      sb.from("machines").select("id"),
    ]);

  // 2) Normaliza para que nunca sean null
  const payments: Payment[] = (paymentsRaw ?? []) as Payment[];
  const rentals: Rental[] = (rentalsRaw ?? []) as Rental[];
  const clients: Client[] = (clientsRaw ?? []) as Client[];
  const machines: Machine[] = (machinesRaw ?? []) as Machine[];

  // 3) KPIs seguros
  const totalIngresos = payments.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );
  const totalRentas = rentals.length;
  const totalClientes = clients.length;
  const totalMaquinas = machines.length;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-zinc-400 text-sm">Ingresos (Q)</p>
          <p className="text-3xl font-bold mt-1">{totalIngresos.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-zinc-400 text-sm">Rentas</p>
          <p className="text-3xl font-bold mt-1">{totalRentas}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-zinc-400 text-sm">Clientes</p>
          <p className="text-3xl font-bold mt-1">{totalClientes}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-zinc-400 text-sm">Máquinas</p>
          <p className="text-3xl font-bold mt-1">{totalMaquinas}</p>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="text-lg font-medium mb-3">Últimos pagos</h2>
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="text-left py-2">ID</th>
              <th className="text-right py-2">Monto (Q)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {payments.length === 0 && (
              <tr>
                <td className="py-3" colSpan={2}>
                  <span className="text-zinc-400">Sin pagos aún.</span>
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="py-2">{p.id}</td>
                <td className="py-2 text-right">
                  {(Number(p.amount) || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
