import { createClient } from "@supabase/supabase-js";

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

function fmt(n: number) {
  return n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function PrintPage({
  searchParams,
}: { searchParams?: { code?: string; start?: string; end?: string } }) {
  const code = (searchParams?.code || "").trim();
  const start = searchParams?.start!;
  const end   = searchParams?.end!;

  const supabase = supabaseServer();
  const { data: m } = await supabase
    .from("machines")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  const rows: RawLine[] = m
    ? ((await supabase
        .from("v_machine_statement_lines_all")
        .select("date, description, source, debit, credit")
        .eq("machine_id", m.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })).data ?? []) as RawLine[]
    : [];

  let running = 0;
  const withBalance = rows.map((r) => {
    const debit = Number(r.debit ?? 0);
    const credit = Number(r.credit ?? 0);
    running += debit - credit;
    return { ...r, debit, credit, balance: running };
  });

  const totalDebit = withBalance.reduce((a, b) => a + b.debit, 0);
  const totalCredit = withBalance.reduce((a, b) => a + b.credit, 0);
  const saldo = totalDebit - totalCredit;

  return (
    <html>
      <head>
        <title>Impresión — {code}</title>
        <style>{`
          body { font-family: ui-sans-serif, system-ui; padding: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border-top: 1px solid #e5e7eb; padding: 6px; text-align: left; }
          th { background: #f9fafb; }
          .right { text-align: right; }
          @media print { .no-print { display: none; } }
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('DOMContentLoaded', () => {
                const b = document.getElementById('print-btn');
                if (b) b.addEventListener('click', () => window.print());
              });
            `,
          }}
        />
      </head>
      <body>
        <div className="no-print" style={{ marginBottom: 12 }}>
          <button id="print-btn">Imprimir</button>
        </div>

        <h1>Estado por máquina — {code}</h1>
        <p><b>Rango:</b> {start} → {end}</p>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Origen</th>
              <th>Descripción</th>
              <th className="right">Débito</th>
              <th className="right">Crédito</th>
              <th className="right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {withBalance.length === 0 && <tr><td colSpan={6}>Sin datos</td></tr>}
            {withBalance.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.source}</td>
                <td>{r.description || "-"}</td>
                <td className="right">{fmt(r.debit)}</td>
                <td className="right">{fmt(r.credit)}</td>
                <td className="right">{fmt(r.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><b>Totales</b></td>
              <td className="right"><b>{fmt(totalDebit)}</b></td>
              <td className="right"><b>{fmt(totalCredit)}</b></td>
              <td className="right"><b>{fmt(saldo)}</b></td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  );
}
