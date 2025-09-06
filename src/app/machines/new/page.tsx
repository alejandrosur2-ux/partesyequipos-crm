"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMachinePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/machines/create", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/machines");
    } else {
      const { error } = await res.json();
      setError(error);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Nueva máquina</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input type="text" name="name" required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Marca</label>
          <input type="text" name="brand" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Modelo</label>
          <input type="text" name="model" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Serie</label>
          <input type="text" name="serial" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select name="status" required className="w-full border p-2 rounded">
            <option value="disponible">Disponible</option>
            <option value="rentada">Rentada</option>
            <option value="en_reparacion">En reparación</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Guardar
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
