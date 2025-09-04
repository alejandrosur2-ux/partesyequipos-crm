"use client";
import { useRef } from "react";

export default function DeleteButton() {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => {
        if (confirm("¿Eliminar definitivamente?")) {
          (ref.current?.closest("form") as HTMLFormElement)?.requestSubmit();
        }
      }}
      className="px-4 py-2 border rounded bg-red-600 text-white hover:bg-red-700"
    >
      Eliminar
    </button>
  );
}
