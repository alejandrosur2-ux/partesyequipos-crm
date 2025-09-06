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
          status: form.status_enum, // 👈 viene del select
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar");
      }

      // Vuelve al listado
      router.push("/machines");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej. Retro 25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Marca</label>
          <input
            className="w-full border p-2 rounded"
            value={form.brand}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            placeholder="Ej. XCMG"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Modelo</label>
          <input
            className="w-full border p-2 rounded"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            placeholder="Ej. XS123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Serie</label>
          <input
            className="w-full border p-2 rounded"
            value={form.serial}
            onChange={(e) => setForm((f) => ({ ...f, serial: e.target.value }))}
            placeholder="Ej. 000123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            className="w-full border p-2 rounded"
            value={form.status_enum}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status_enum: e.target.value as Props["initial"]["status_enum"],
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
          className="px-4 py-2 rounded border"
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
