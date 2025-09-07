"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Ocurrió un error en Máquinas</p>
        <p className="text-sm opacity-80">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-3 rounded-md bg-gray-900 px-3 py-1 text-white hover:bg-gray-800"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
