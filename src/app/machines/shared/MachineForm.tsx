// src/app/machines/shared/MachineForm.tsx
"use client";

type Machine = {
  id?: string;
  name?: string | null;
  code?: string | null;
  brand?: string | null;
  model?: string | null;
  serial?: string | null;
  type?: string | null;
  location?: string | null;
  status?: string | null;
  base_rate_hour?: number | null;
  base_rate_day?: number | null;
  fuel_consumption?: number | null;
};

export default function MachineForm({
  initial,
  action,
  submitLabel = "Guardar",
}: {
  initial?: Machine;
  action: (fd: FormData) => Promise<any>;
  submitLabel?: string;
}) {
  // valores válidos EXACTOS que existen en tu BD (texto)
  const statusOptions = [
    { value: "disponible", label: "Disponible" },
    { value: "rentada", label: "Rentada" },
    { value: "en_reparacion", label: "En reparación" },
    { value: "no_activa", label: "No activa" },
  ];

  return (
    <form action={action} className="grid gap-4 max-w-3xl">
      {/* ID oculto para UPDATE */}
      {initial?.id && (
        <input type="hidden" name="id" defaultValue={initial.id} />
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre" name="name" defaultValue={initial?.name ?? ""} />
        <Field label="Código" name="code" defaultValue={initial?.code ?? ""} />
        <Field label="Marca" name="brand" defaultValue={initial?.brand ?? ""} />
        <Field label="Modelo" name="model" defaultValue={initial?.model ?? ""} />
        <Field label="Serie" name="serial" defaultValue={initial?.serial ?? ""} />
        <Field label="Tipo" name="type" defaultValue={initial?.type ?? ""} />
        <Field label="Ubicación" name="location" defaultValue={initial?.location ?? ""} />

        <div className="flex flex-col gap-1">
          <label className="text-sm opacity-70">Estado</label>
          <select
            name="status"
            defaultValue={initial?.status ?? "disponible"}
            className="border rounded px-3 py-2 bg-white dark:bg-transparent"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Tarifa hora"
          name="base_rate_hour"
          type="number"
          step="0.01"
          defaultValue={
            initial?.base_rate_hour != null ? String(initial.base_rate_hour) : ""
          }
        />
        <Field
          label="Tarifa día"
          name="base_rate_day"
          type="number"
          step="0.01"
          defaultValue={
            initial?.base_rate_day != null ? String(initial.base_rate_day) : ""
          }
        />
        <Field
          label="Consumo (L/h)"
          name="fuel_consumption"
          type="number"
          step="0.01"
          defaultValue={
            initial?.fuel_consumption != null ? String(initial.fuel_consumption) : ""
          }
        />
      </div>

      <div>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function Field(props: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm opacity-70">{props.label}</label>
      <input
        name={props.name}
        defaultValue={props.defaultValue}
        type={props.type ?? "text"}
        step={props.step}
        className="border rounded px-3 py-2 bg-white dark:bg-transparent"
      />
    </div>
  );
}
