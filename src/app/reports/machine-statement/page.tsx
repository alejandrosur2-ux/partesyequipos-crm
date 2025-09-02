// src/app/reports/machine-statement/page.tsx
import Link from 'next/link';
import { supabaseServer } from '@/utils/supabase/server';

type VRow = {
  machine_id: string;
  date: string; // ISO yyyy-mm-dd
  source: string | null;
  description: string | null;
  debit: number | null;
  credit: number | null;
};

type Machine = { id: string; code: string };

type RowUI = {
  machine_code: string;
  op_date: string;
  source: string | null;
  description: string | null;
  debit: number | null;
  credit: number | null;
};

type RowWithBalance = RowUI & { amount: number; balance: number };

const numeric = (v: unknown) => Number(v ?? 0);

export default async function Page({
  searchParams,
}: {
  searchParams: { code?: string; from?: string; to?: string };
}) {
  const code = (searchParams.code ?? '').trim();
  const from = searchParams.from ?? '2000-01-01';
  const to = searchParams.to ?? new Date().toISOString().slice(0, 10);

  const sb = supabaseServer();

  let rowsUI: RowUI[] = [];

  if (code) {
    const { data: machines, error: mErr } = await sb.from('machines').select('id, code');
    if (mErr) throw new Error(mErr.message);
    const codeById = new Map<string, string>(((machines ?? []) as Machine[]).map((m) => [m.id, m.code]));

    const { data: vrows, error: vErr } = await sb
      .from('v_machine_statement_lines')
      .select('machine_id, date, source, description, debit, credit')
      .gte('date', from)
      .lte('date', to);
    if (vErr) throw new Error(vErr.message);

    const filtered: VRow[] = ((vrows ?? []) as VRow[]).filter((r) => codeById.get(r.machine_id) === code);

    rowsUI = filtered.map((r) => ({
      machine_code: code,
      op_date: r.date,
      source: r.source,
      description: r.description,
      debit: r.debit,
      credit: r.credit,
    }));
  }

  const total_cargos = rowsUI.reduce((a, r) => a + numeric(r.debit), 0);
  const total_abonos = rowsUI.reduce((a, r) => a + numeric(r.credit), 0);
  const saldo_total = total_cargos - total_abonos;

  let running = 0;
  const rowsWithBalance: RowWithBalance[] = rowsUI.map((r) => {
    const debit = numeric(r.debit);
    const credit = numeric(r.credit);
    const amount = debit - credit;
    running += amount;
    return { ...r, amount, balance: running };
  });

  const qs = new URLSearchParams({ code, from, to }).toString();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Estado por máquina</h1>

      {/* Filtros */}
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
          {/* Resumen y export */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm">
            <div>
              Máquina: <b>{code}</b> · Registros: {rowsWithBalance.length} · Cargos:{' '}
              <b>Q{total_cargos.toFixed(2)}</b> · Abonos: <b>Q{total_abonos.toFixed(2)}</b> · Saldo:{' '}
              <b>Q{saldo_total.toFixed(2)}</b>
            </div>
            <div className="flex gap-3">
              <Link href={`/api/export?entity=machine-statement&${qs}`} className="underline" prefetch={false}>
                Exportar CSV
              </Link>
              <Link
                href={`/api/export?entity=machine-statement&${qs}&format=xlsx`}
                className="underline"
                prefetch={false}
              >
                Exportar XLSX
              </Link>
              <Link href={`/reports/machine-statement/print?${qs}`} className="underline" prefetch={false}>
                Vista de impresión
              </Link>
              {/* NUEVO: abre /print con auto=1 y lanza el diálogo de impresión */}
              <Link
                href={`/reports/machine-statement/print?${qs}&auto=1`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-black text-white px-3 py-1"
                prefetch={false}
              >
                Imprimir PDF
              </Link>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Origen</th>
                  <th className="text-left p-2">Descripción</th>
                  <th className="text-right p-2">Cargo (Q)</th>
                  <th className="text-right p-2">Abono (Q)</th>
                  <th className="text-right p-2">Monto (±)</th>
                  <th className="text-right p-2">Saldo (±)</th>
                </tr>
              </thead>
              <tbody>
                {rowsWithBalance.map((r, i) => (
                  <tr key={`${r.op_date}-${i}`} className="border-t">
                    <td className="p-2">{r.op_date}</td>
                    <td className="p-2">{r.source ?? ''}</td>
                    <td className="p-2">{r.description ?? ''}</td>
                    <td className="p-2 text-right">{numeric(r.debit).toFixed(2)}</td>
                    <td className="p-2 text-right">{numeric(r.credit).toFixed(2)}</td>
                    <td className="p-2 text-right">{r.amount.toFixed(2)}</td>
                    <td className="p-2 text-right">{r.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50 font-medium">
                  <td className="p-2" colSpan={3}>
                    Totales
                  </td>
                  <td className="p-2 text-right">{total_cargos.toFixed(2)}</td>
                  <td className="p-2 text-right">{total_abonos.toFixed(2)}</td>
                  <td className="p-2 text-right">{(total_cargos - total_abonos).toFixed(2)}</td>
                  <td className="p-2 text-right">{saldo_total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      ) : (
        <div className="text-gray-500">Ingresa un código de máquina y filtra.</div>
      )}
    </div>
  );
}
