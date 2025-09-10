'use client';

export default function MachinesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card">
      <h2 className="font-semibold">Ocurrió un error en Máquinas</h2>
      <p className="text-sm text-neutral-600">Digest: {error?.digest ?? '—'}</p>
      <button className="btn-primary mt-3" onClick={() => reset()}>Reintentar</button>
    </div>
  );
}
