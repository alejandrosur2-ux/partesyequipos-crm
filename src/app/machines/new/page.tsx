// src/app/machines/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "disponible" | "rentada" | "en_reparacion";

export default function NewMachinePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    serial: "",
    status_enum: "disponible" as Status,
  });

  const labelCls = "block text-sm font-medium text-gray-700";
  const inputCls =
    "w-full border border-gray-300 p-2 rounded text-gray-900 placeholder-gray-500 bg-white";
  const selectCls =
    "w-full border border-gray-300 p-2 rounded text-gray-900 bg-white";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Endpoint de creación (ya que editar/eliminar usan /api/machines/[id])
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name?.trim() || null,
          brand: form.brand?.trim() || null,
          model: form.model?.trim() || null,
          serial: form.serial?.trim() || null,
          status: form.status_enum, // el API acepta "status" y lo mapea a status_enum/enum en DB
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo crear la máquina");
      }

      router.push("/machines");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Nueva máquina</h1>

      {/* 👇 Forzamos fondo blanco y texto oscuro para evitar blanco sobre blanco */}
      <div className="bg-white text-gray-900 rounded-lg shadow p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ej. Retro 25"
              />
            </div>

            <div>
              <label className={labelCls}>Marca</label>
              <input
                className={inputCls}
                value={form.brand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
                placeholder="Ej. XCMG"
              />
            </div>

            <div>
              <label className={labelCls}>Modelo</label>
              <input
                className={inputCls}
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
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
                    status_enum: e.target.value as Status,
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
              {saving ? "Creando..." : "Crear máquina"}
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
      </div>
    </div>
  );
}
