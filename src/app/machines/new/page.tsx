"use client";

// src/app/machines/new/page.tsx
import { createMachine } from "../actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Creando..." : "Crear máquina"}
    </button>
  );
}

type ActionState =
  | { ok: true; id: string }
  | { ok: false; message: string }
  | null;

export default function NewMachinePage() {
  const router = useRouter();
  const [state, formAction] = useFormState(createMachine as any, null) as [
    ActionState,
    (formData: FormData) => void
  ];

  // Redirige al detalle si se creó OK
  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push(`/machines/${state.id}`);
    }
  }, [state, router]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Nueva máquina</h1>

      {/* Mensaje de error si falló la acción (sin romper la app) */}
      {state && "ok" in state && !state.ok && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4 bg-white/5 p-5 rounded-lg border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-white/80">Nombre *</span>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="Excavadora 320D"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Serie</span>
            <input
              name="serial"
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="SN-000123"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Marca</span>
            <input
              name="brand"
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="Caterpillar"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Modelo</span>
            <input
              name="model"
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="320D"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Estado</span>
            <input
              name="status"
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="Activa / Taller / Baja"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Ubicación</span>
            <input
              name="location"
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="Depósito Central"
            />
          </label>
        </div>

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
