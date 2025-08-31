import { supabaseServer } from "@/utils/supabase/server";

type Line = {
  date: string;
  source: string;
  description: string;
  debit: number;
  credit: number;
};

export default async function MachineStatementPrintPage({
  searchParams,
}: {
  searchParams: { code?: string; start?: string; end?: string };
}) {
  const code = searchParams.code ?? "";
  const start = searchParams.start ?? "2025-08-01";
  const end = searchParams.end ?? "2025-08-31";

  const supabase = supabaseServer();

  const { data: machine } = await supabase
    .from("machines")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  if (!machine) return <div>Máquina no encontrada</div>;

  const { data: rows } = await supabase
    .from("v_machine_statement_lines_all")
    .select("date, source, description, debit, credit")
    .eq("machine_id", machine.id)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  const lines = (rows ?? []) as Line[];

  return (
    <html>
      <head>
        <title>Estado máquina {code}</title>
      </head>
      <body>
        <h1>
          Estado de máquina {code} ({start} → {end})
        </h1>
        <table border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Origen</th>
              <th>Descripción</th>
              <th>Débito</th>
              <th>Crédito</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.source}</td>
                <td>{r.description}</td>
                <td style={{ textAlign: "right" }}>
                  {Number(r.debit).toFixed(2)}
                </td>
                <td style={{ textAlign: "right" }}>
                  {Number(r.credit).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <script>window.print()</script>
      </body>
    </html>
  );
}
