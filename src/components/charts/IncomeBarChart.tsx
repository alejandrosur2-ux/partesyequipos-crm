"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export type IncomePoint = { month: string; income: number };

export default function IncomeBarChart({ data }: { data: IncomePoint[] }) {
  return (
    <div className="w-full h-72 rounded-2xl border border-zinc-800 p-4">
      <h3 className="mb-3 text-lg font-medium">Ingresos por mes</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
