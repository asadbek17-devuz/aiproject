"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type DropdownItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
};

export type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  menuLabel?: string;
};

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
  menuLabel = "Menyu",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <div onClick={() => setOpen((current) => !current)}>{trigger}</div>
      {open ? (
        <div
          role="menu"
          aria-label={menuLabel}
          className={cn(
            "animate-menu-in absolute z-40 mt-2 min-w-52 overflow-hidden rounded-card border border-line bg-surface p-1.5 shadow-lift",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => {
            const content = (
              <>
                {item.icon ? <span className="text-muted">{item.icon}</span> : null}
                <span>{item.label}</span>
              </>
            );
            const classes = cn(
              "flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
              item.danger
                ? "text-danger hover:bg-danger-soft"
                : "text-ink hover:bg-slate-100",
              item.disabled ? "pointer-events-none opacity-50" : "",
            );

            if (item.href) {
              return (
                <Link
                  key={item.key}
                  role="menuitem"
                  href={item.href}
                  className={classes}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={classes}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
