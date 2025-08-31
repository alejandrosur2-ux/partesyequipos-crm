import { supabaseServer } from "@/utils/supabase/server";
import Link from "next/link";

type Line = {
  date: string;
  source: string;
  description: string;
  debit: number;
  credit: number;
};

export default async function MachineStatementPage({
  searchParams,
}: {
  searchParams: { code?: string; start?: string; end?: string };
}) {
  const code = searchParams.code ?? "";
  const start = searchParams.start ?? "2025-08-01";
  const end = searchParams.end ?? "2025-08-31";

  const supabase = supabaseServer();

  // Buscar máquina por code
  const { data: machine, error: mError } = await supabase
    .from("machines")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  if (mError || !machine) {
    return <div className="p-6 text-red-600">Máquina no encontrada</div>;
  }

  // Traer movimientos
  const { data: rows, error } = await supabase
    .from("v_machine_statement_lines_all")
    .select("date, source, description, debit, credit")
    .eq("machine_id", machine.id)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  const lines = rows as Line[];

  const printURL = `/reports/machine-statement/print?code=${encodeURIComponent(
    code
  )}&start=${start}&end=${end}`;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        Estado de máquina {code} ({start} → {end})
      </h1>

      <div className="flex gap-2">
        <Link
          href={printURL}
          className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm"
        >
          Vista de impresión
        </Link>
      </div>

      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Fecha</th>
            <th className="border px-2 py-1">Origen</th>
            <th className="border px-2 py-1">Descripción</th>
            <th className="border px-2 py-1 text-right">Débito</th>
            <th className="border px-2 py-1 text-right">Crédito</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                Sin datos en este rango
              </td>
            </tr>
          )}
          {lines.map((r, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{r.date}</td>
              <td className="border px-2 py-1">{r.source}</td>
              <td className="border px-2 py-1">{r.description}</td>
              <td className="border px-2 py-1 text-right">
                {Number(r.debit).toFixed(2)}
              </td>
              <td className="border px-2 py-1 text-right">
                {Number(r.credit).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
