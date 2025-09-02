"use client";

import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

export type Slice = { name: string; value: number };

export default function MachinePie({ data }: { data: Slice[] }) {
  return (
    <div className="w-full h-72 rounded-2xl border border-zinc-800 p-4">
      <h3 className="mb-3 text-lg font-medium">Estado de máquinas</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} />
          <Tooltip />
          <Legend />
          {/* Opcional: colores fijos */}
          {data.map((_, i) => <Cell key={i} />)}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
