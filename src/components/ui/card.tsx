import { cn } from "../../lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  accent?: "violet" | "blue" | "green" | "red" | "none";
};

export function Card({ className, accent = "none", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "premium-card rounded-app border border-white/8 bg-panel/92 p-4 shadow-soft backdrop-blur",
        accent === "violet" && "ring-1 ring-violet/25",
        accent === "blue" && "ring-1 ring-electric/25",
        accent === "green" && "ring-1 ring-success/25",
        accent === "red" && "ring-1 ring-danger/25",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-semibold tracking-normal text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-white/45">{subtitle}</p> : null}
      </div>
    </div>
  );
}
