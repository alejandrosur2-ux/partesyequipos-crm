// src/app/machines/new/NewMachineForm.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewMachineForm() {
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [status, setStatus] = useState("activo");
  const [rate, setRate] = useState("");

  const handleCreate = async () => {
    const { error } = await supabase.from("machines").insert({
      name,
      serial: serial || null,
      status,
      daily_rate: rate ? Number(rate) : null,
    });
    if (error) return alert(error.message);
    setName(""); setSerial(""); setStatus("activo"); setRate("");
    alert("Creada");
  };

  return (
    <div className="space-y-2 max-w-md">
      <input className="border p-2 w-full" placeholder="Nombre"
        value={name} onChange={e => setName(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Serie (opcional)"
        value={serial} onChange={e => setSerial(e.target.value)} />
      <select className="border p-2 w-full" value={status}
        onChange={e => setStatus(e.target.value)}>
        <option value="activo">activo</option>
        <option value="taller">taller</option>
        <option value="rentada">rentada</option>
        <option value="baja">baja</option>
      </select>
      <input type="number" step="0.01" className="border p-2 w-full"
        placeholder="Tarifa diaria (opcional)"
        value={rate} onChange={e => setRate(e.target.value)} />
      <button className="border px-4 py-2 rounded" onClick={handleCreate}>
        Crear
      </button>
    </div>
  );
}

