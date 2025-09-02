// src/app/reports/machine-statement/print/page.tsx
import { supabaseServer } from '@/utils/supabase/server';
import Link from 'next/link';

type Machine = { id: string; code: string };
type VRow = {
  machine_id: string;
  date: string; // YYYY-MM-DD
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

export default async function PrintPage({
  searchParams,
}: {
  searchParams: { code?: string; from?: string; to?: string };
}) {
  const code = (searchParams.code ?? '').trim();
  const from = searchParams.from ?? '2000-01-01';
  const to = searchParams.to ?? new Date().toISOString().slice(0, 10);

  const sb = supabaseServer();

  // 1) Mapea id->code
  const { data: machines, error: mErr } = await sb.from('machines').select('id, code');
  if (mErr) throw new Error(mErr.message);
  const codeById = new Map<string, string>(((machines ?? []) as Machine[]).map((m) => [m.id, m.code]));

  // 2) Trae líneas del estado por fechas
  const { data: vrows, error: vErr } = await sb
    .from('v_machine_statement_lines')
    .select('machine_id, date, source, description, debit, credit')
    .gte('date', from)
    .lte('date', to);
  if (vErr) throw new Error(vErr.message);

  // 3) Filtra por machine code
  const filtered: VRow[] = ((vrows ?? []) as VRow[]).filter((r) => codeById.get(r.machine_id) === code);

  const rowsUI: RowUI[] = filtered.map((r) => ({
    machine_code: code,
    op_date: r.date,
    source: r.source,
    description: r.description,
    debit: r.debit,
    credit: r.credit,
  }));

  // 4) Totales y saldo corrido
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

  // Logo opcional vía ENV (si no existe, mostramos texto)
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || '';

  const todayStr = new Date().toISOString().slice(0, 10);
  const qs = new URLSearchParams({ code, from, to }).toString();

  return (
    <div className="min-h-screen bg-zinc-100 print:bg-white">
      {/* Controles (ocultos al imprimir) */}
      <div className="print:hidden sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-[900px] px-4 py-2 flex items-center justify-between">
          <div className="text-sm text-zinc-700">
            Estado por máquina · <b>{code || '—'}</b> · {from} → {to}
          </div>
          <div className="flex gap-4 text-sm">
            <Link href={`/reports/machine-statement?${qs}`} className="underline">
              Volver al reporte
            </Link>
            {/* Tip: usa Ctrl/Cmd + P para imprimir */}
            <span className="text-zinc-500">Imprime con <b>Ctrl/Cmd + P</b></span>
          </div>
        </div>
      </div>

      {/* Hoja A4 centrada */}
      <div className="mx-auto my-6 max-w-[900px] bg-white shadow print:shadow-none print:my-0 p-6 rounded-xl print:rounded-none">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-12 w-auto" />
          ) : (
            <div className="text-xl font-semibold">PARTES Y EQUIPOS</div>
          )}
          <div className="ml-auto text-right text-sm text-zinc-600">
            <div><b>Fecha:</b> {todayStr}</div>
            <div><b>Período:</b> {from} → {to}</div>
            <div><b>Máquina:</b> {code || '—'}</div>
          </div>
        </div>

        <hr className="my-4" />

        {/* Totales del período */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-zinc-500">Total Cargos</div>
            <div className="text-lg font-semibold">{fmtQ(total_cargos)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-zinc-500">Total Abonos</div>
            <div className="text-lg font-semibold">{fmtQ(total_abonos)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-zinc-500">Saldo del período</div>
            <div className="text-lg font-semibold">{fmtQ(saldo_total)}</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
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
              {rowsWithBalance.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-zinc-500" colSpan={7}>
                    No hay movimientos en el rango seleccionado.
                  </td>
                </tr>
              )}
              {rowsWithBalance.map((r, i) => (
                <tr key={`${r.op_date}-${i}`} className="border-t">
                  <td className="p-2">{r.op_date}</td>
                  <td className="p-2">{r.source ?? ''}</td>
                  <td className="p-2">{r.description ?? ''}</td>
                  <td className="p-2 text-right">{fmtQ(numeric(r.debit))}</td>
                  <td className="p-2 text-right">{fmtQ(numeric(r.credit))}</td>
                  <td className="p-2 text-right">{fmtQ(r.amount)}</td>
                  <td className="p-2 text-right">{fmtQ(r.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-zinc-50 font-medium">
                <td className="p-2" colSpan={3}>Totales</td>
                <td className="p-2 text-right">{fmtQ(total_cargos)}</td>
                <td className="p-2 text-right">{fmtQ(total_abonos)}</td>
                <td className="p-2 text-right">{fmtQ(saldo_total)}</td>
                <td className="p-2 text-right">{fmtQ(saldo_total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notas (opcional) */}
        <div className="mt-4 text-xs text-zinc-500">
          * Los importes están expresados en Quetzales (Q).  
          * “Monto (±)” = Cargo − Abono. “Saldo (±)” = saldo acumulado línea a línea.
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          html, body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
