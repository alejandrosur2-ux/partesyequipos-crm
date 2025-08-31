import { supabaseServer } from "@/utils/supabase/server";

type DbLine = {
  date: string;
  description: string | null;
  debit: number | null;
  credit: number | null;
};

type Line = {
  date: string;
  description: string | null;
  debit: number;
  credit: number;
  balance: number;
};

function fmt(n: number) {
  return n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function toISODate(d: Date) { return d.toISOString().slice(0, 10); }

export default async function StatementPage({
  searchParams,
}: {
  searchParams?: { client?: string; start?: string; end?: string };
}) {
  const clientId = (searchParams?.client || "").trim();
  const today = new Date();
  const dStart = new Date(today); dStart.setDate(today.getDate() - 30);
  const start = searchParams?.start || toISODate(dStart);
  const end   = searchParams?.end   || toISODate(today);

  // Sin cliente: solo formulario
  if (!clientId) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Estado de cuenta por cliente</h1>
        <FilterForm defaultClient="" defaultStart={start} defaultEnd={end} />
        <p className="text-sm text-gray-500">Ingresa el ID del cliente y un rango de fechas.</p>
      </main>
    );
  }

  const supabase = supabaseServer();

  // Cargar cliente (ajusta el nombre de la tabla si usas otra)
  const { data: client, error: cErr } = await supabase
    .from("crm_clients")
    .select("id, name")
    .eq("id", clientId)
    .maybeSingle();

  if (cErr) return <div className="p-6 text-red-600">Error: {cErr.message}</div>;
  if (!client) return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Estado de cuenta por cliente</h1>
      <FilterForm defaultClient={clientId} defaultStart={start} defaultEnd={end} />
      <div className="text-red-600">No se encontró el cliente {clientId}.</div>
    </main>
  );

  // Movimientos por cliente desde una vista unificada
  // Nota: crea en tu DB la vista v_client_statement_lines con (client_id, date, description, debit, credit)
  const { data: lines, error: lErr } = await supabase
    .from("v_client_statement_lines")
    .select("date, description, debit, credit")
    .eq("client_id", client.id)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (lErr) {
    // Si aún no has creado la vista, mostramos mensaje claro
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Estado de cuenta — {client.name}</h1>
        <FilterForm defaultClient={clientId} defaultStart={start} defaultEnd={end} />
        <div className="text-red-600">
          {lErr.message.includes("v_client_statement_lines")
            ? "Falta crear la vista v_client_statement_lines en Supabase (puedo pasarte el SQL)."
            : `Error: ${lErr.message}`
          }
        </div>
      </main>
    );
  }

  const raw: DbLine[] = (lines ?? []) as DbLine[];
  const rows: Line[] = raw.map((r) => ({
    date: r.date,
    description: r.description ?? null,
    debit: Number(r.debit ?? 0),
    credit: Number(r.credit ?? 0),
    balance: 0,
  }));

  let running = 0;
  for (const r of rows) { running += r.debit - r.credit; r.balance = running; }

  const totalDebit = rows.reduce((a, b) => a + b.debit, 0);
  const totalCredit = rows.reduce((a, b) => a + b.credit, 0);
  const saldo = totalDebit - totalCredit;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Estado de cuenta — {client.name}</h1>
      <FilterForm defaultClient={clientId} defaultStart={start} defaultEnd={end} />

      <table className="min-w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-right">Débito</th>
            <th className="p-2 text-right">Crédito</th>
            <th className="p-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sin datos</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.description || "-"}</td>
              <td className="p-2 text-right">{fmt(r.debit)}</td>
              <td className="p-2 text-right">{fmt(r.credit)}</td>
              <td className="p-2 text-right">{fmt(r.balance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t">
          <tr>
            <td colSpan={2} className="p-2 font-medium">Totales</td>
            <td className="p-2 text-right font-medium">{fmt(totalDebit)}</td>
            <td className="p-2 text-right font-medium">{fmt(totalCredit)}</td>
            <td className="p-2 text-right font-bold">{fmt(saldo)}</td>
          </tr>
        </tfoot>
      </table>
    </main>
  );
}

function FilterForm({
  defaultClient, defaultStart, defaultEnd,
}: {
  defaultClient: string; defaultStart: string; defaultEnd: string;
}) {
  return (
    <form className="grid gap-3 md:grid-cols-4" action="/reports/statement" method="get">
      <input
        name="client"
        defaultValue={defaultClient}
        className="border rounded px-2 py-1"
        placeholder="ID del cliente"
      />
      <input type="date" name="start" defaultValue={defaultStart} className="border rounded px-2 py-1" />
      <input type="date" name="end" defaultValue={defaultEnd} className="border rounded px-2 py-1" />
      <button className="px-4 py-2 bg-yellow-500 text-black rounded">Filtrar</button>
    </form>
  );
}
