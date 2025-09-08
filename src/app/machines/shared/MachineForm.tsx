// src/app/machines/shared/MachineForm.tsx
type Machine = {
  id?: string;
  name?: string | null;
  code?: string | null;
  brand?: string | null;
  model?: string | null;
  serial?: string | null;
  status?: string | null;
  type?: string | null;
  location?: string | null;
  base_rate_hour?: number | null;
  base_rate_day?: number | null;
  fuel_consumption?: number | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "—" },
  { value: "disponible", label: "Disponible" },
  { value: "rentada", label: "Rentada" },
  { value: "en_reparacion", label: "En reparación" },
  { value: "activo", label: "Activo" },
];

export default function MachineForm({
  initial,
  action,
  submitLabel = "Guardar",
}: {
  initial?: Machine;
  action: (formData: FormData) => Promise<void> | void;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="grid gap-4 max-w-3xl">
      {initial?.id && <input type="hidden" name="id" defaultValue={initial.id} />}

      <div className="grid sm:grid-cols-2 gap-3">
        <Field name="name" label="Nombre" defaultValue={initial?.name ?? ""} />
        <Field name="code" label="Código" defaultValue={initial?.code ?? ""} />
        <Field name="brand" label="Marca" defaultValue={initial?.brand ?? ""} />
        <Field name="model" label="Modelo" defaultValue={initial?.model ?? ""} />
        <Field name="serial" label="Serie" defaultValue={initial?.serial ?? ""} />

        <label className="grid gap-1">
          <span className="text-sm opacity-80">Estado</span>
          <select
            name="status"
            defaultValue={initial?.status ?? ""}
            className="border rounded px-3 py-2 bg-white text-black dark:bg-white dark:text-black"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <Field name="type" label="Tipo" defaultValue={initial?.type ?? ""} />
        <Field name="location" label="Ubicación" defaultValue={initial?.location ?? ""} />
        <NumberField name="base_rate_hour" label="Tarifa hora" defaultValue={initial?.base_rate_hour ?? undefined} />
        <NumberField name="base_rate_day" label="Tarifa día" defaultValue={initial?.base_rate_day ?? undefined} />
        <NumberField name="fuel_consumption" label="Consumo (L/h)" defaultValue={initial?.fuel_consumption ?? undefined} />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field(props: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm opacity-80">{props.label}</span>
      <input
        name={props.name}
        defaultValue={props.defaultValue}
        className="border rounded px-3 py-2 bg-white text-black dark:bg-white dark:text-black"
      />
    </label>
  );
}

function NumberField(props: { name: string; label: string; defaultValue?: number }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm opacity-80">{props.label}</span>
      <input
        type="number"
        step="any"
        name={props.name}
        defaultValue={props.defaultValue as any}
        className="border rounded px-3 py-2 bg-white text-black dark:bg-white dark:text-black"
      />
    </label>
  );
}
