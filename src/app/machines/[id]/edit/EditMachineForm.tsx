"use client";

type Props = {
  machine: {
    id: string;
    code?: string | null;
    name?: string | null;
    brand?: string | null;
    model?: string | null;
    serial?: string | null;
    status?: string | null;
    status_enum?: "disponible" | "rentada" | "en_reparacion" | null;
  };
};

export default function EditMachineForm({ machine }: Props) {
  return (
    <form className="space-y-4">
      <input type="hidden" name="id" defaultValue={machine.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm opacity-80">Nombre</span>
          <input
            name="name"
            defaultValue={machine.name ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="block text-sm opacity-80">Código</span>
          <input
            name="code"
            defaultValue={machine.code ?? ""}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black dark:bg-zinc-900 dark:text-white"
          />
        </label>
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
        // Por ahora no hace submit real; solo desbloquea el build
        onClick={(e) => {
          e.preventDefault();
          alert("Formulario de edición cargado. Luego conectamos la acción de guardado.");
        }}
      >
        Guardar cambios
      </button>
    </form>
  );
}
