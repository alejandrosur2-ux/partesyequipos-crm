"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { updateMachine } from "../../actions"; // <- correcto desde [id]/edit

type Machine = {
  id: string;
  code: string | null;
  name: string | null;
  brand: string | null;
  model: string | null;
  serial: string | null;
  status: string | null; // opcional si mantienes la columna de texto
  status_enum?: "disponible" | "rentada" | "en_reparacion" | null;
};

const STATUS_OPTIONS: Array<{ value: NonNullable<Machine["status_enum"]>; label: string }> = [
  { value: "disponible",   label: "Disponible" },
  { value: "rentada",       label: "Rentada" },
  { value: "en_reparacion", label: "En reparación" },
];

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50 dark:bg-white dark:text-black"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export default function EditMachineForm({ machine }: { machine: Machine }) {
  const initialEnum =
    (machine.status_enum as Machine["status_enum"]) ??
    (["disponible", "rentada", "en_reparacion"].includes(String(machine.status ?? "")) 
      ? (machine.status as Machine["status_enum"])
      : "disponible");

  const [statusEnum, setStatusEnum] = useState<Machine["status_enum"]>(initialEnum);

  return (
    <form action={updateMachine} className="space-y-4 max-w-xl">
      <input type="hidden" name="id" defaultValue={machine.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm opacity-80">Nombre</span>
          <input
            name="name"
            defaultValue={machine.name ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="block text-sm opacity-80">Código</span>
          <input
            name="code"
            defaultValue={machine.code ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="block text-sm opacity-80">Marca</span>
          <input
            name="brand"
            defaultValue={machine.brand ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="block text-sm opacity-80">Modelo</span>
          <input
            name="model"
            defaultValue={machine.model ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="block text-sm opacity-80">Serie</span>
          <input
            name="serial"
            defaultValue={machine.serial ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="block text-sm opacity-80">Estado</span>
          <select
            name="status_enum"
            value={statusEnum ?? "disponible"}
            onChange={(e) => setStatusEnum(e.target.value as Machine["status_enum"])}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="pt-2">
        <SubmitBtn />
      </div>
    </form>
  );
}
