// app/reports/machine-statement/page.tsx
import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';

type VRow = {
  machine_id: string;
  date: string;
  source: string | null;
  description: string | null;
  debit: number | null;
  credit: number | null;
};

export default async function Page({
  searchParams,
}: {
  searchParams: { code?: string; from?: string; to?: string };
}) {
  const code = (searchParams.code ?? '').trim();
  const from = searchParams.from ?? '2000-01-01';
  const to = searchParams.to ?? new Date().toISOString().slice(0, 10);

  const supabase = supabaseServer();
  let rows: (VRow & { machine_code: string })[] = [];

  if (code) {
    // 1) Trae machines para mapear id -> code
    const { data: machines, error: mErr } = await supabase
      .from('machines')
      .select('id, code');
    if (mErr) {
      throw new Error(mErr.message);
    }
    const codeById = new Map((machines ?? []).map((m: any) => [m.id, m.code]));

    // 2) Trae el estado (vista) por fechas
    const { data: vrows, error: vErr } = await supabase
      .from('v_machine_statement_lines')
      .select('machine_id, date, source, description, debit, credit')
      .gte('date', from)
      .lte('date', to);
    if (vErr) {
      throw new Error(vErr.message);
    }

    // 3) Filtra por code (comparando con machines) y calcula amount firmado
    rows = (vrows ?? [])
      .filter((r) => codeById.get(r.machine_id) === code)
      .map((r) => ({
        ...r,
        machine_code: code,
      })) as any;
  }

  const total_cargos = rows.reduce((a, r) => a + Number(r.debit ?? 0), 0);
  const total_abonos = rows.reduce((a, r) => a + Number(r.credit ?? 0), 0);
  const saldo = total_cargos - total_abonos;
  const qs = new URLSearchParams({ code, from, to }).toString();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Estado por máquina (por fechas)</h1>

      <form className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          name="code"
          defaultValue={code}
          placeholder="Código (p.ej. EXC-001)"
          className="border rounded-xl px-3 py-2"
        />
        <input type="date" name="from" defaultValue={from} className="border rounded-xl px-3 py-2" />
        <input type="date" name="to" defaultValue={to} className="border rounded-xl px-3 py-2" />
        <button className="rounded-2xl bg-black text-white px-4">Filtrar</button>
      </form>

      {code ? (
        <>
          <div className="flex items-center justify-between text-sm">
            <div>
              Registros: {rows.length} · Cargos: <b>Q{total_cargos.toFixed(2)}</b> · Abonos:{' '}
              <b>Q{total_abonos.toFixed(2)}</b> · Saldo: <b>Q{saldo.toFixed(2)}</b>
            </div>
            <Link href={`/api/export?entity=machine-statement&${qs}`} className="underline">
              Exportar CSV
            </Link>
          </div>

          <div className="overflow-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Fuente</th>
                  <th className="text-left p-2">Descripción</th>
                  <th className="text-right p-2">Cargo (Q)</th>
                  <th className="text-right p-2">Abono (Q)</th>
                  <th className="text-right p-2">Monto (±)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const debit = Number(r.debit ?? 0);
                  const credit = Number(r.credit ?? 0);
                  const amount = debit - credit;
                  return (
                    <tr key={`${r.date}-${i}`} className="border-t">
                      <td className="p-2">{r.date}</td>
                      <td className="p-2">{r.source ?? ''}</td>
                      <td className="p-2">{r.description ?? ''}</td>
                      <td className="p-2 text-right">{debit.toFixed(2)}</td>
                      <td className="p-2 text-right">{credit.toFixed(2)}</td>
                      <td className="p-2 text-right">{amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-gray-500">Ingresa un código de máquina y filtra.</div>
      )}
    </div>
  );
}
