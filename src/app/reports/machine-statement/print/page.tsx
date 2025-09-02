// src/app/reports/machine-statement/print/page.tsx
import { supabaseServer } from '@/utils/supabase/server';
import Link from 'next/link';
import Script from 'next/script';

type Machine = { id: string; code: string };
type VRow = {
  machine_id: string;
  date: string;
  source: string | null;
  description: string | null;
  debit: number | null;
  credit: number | null;
};

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
const fmtQ = (n: number) =>
  `Q ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function Page({
  searchParams,
}: {
  searchParams: { code?: string; from?: string; to?: string; auto?: string };
}) {
  const code = (searchParams.code ?? '').trim();
  const from = searchParams.from ?? '2000-01-01';
  const to = searchParams.to ?? new Date().toISOString().slice(0, 10);

  const sb = supabaseServer();

  const { data: machines } = await sb.from('machines').select('id, code');
  const codeById = new Map<string, string>(
    ((machines ?? []) as Machine[]).map((m) => [m.id, m.code]),
  );

  const { data: vrows } = await sb
    .from('v_machine_statement_lines')
    .select('machine_id, date, source, description, debit, credit')
    .gte('date', from)
    .lte('date', to);

  const filtered: VRow[] = ((vrows ?? []) as VRow[]).filter(
    (r) => codeById.get(r.machine_id) === code,
  );

  const rowsUI = filtered.map<RowUI>((r) => ({
    machine_code: code,
    op_date: r.date,
    source: r.source,
    description: r.description,
    debit: r.debit,
    credit: r.credit,
  }));

  const total_cargos = rowsUI.reduce((a, r) => a + numeric(r.debit), 0);
  const total_abonos = rowsUI.reduce((a, r) => a + numeric(r.credit), 0);
  const saldo_total = total_cargos - total_abonos;

  let running = 0;
  const rowsWithBalance: RowWithBalance[] = rowsUI.map((r) => {
    const amount = numeric(r.debit) - numeric(r.credit);
    running += amount;
    return { ...r, amount, balance: running };
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const qs = new URLSearchParams({ code, from, to }).toString();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Barra superior (no se imprime) */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b">
        <div className="mx-auto max-w-[900px] px-4 py-2 flex items-center justify-between">
          <div className="text-sm">
            Estado por máquina · <b>{code || '—'}</b> · {from} → {to}
          </div>
          <div className="flex gap-4 text-sm">
            <Link href={`/reports/machine-statement?${qs}`} className="underline">
              Volver al reporte
            </Link>

            {/* Imprimir sin hidratar: funciona en Server Components */}
            <a
              href="javascript:window.print()"
              className="rounded-md border px-3 py-1 hover:bg-black hover:text-white"
            >
              Imprimir
            </a>

            <span>Imprime con <b>Ctrl/Cmd + P</b></span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto my-6 max-w-[900px] bg-white shadow print:shadow-none print:my-0 p-6 rounded-xl print:rounded-none">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">PARTES Y EQUIPOS</div>
          <div className="ml-auto text-right text-sm">
            <div><b>Fecha:</b> {todayStr}</div>
            <div><b>Período:</b> {from} → {to}</div>
            <div><b>Máquina:</b> {code || '—'}</div>
          </div>
        </div>

        <hr className="my-4 border-black" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs">Total Cargos</div>
            <div className="text-lg font-bold">{fmtQ(total_cargos)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs">Total Abonos</div>
            <div className="text-lg font-bold">{fmtQ(total_abonos)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs">Saldo del período</div>
            <div className="text-lg font-bold">{fmtQ(saldo_total)}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-white">
              <tr>
                <th className="text-left p-2 border">Fecha</th>
                <th className="text-left p-2 border">Origen</th>
                <th className="text-left p-2 border">Descripción</th>
                <th className="text-right p-2 border">Cargo (Q)</th>
                <th className="text-right p-2 border">Abono (Q)</th>
                <th className="text-right p-2 border">Monto (±)</th>
                <th className="text-right p-2 border">Saldo (±)</th>
              </tr>
            </thead>
            <tbody>
              {rowsWithBalance.length === 0 && (
                <tr>
                  <td className="p-3 text-center" colSpan={7}>
                    No hay movimientos en el rango seleccionado.
                  </td>
                </tr>
              )}
              {rowsWithBalance.map((r, i) => (
                <tr key={`${r.op_date}-${i}`}>
                  <td className="p-2 border">{r.op_date}</td>
                  <td className="p-2 border">{r.source ?? ''}</td>
                  <td className="p-2 border">{r.description ?? ''}</td>
                  <td className="p-2 border text-right">{fmtQ(numeric(r.debit))}</td>
                  <td className="p-2 border text-right">{fmtQ(numeric(r.credit))}</td>
                  <td className="p-2 border text-right">{fmtQ(r.amount)}</td>
                  <td className="p-2 border text-right">{fmtQ(r.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="p-2 border" colSpan={3}>Totales</td>
                <td className="p-2 border text-right">{fmtQ(total_cargos)}</td>
                <td className="p-2 border text-right">{fmtQ(total_abonos)}</td>
                <td className="p-2 border text-right">{fmtQ(saldo_total)}</td>
                <td className="p-2 border text-right">{fmtQ(saldo_total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 text-xs">
          * Los importes están expresados en Quetzales (Q).
        </div>
      </div>

      {/* Auto-print si llega ?auto=1 */}
      {searchParams?.auto === '1' && (
        <Script id="auto-print">{`
          window.addEventListener('load', function () {
            setTimeout(function(){ window.print(); }, 100);
          });
        `}</Script>
      )}

      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          html, body { background: #fff !important; }
          * { color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          table, th, td { border-color: #000 !important; }
          .bg-white, .bg-zinc-50, .bg-zinc-100 { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}
