import Link from "next/link";
import { supabaseServer } from "@/utils/supabase/server";



function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

type RawLine = {
  date: string;
  description: string | null;
  source: string;
  debit: number | null;
  credit: number | null;
};

type Line = {
  source: string;
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

export default async function MachineStatementPage({
  searchParams,
}: { searchParams?: { code?: string; start?: string; end?: string } }) {
  const code = (searchParams?.code || "").trim();
  const today = new Date();
  const dStart = new Date(today); dStart.setDate(today.getDate() - 30);
  const start = searchParams?.start || toISODate(dStart);
  const end   = searchParams?.end   || toISODate(today);

  if (!code) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Estado por máquina</h1>
        <p className="text-sm text-gray-500">Agrega ?code=EXC-001 a la URL o usa el formulario.</p>
        <FilterForm defaultCode="" defaultStart={start} defaultEnd={end} />
      </main>
    );
  }

  const supabase = supabaseServer();

  const { data: m, error: mErr } = await supabase
    .from("machines")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  if (mErr) return <div className="p-6 text-red-600">Error: {mErr.message}</div>;
  if (!m)   return <div className="p-6">No se encontró la máquina {code}</div>;

  const { data: lines, error: lErr } = await supabase
    .from("v_machine_statement_lines_all")
    .select("date, description, source, debit, credit")
    .eq("machine_id", m.id)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (lErr) return <div className="p-6 text-red-600">Error: {lErr.message}</div>;

  const rows: Line[] = ((lines ?? []) as RawLine[]).map((r) => ({
    source: r.source,
    date: r.date,
    description: r.description,
    debit: Number(r.debit ?? 0),
    credit: Number(r.credit ?? 0),
    balance: 0,
  }));

  let running = 0;
  for (const r of rows) { running += r.debit - r.credit; r.balance = running; }

  const totalDebit = rows.reduce((a, b) => a + b.debit, 0);
  const totalCredit = rows.reduce((a, b) => a + b.credit, 0);
  const saldo = totalDebit - totalCredit;

  const printURL =
    `/reports/machine-statement/print?code=${encodeURIComponent(code)}&start=${start}&end=${end}`;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Estado por máquina</h1>
        <Link href={printURL} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm">Vista de impresión</Link>
      </div>

      <FilterForm defaultCode={code} defaultStart={start} defaultEnd={end} />

      <table className="min-w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Origen</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-right">Débito</th>
            <th className="p-2 text-right">Crédito</th>
            <th className="p-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Sin datos</td></tr>}
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{r.date}</td>
              <td className="p-2">{r.source}</td>
              <td className="p-2">{r.description || "-"}</td>
              <td className="p-2 text-right">{fmt(r.debit)}</td>
              <td className="p-2 text-right">{fmt(r.credit)}</td>
              <td className="p-2 text-right">{fmt(r.balance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t">
          <tr>
            <td colSpan={3} className="p-2 font-medium">Totales</td>
            <td className="p-2 text-right font-medium">{fmt(totalDebit)}</td>
            <td className="p-2 text-right font-medium">{fmt(totalCredit)}</td>
            <td className="p-2 text-right font-bold">{fmt(saldo)}</td>
          </tr>
        </tfoot>
      </table>
    </main>
  );
}

function FilterForm({ defaultCode, defaultStart, defaultEnd }:{
  defaultCode: string; defaultStart: string; defaultEnd: string;
}) {
  return (
    <form className="grid gap-3 md:grid-cols-4" action="/reports/machine-statement" method="get">
      <input name="code" defaultValue={defaultCode} className="border rounded px-2 py-1" placeholder="EXC-001" />
      <input type="date" name="start" defaultValue={defaultStart} className="border rounded px-2 py-1" />
      <input type="date" name="end" defaultValue={defaultEnd} className="border rounded px-2 py-1" />
      <button className="px-4 py-2 bg-yellow-500 text-black rounded">Filtrar</button>
    </form>
  );
}
