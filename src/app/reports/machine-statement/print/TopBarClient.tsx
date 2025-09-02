'use client';

import Link from 'next/link';
import { useEffect } from 'react';

type Props = {
  backHref: string;
  code: string;
  from: string;
  to: string;
  auto?: boolean;
};

export default function TopBarClient({ backHref, code, from, to, auto }: Props) {
  // Si llega ?auto=1, abre el diálogo de impresión al cargar
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 120);
      return () => clearTimeout(t);
    }
  }, [auto]);

  return (
    <div className="print:hidden sticky top-0 z-10 bg-white border-b">
      <div className="mx-auto max-w-[900px] px-4 py-2 flex items-center justify-between">
        <div className="text-sm">
          Estado por máquina · <b>{code || '—'}</b> · {from} → {to}
        </div>
        <div className="flex gap-4 text-sm">
          <Link href={backHref} className="underline">
            Volver al reporte
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border px-3 py-1 hover:bg-black hover:text-white"
          >
            Imprimir
          </button>
          <span>
            Imprime con <b>Ctrl/Cmd + P</b>
          </span>
        </div>
      </div>
    </div>
  );
}
