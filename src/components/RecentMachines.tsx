// src/components/RecentMachines.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server-only";

type MachineRow = {
  id: string;
  name: string | null;
  status: "activo" | "taller" | "rentada" | "baja" | null;
  daily_rate: number | null;
  created_at: string;
  deleted_at?: string | null;
};

export default async function RecentMachines() {
  const sb = createClient();

  const { data = [] } = await sb
    .from("machines")
    .select("id,name,status,daily_rate,created_at,deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  const rows = data as MachineRow[];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[640px] w-full text-sm text-slate-700">
        <thead className="sticky top-0 bg-white/90 backdrop-blur border-b">
          <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left text-slate-500">
            <th>Nombre</th>
            <th>Estado</th>
            <th>Tarifa diaria</th>
            <th>Creada</th>
            <th className="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={`border-b ${i % 2 ? "bg-slate-50/70" : "bg-white"}`}>
              <td className="px-3 py-2 text-slate-900">{r.name ?? "-"}</td>
              <td className="px-3 py-2 capitalize">{r.status ?? "-"}</td>
              <td className="px-3 py-2">{r.daily_rate ?? "-"}</td>
              <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="px-3 py-2 text-center">
                <Link
                  href={`/machines/${r.id}`}
                  className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium
                             text-white bg-sky-600 hover:bg-sky-700 transition"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-3 text-center text-slate-500" colSpan={5}>
                Sin datos todavía.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
