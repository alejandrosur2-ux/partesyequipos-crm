'use client';

export default function ClientDeleteButton({ onConfirm, label = 'Eliminar' }: { onConfirm: () => void; label?: string }) {
  return (
    <button
      className="btn-primary"
      onClick={(e) => {
        e.preventDefault();
        if (confirm('¿Eliminar máquina?')) onConfirm();
      }}
    >
      {label}
    </button>
  );
}
