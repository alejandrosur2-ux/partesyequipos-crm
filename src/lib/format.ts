// utilidades simples para mostrar importes y fechas
export const fmtQ = (n: number | null | undefined) =>
  `Q ${Number(n ?? 0).toFixed(2)}`;

export const since = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "justo ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const dxy = Math.floor(h / 24);
  return `${dxy} d`;
};
