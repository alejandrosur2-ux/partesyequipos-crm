// src/app/machines/new/page.tsx
import Link from "next/link";
import MachineForm from "../shared/MachineForm";
import { createMachine } from "../actions";

export const revalidate = 0; // sin caché mientras ajustamos
export const dynamic = "force-dynamic"; // evita prerender raro

export default function NewMachinePage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Nueva máquina</h1>
        <Link href="/machines" className="underline">Volver</Link>
      </div>

      <MachineForm action={createMachine} submitLabel="Crear" />
    </div>
  );
}
