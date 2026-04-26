export function Row({
  label,
  value,
  color = "slate",
  bold = false,
  large = false,
}: {
  label: string;
  value: string;
  color?: "green" | "red" | "amber" | "slate";
  bold?: boolean;
  large?: boolean;
}) {
  const colors = {
    green: "text-green-700",
    red: "text-red-600",
    amber: "text-amber-700",
    slate: "text-slate-700",
  };
  return (
    <div className={`flex items-center justify-between ${large ? "py-1" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : ""} text-slate-700`}>{label}</span>
      <span className={`${large ? "text-lg" : "text-sm"} ${bold ? "font-bold" : "font-medium"} ${colors[color]}`}>
        {value}
      </span>
    </div>
  );
}
