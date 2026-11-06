"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
};

export type SidebarProps = {
  items: SidebarItem[];
  brand?: ReactNode;
  footer?: ReactNode;
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar({ items, brand, footer, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full flex-col gap-6 p-4", className)}>
      {brand ? <div className="px-2">{brand}</div> : null}
      <nav aria-label="Asosiy navigatsiya" className="flex-1">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            if (item.disabled) {
              return (
                <li key={item.href}>
                  <span className="flex cursor-not-allowed items-center gap-3 rounded-control px-3 py-2 text-sm font-medium text-slate-400">
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-muted hover:bg-slate-100 hover:text-ink",
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        active ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer ? <div className="border-t border-line pt-4">{footer}</div> : null}
    </aside>
  );
}
