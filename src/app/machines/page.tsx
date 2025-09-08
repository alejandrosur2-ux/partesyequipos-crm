// src/app/machines/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const revalidate = 0; // evitar cache mientras arreglamos

export default async function MachinesPage() {
  const supabase = supabaseServer();

  const { data: machines, error } = await supabase
    .from("machines")
    .select("id, code, name, brand, model, serial, status, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("machines list error:", error);
    throw new Error("Error al cargar máquinas");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Máquinas</h1>
        <Link href="/machines/new" className="btn btn-primary">Nueva máquina</Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr className="[&_th]:px-3 [&_th]:py-2 text-left">
              <th>Nombre</th><th>Código</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody className="[&_td]:px-3 [&_td]:py-2">
            {(machines ?? []).map((m) => (
              <tr key={m.id} className="border-t">
                <td>{m.name ?? "—"}</td>
                <td>{m.code ?? "—"}</td>
                <td>{m.brand ?? "—"}</td>
                <td>{m.model ?? "—"}</td>
                <td>{m.serial ?? "—"}</td>
                <td>{m.status ?? "—"}</td>
                <td className="text-right">
                  <Link href={`/machines/${m.id}`} className="underline mr-3">Ver</Link>
                  <Link href={`/machines/${m.id}/edit`} className="underline">Editar</Link>
                </td>
              </tr>
            ))}
            {(!machines || machines.length === 0) && (
              <tr><td colSpan={7} className="text-center py-6 opacity-70">Sin datos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
