"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Machine = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  status: "disponible" | "rentada" | "en_reparacion";
};

export default function EditMachinePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar la máquina
  useEffect(() => {
    async function fetchMachine() {
      const res = await fetch(`/api/machines/${params.id}`);
      if (res.ok) {
        setMachine(await res.json());
      }
    }
    fetchMachine();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/machines/${params.id}`, {
      method: "PUT",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      router.push("/machines");
    } else {
      alert("Error al actualizar máquina");
    }
  }

  if (!machine) return <p className="text-white">Cargando...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white text-black rounded-md shadow">
      <h1 className="text-2xl font-bold mb-4">Editar Máquina</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input
            type="text"
            name="name"
            defaultValue={machine.name}
            required
            className="w-full border border-gray-300 rounded-md p-2 text-black"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Marca</label>
          <input
            type="text"
            name="brand"
            defaultValue={machine.brand ?? ""}
            className="w-full border border-gray-300 rounded-md p-2 text-black"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Modelo</label>
          <input
            type="text"
            name="model"
            defaultValue={machine.model ?? ""}
            className="w-full border border-gray-300 rounded-md p-2 text-black"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Estado</label>
          <select
            name="status"
            defaultValue={machine.status}
            className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
          >
            <option value="disponible">Disponible</option>
            <option value="rentada">Rentada</option>
            <option value="en_reparacion">En reparación</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
