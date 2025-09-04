export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Máquina no encontrada</h1>
      <p className="text-gray-600">Verifica el enlace o vuelve al listado.</p>
      <a
        href="/machines"
        className="mt-6 inline-block rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
      >
        Ir al listado
      </a>
    </div>
  );
}
