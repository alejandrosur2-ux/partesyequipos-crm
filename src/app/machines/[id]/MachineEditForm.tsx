"use client";

// src/app/machines/[id]/MachineEditForm.tsx
import { useFormState, useFormStatus } from "react-dom";
import { updateMachine, deleteMachine } from "../actions";
import { useRouter } from "next/navigation";

type Machine = {
  id: string;
  code: string;
  name: string | null;
  serial: string | null;
  brand: string | null;
  model: string | null;
  status: string | null;
  location: string | null;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export default function MachineEditForm({ machine }: { machine: Machine }) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateMachine as any, null);

  return (
    <div className="space-y-6">
      {state && "ok" in state && !state.ok && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4 bg-white/5 p-5 rounded-lg border border-white/10">
        <input type="hidden" name="id" value={machine.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-white/80">Código *</span>
            <input
              name="code"
              defaultValue={machine.code}
              required
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Nombre *</span>
            <input
              name="name"
              defaultValue={machine.name ?? ""}
              required
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Serie</span>
            <input
              name="serial"
              defaultValue={machine.serial ?? ""}
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Marca</span>
            <input
              name="brand"
              defaultValue={machine.brand ?? ""}
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Modelo</span>
            <input
              name="model"
              defaultValue={machine.model ?? ""}
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Estado</span>
            <input
              name="status"
              defaultValue={machine.status ?? ""}
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-white/80">Ubicación</span>
            <input
              name="location"
              defaultValue={machine.location ?? ""}
              className="mt-1 w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-white"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <SaveButton />

          {/* eliminar desde la ficha */}
          <form
            action={async (fd) => {
              // encadenamos a la server action delete
              await deleteMachine(fd);
            }}
          >
            <input type="hidden" name="id" value={machine.id} />
            <button
              type="submit"
              className="px-3 py-2 rounded-md border border-red-500/40 text-red-300 hover:bg-red-500/10"
              onClick={(e) => {
                if (!confirm("¿Eliminar esta máquina?")) e.preventDefault();
              }}
            >
              Eliminar
            </button>
          </form>

          <button
            type="button"
            className="px-3 py-2 rounded-md border border-white/15 hover:bg-white/10"
            onClick={() => router.push("/machines")}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
