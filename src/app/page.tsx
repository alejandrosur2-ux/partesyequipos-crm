export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Partes y Equipos — Demo</h1>
      <ul className="list-disc ml-6 space-y-2">
        <li><a className="text-blue-600 underline" href="/reports/machine-statement?code=EXC-001">Estado por máquina (EXC-001)</a></li>
        <li><a className="text-blue-600 underline" href="/reports/machine-statement/print?code=EXC-001">Vista de impresión — máquina</a></li>
        <li><a className="text-blue-600 underline" href="/reports/statement?client=11111111-1111-1111-1111-111111111111">Estado por cliente</a></li>
      </ul>
    </main>
  );
}
<li><a className="text-blue-400 underline" href="/dashboard">Dashboard</a></li>
