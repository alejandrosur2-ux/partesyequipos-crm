export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Partes y Equipos — Demo</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <a className="text-blue-400 underline" href="/dashboard">
            Ir al Dashboard
          </a>
        </li>
        <li>
          <a className="text-blue-400 underline" href="/reports/machine-statement?code=EXC-001">
            Estado por máquina
          </a>
        </li>
        <li>
          <a className="text-blue-400 underline" href="/reports/statement">
            Estado por cliente
          </a>
        </li>
      </ul>
    </main>
  );
}
