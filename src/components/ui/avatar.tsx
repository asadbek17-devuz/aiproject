import { cn, initials } from "@/lib/utils";

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "idle" | "thinking" | "speaking";
  className?: string;
};

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

const statusColors = {
  online: "bg-success",
  idle: "bg-slate-300",
  thinking: "bg-warning",
  speaking: "bg-primary-600",
};

export function Avatar({ name, src, size = "md", status, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover", sizes[size])}
        />
      ) : (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-primary-100 font-extrabold text-primary-700 ring-2 ring-white",
            sizes[size],
          )}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
      {status ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-surface",
            statusColors[status],
          )}
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}
