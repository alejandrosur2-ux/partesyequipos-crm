// src/app/machines/[id]/edit/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { id: string };

export default async function MachineEditProbePage({
  params,
}: {
  params: Promise<Params>;
}) {
  try {
    const { id } = await params;
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Editar (sonda)</h1>
        <div className="rounded border p-4">
          <div className="text-sm opacity-60 mb-1">ID recibido</div>
          <div className="font-mono">{id}</div>
        </div>
        <div className="flex gap-3">
          <Link href={`/machines/${id}`} className="underline">← Ver</Link>
          <Link href="/machines" className="underline">Ver todas</Link>
        </div>
      </div>
    );
  } catch (e: any) {
    console.error("Probe /machines/[id]/edit error:", e);
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Error en sonda (edit)</h1>
        <pre className="rounded border p-3 whitespace-pre-wrap break-words text-sm">
          {String(e?.message || e)}
        </pre>
        <Link href="/machines" className="underline">← Volver</Link>
      </div>
    );
  }
}
