import { cn } from "../../lib/utils";

export function Progress({
  value,
  className,
  tone = "violet",
}: {
  value: number;
  className?: string;
  tone?: "violet" | "blue" | "green" | "red";
}) {
  const colors = {
    violet: "from-violet to-electric",
    blue: "from-electric to-cyan-300",
    green: "from-success to-emerald-300",
    red: "from-danger to-orange-300",
  };

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", colors[tone])}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
