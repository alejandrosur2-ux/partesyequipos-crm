// src/app/machines/[id]/MachineEditForm.tsx
"use client";

import { useState, useTransition } from "react";

type Machine = {
  id: string;
  name: string | null;
  serial: string | null;
  status: string | null;
  daily_rate: number | null;
  notes: string | null;
};

export default function MachineEditForm({
  machine,
  action,
}: {
  machine: Machine;
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white transition-colors"
        >
          Editar
        </button>
      ) : (
        <form
          action={(fd) => {
            startTransition(async () => {
              await action(fd);
            });
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Columna 1 */}
          <div className="space-y-4">
            <Field label="Nombre">
              <input
                name="name"
                defaultValue={machine.name ?? ""}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Nombre de la máquina"
              />
            </Field>

            <Field label="Serie">
              <input
                name="serial"
                defaultValue={machine.serial ?? ""}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Serie / código"
              />
            </Field>

            <Field label="Estado">
              <select
                name="status"
                defaultValue={machine.status ?? "activo"}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="activo">Activo</option>
                <option value="taller">Taller</option>
                <option value="rentada">Rentada</option>
                <option value="baja">Baja</option>
              </select>
            </Field>

            <Field label="Tarifa diaria (GTQ)">
              <input
                name="daily_rate"
                type="number"
                step="1"
                min="0"
                defaultValue={machine.daily_rate ?? ""}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Ej: 950"
              />
            </Field>
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
            <Field label="Observaciones">
              <textarea
                name="notes"
                defaultValue={machine.notes ?? ""}
                rows={8}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Notas u observaciones…"
              />
            </Field>
          </div>

          {/* Acciones */}
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors disabled:opacity-60"
            >
              {isPending ? "Guardando…" : "Guardar cambios"}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-300">{label}</span>
      {children}
    </label>
  );
}
