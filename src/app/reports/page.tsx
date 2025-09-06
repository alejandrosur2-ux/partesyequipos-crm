// src/app/reports/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("machines")
    .select("status, count:id")
    .group("status");

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <p className="mt-4 text-red-400">Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Reportes</h1>
      <pre className="mt-4 text-sm bg-black/30 p-4 rounded">
        {JSON.stringify(data ?? [], null, 2)}
      </pre>
    </main>
  );
}
