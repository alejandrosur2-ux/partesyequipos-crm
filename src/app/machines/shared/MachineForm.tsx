"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createMachine, updateMachine } from "../actions";

const STATUS = [
  { value: "disponible", label: "Disponible" },
  { value: "rentada", label: "Rentada" },
  { value: "en_reparacion", label: "En reparación" },
] as const;

type MachineInput = {
  id?: string;
  code?: string | null;
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  serial?: string | null;
  type?: string | null;
  status?: string | null;
  base_rate_hour?: number | null;
  base_rate_day?: number | null;
  fuel_consumption?: number | null;
  location?: string | null;
};

export default function MachineForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: MachineInput;
}) {
  const router = useRouter();
  const action = mode === "create" ? createMachine : updateMachine;
  const [state, formAction] = useFormState(action, { ok: false, message: "" });
  const { pending } = useFormStatus();

  if (state.ok) {
    router.push("/machines");
  }

  return (
    <form action={formAction} className="p-6 space-y-4 max-w-2xl">
      {mode === "edit" && (
        <input type="hidden" name="id" defaultValue={initialData?.id} />
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Field name="name" label="Nombre" defaultValue={initialData?.name ?? ""} />
        <Field name="code" label="Código" defaultValue={initialData?.code ?? ""} />
        <Field name="brand" label="Marca" defaultValue={initialData?.brand ?? ""} />
        <Field name="model" label="Modelo" defaultValue={initialData?.model ?? ""} />
        <Field name="serial" label="Serie" defaultValue={initialData?.serial ?? ""} />
        <Field name="type" label="Tipo" defaultValue={initialData?.type ?? ""} />
        <Field name="location" label="Ubicación" defaultValue={initialData?.location ?? ""} />
        <div>
          <label className="block text-sm opacity-80 mb-1">Estado</label>
          <select
            name="status"
            defaultValue={initialData?.status ?? "disponible"}
            className="w-full rounded border px-3 py-2 bg-white text-black dark:bg-white dark:text-black"
          >
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Field name="base_rate_hour" label="Tarifa hora" type="number" step="0.01"
               defaultValue={initialData?.base_rate_hour ?? ""} />
        <Field name="base_rate_day" label="Tarifa día" type="number" step="0.01"
               defaultValue={initialData?.base_rate_day ?? ""} />
        <Field name="fuel_consumption" label="Consumo (L/h)" type="number" step="0.01"
               defaultValue={initialData?.fuel_consumption ?? ""} />
      </div>

      {state.message && <p className="text-red-600">{state.message}</p>}

      <button disabled={pending} className="btn btn-primary">
        {pending ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
      </button>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-sm opacity-80 mb-1">{label}</label>
      <input
        {...rest}
        className="w-full rounded border px-3 py-2 bg-white text-black dark:bg-white dark:text-black"
      />
    </div>
  );
}
