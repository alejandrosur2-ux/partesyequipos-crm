// src/app/machines/[id]/MachineEditForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  initial: {
    name: string;
    brand: string;
    model: string;
    serial: string;
    status_enum: "disponible" | "rentada" | "en_reparacion";
  };
};

export default function MachineEditForm({ id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/machines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name?.trim() || null,
          brand: form.brand?.trim() || null,
          model: form.model?.trim() || null,
          serial: form.serial?.trim() || null,
          status: form.status_enum,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar");
      }

      router.push("/machines");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const labelCls = "block text-sm font-medium text-gray-700";
  const inputCls =
    "w-full border border-gray-300 p-2 rounded text-gray-900 placeholder-gray-500 bg-white";
  const selectCls =
    "w-full border border-gray-300 p-2 rounded text-gray-900 bg-white";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nombre</label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej. Retro 25"
          />
        </div>

        <div>
          <label className={labelCls}>Marca</label>
          <input
            className={inputCls}
            value={form.brand}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            placeholder="Ej. XCMG"
          />
        </div>

        <div>
          <label className={labelCls}>Modelo</label>
          <input
            className={inputCls}
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            placeholder="Ej. XS123"
          />
        </div>

        <div>
          <label className={labelCls}>Serie</label>
          <input
            className={inputCls}
            value={form.serial}
            onChange={(e) =>
              setForm((f) => ({ ...f, serial: e.target.value }))
            }
            placeholder="Ej. 000123"
          />
        </div>

        <div>
          <label className={labelCls}>Estado</label>
          <select
            className={selectCls}
            value={form.status_enum}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status_enum: e.target
                  .value as Props["initial"]["status_enum"],
              }))
            }
          >
            <option value="disponible">Disponible</option>
            <option value="rentada">Rentada</option>
            <option value="en_reparacion">En reparación</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded border border-gray-300 text-gray-900 bg-white"
          onClick={() => router.push("/machines")}
          disabled={saving}
        >
          Cancelar
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
