import { cn } from "@/lib/utils";

export type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
};

const tones = {
  primary: "bg-primary-600",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  size = "md",
  tone = "primary",
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium text-muted">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(percent)}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={Math.round(value)}
        aria-label={label}
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70",
          size === "sm" ? "h-2" : "h-3",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tones[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
