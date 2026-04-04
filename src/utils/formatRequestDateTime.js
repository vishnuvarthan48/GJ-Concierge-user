/**
 * Request list / tracker timestamps — aligned with admin & staff (12h + AM/PM).
 */
export function formatRequestDateTime(value) {
  if (value == null || value === "") return "—";
  const d = new Date(typeof value === "number" ? value : value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
