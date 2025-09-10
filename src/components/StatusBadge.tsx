export default function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    disponible: 'bg-green-100 text-green-800',
    rentada: 'bg-blue-100 text-blue-800',
    mantenimiento: 'bg-amber-100 text-amber-800',
    inactiva: 'bg-neutral-200 text-neutral-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[value] ?? 'bg-gray-100 text-gray-700'}`}>
      {value}
    </span>
  )
}
