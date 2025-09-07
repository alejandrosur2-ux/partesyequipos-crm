"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMachinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/machines", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      router.push("/machines");
    } else {
      alert("Error al crear máquina");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white text-black rounded-md shadow">
      <h1 className="text-2xl font-bold mb-4">Nueva Máquina</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input
            type="text"
            name="name"
            required
            className="w-full border border-gray-300 rounded-md p-2 text-black"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Marca</label>
          <input
            type="text"
            name="brand"
            className="w-full border border-gray-300 rounded-md p-2 text-black"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Modelo</label>
          <input
            type="text"
            name="model"
            className="w-full border border-gray-300 rounded-md p-2 text-black"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Estado</label>
          <select
            name="status"
            defaultValue="disponible"
            className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
          >
            <option value="disponible">Disponible</option>
            <option value="rentada">Rentada</option>
            <option value="en reparación">En reparación</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md"
        >
          {loading ? "Creando..." : "Crear Máquina"}
        </button>
      </form>
    </div>
  );
}
