"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function Tabs({ items, defaultValue, value, onValueChange, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value ?? "");
  const active = value ?? internal;

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Tablar"
        className="flex gap-1 overflow-x-auto rounded-control bg-slate-100 p-1 scrollbar-none"
      >
        {items.map((item) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`panel-${item.value}`}
              disabled={item.disabled}
              onClick={() => select(item.value)}
              className={cn(
                "shrink-0 rounded-[8px] px-3.5 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                "disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "bg-surface text-ink shadow-soft"
                  : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) =>
        item.value === active ? (
          <div
            key={item.value}
            role="tabpanel"
            id={`panel-${item.value}`}
            aria-labelledby={`tab-${item.value}`}
            className="pt-4"
          >
            {item.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
