import { cn } from "../../lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  accent?: "violet" | "blue" | "green" | "red" | "none";
};

export function Card({ className, accent = "none", ...props }: CardProps) {
  const interactiveProps = props.onClick
    ? {
        role: "button",
        tabIndex: 0,
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            props.onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
          }
        },
      }
    : {};

  return (
    <div
      className={cn(
        "premium-card rounded-app border border-white/8 bg-panel/92 p-4 shadow-soft backdrop-blur",
        props.onClick && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet/45",
        accent === "violet" && "ring-1 ring-violet/25",
        accent === "blue" && "ring-1 ring-electric/25",
        accent === "green" && "ring-1 ring-success/25",
        accent === "red" && "ring-1 ring-danger/25",
        className,
      )}
      {...interactiveProps}
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
