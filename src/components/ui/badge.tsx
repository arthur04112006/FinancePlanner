import { cn } from "../../lib/utils";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "blue" | "violet" | "yellow";
}) {
  const tones = {
    neutral: "bg-white/8 text-white/70",
    green: "bg-success/14 text-green-300",
    red: "bg-danger/14 text-red-300",
    blue: "bg-electric/14 text-blue-300",
    violet: "bg-violet/16 text-purple-200",
    yellow: "bg-amber-400/14 text-amber-200",
  };

  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", tones[tone])}>{children}</span>;
}
