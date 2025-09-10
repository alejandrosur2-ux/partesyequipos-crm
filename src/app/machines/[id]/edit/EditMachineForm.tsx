"use client";

import { useTransition } from "react";
import { updateMachine } from "./actions";

type Machine = {
  id: string;
  code?: string | null;
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  serial?: string | null;
  status?: string | null; // textual opcional
  status_enum?: "disponible" | "rentada" | "en_reparacion" | null;
};

export default function EditMachineForm({ machine }: { machine: Machine }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(() => {
          updateMachine(formData);
        })
      }
      className="space-y-4"
    >
      <input type="hidden" name="id" defaultValue={machine.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm opacity-80">Nombre</label>
          <input
            name="name"
            defaultValue={machine.name ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm opacity-80">Código</label>
          <input
            name="code"
            defaultValue={machine.code ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm opacity-80">Marca</label>
          <input
            name="brand"
            defaultValue={machine.brand ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm opacity-80">Modelo</label>
          <input
            name="model"
            defaultValue={machine.model ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm opacity-80">Serie</label>
          <input
            name="serial"
            defaultValue={machine.serial ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* Campo textual opcional, por compatibilidad si aún lo usas */}
        <div>
          <label className="block text-sm opacity-80">Estado (texto)</label>
          <input
            name="status"
            defaultValue={machine.status ?? ""}
            placeholder="(opcional)"
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* Desplegable ENUM (el importante) */}
        <div>
          <label className="block text-sm opacity-80">Estado</label>
          <select
            name="status_enum"
            defaultValue={machine.status_enum ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          >
            <option value="">—</option>
            <option value="disponible">Disponible</option>
            <option value="rentada">Rentada</option>
            <option value="en_reparacion">En reparación</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
