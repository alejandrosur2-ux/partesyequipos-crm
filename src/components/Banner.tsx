// src/components/Banner.tsx
export default function Banner({
  type,
  children,
}: {
  type: "ok" | "err";
  children: React.ReactNode;
}) {
  const styles =
    type === "ok"
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-red-50 text-red-800 border-red-200";
  return (
    <div className={`border rounded p-3 ${styles}`}>
      <p className="text-sm">{children}</p>
    </div>
  );
}
