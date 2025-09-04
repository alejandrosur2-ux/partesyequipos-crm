// src/app/machines/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/utils/supabase/server";

type Machine = {
  id: string;
  code: string;
  name: string | null;
  type: string;
  status: string | null;
  daily_rate: number | null;
};

export default async function MachinesPage() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("machines")
    .select("id, code, name, type, status, daily_rate")
    .order("code", { ascending: true });

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Máquinas</h1>
        <p className="text-red-400">Error al cargar: {error.message}</p>
      </div>
    );
  }

  const machines = (data ?? []) as Machine[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Máquinas</h1>
        <Link
          href="/machines/new"
          className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition text-sm"
        >
          + Nueva máquina
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Estatus</th>
              <th className="text-right px-4 py-3">Tarifa día</th>
            </tr>
          </thead>
          <tbody>
            {machines.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-white/60">
                  Aún no hay máquinas.
                </td>
              </tr>
            )}
            {machines.map((m) => (
              <tr key={m.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium">{m.code}</td>
                <td className="px-4 py-3">{m.name ?? "—"}</td>
                <td className="px-4 py-3">{m.type}</td>
                <td className="px-4 py-3">{m.status ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  {m.daily_rate != null ? `$${Number(m.daily_rate).toFixed(2)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
