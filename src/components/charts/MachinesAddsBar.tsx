"use client";

type Item = { mes: string; total: number };

export default function MachinesAddsBar({ data }: { data: Item[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 w-full grid place-items-center text-sm text-gray-500">
        Sin datos
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total || 0)) || 1;

  return (
    <div className="w-full">
      {/* Área de barras */}
      <div className="h-56 w-full flex items-end gap-3 p-4 border border-gray-200 rounded-lg">
        {data.map((d, i) => {
          const h = Math.round(((d.total || 0) / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-blue-500 transition-all"
                style={{ height: `${h}%` }}
                aria-label={`${d.mes}: ${d.total}`}
                title={`${d.mes}: ${d.total}`}
              />
              <div className="text-xs text-gray-600 truncate w-full text-center">
                {d.mes}
              </div>
            </div>
          );
        })}
      </div>

      {/* Eje Y sencillo */}
      <div className="flex justify-between text-xs text-gray-500 px-1 mt-2">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
