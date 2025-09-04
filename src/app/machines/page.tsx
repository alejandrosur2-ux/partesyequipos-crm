import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Page() {
  const supabase = createClient();
  const { data: machines, error } = await supabase
    .from("machines")
    .select("id,name,status,created_at")
    .order("created_at", { ascending: false });

  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Mis máquinas</h1>
      <ul className="space-y-2">
        {machines?.map((m) => (
          <li key={m.id} className="border p-3 rounded flex items-center justify-between">
            <div>
              <b>{m.name}</b> <span className="opacity-70">({m.status})</span>
            </div>
            <Link href={`/machines/${m.id}`} className="underline">Editar</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
