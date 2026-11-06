"use client";

import { useState } from "react";
import Link from "next/link";
import type { Role } from "@prisma/client";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/labels";
import { logoutAction } from "@/modules/auth/actions";
import { buttonStyles } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";

export type HeaderUser = {
  name: string;
  role: Role;
};

export type AppHeaderProps = {
  user?: HeaderUser | null;
  variant?: "marketing" | "app";
};

const marketingLinks = [
  { href: "/#qanday-ishlaydi", label: uz.nav.howItWorks },
  { href: "/courses", label: uz.nav.courses },
  { href: "/#mentor", label: uz.nav.mentor },
  { href: "/#afzalliklar", label: uz.nav.benefits },
];

export function Brand({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
        className,
      )}
      aria-label={uz.common.appName}
    >
      <span className="flex size-10 -rotate-3 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-black text-white shadow-glow transition-transform duration-200 group-hover:rotate-0">
        AI
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">AI Academy</span>
    </Link>
  );
}

export function AppHeader({ user, variant = "marketing" }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 rounded-[1.4rem] border border-white/80 bg-canvas/85 px-3 shadow-lift backdrop-blur-xl sm:px-4">
        <div className="flex items-center gap-6">
          <Brand href={variant === "app" ? "/dashboard" : "/"} />
          {variant === "marketing" ? (
            <nav aria-label="Bo'limlar" className="hidden items-center gap-1 lg:flex">
              {marketingLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-bold text-muted transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/courses"
                className={cn(buttonStyles({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}
              >
                <BookOpen className="size-4" aria-hidden="true" />
                {uz.nav.courses}
              </Link>
              <Link
                href="/dashboard"
                className={cn(buttonStyles({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                {uz.common.dashboard}
              </Link>
              <Dropdown
                menuLabel="Foydalanuvchi menyusi"
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-transparent p-1 pr-2 transition-colors hover:border-line hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                    aria-label="Foydalanuvchi menyusi"
                  >
                    <Avatar name={user.name} size="sm" />
                    <span className="hidden max-w-32 truncate text-sm font-medium text-ink sm:block">
                      {user.name}
                    </span>
                    <ChevronDown className="hidden size-4 text-muted sm:block" aria-hidden="true" />
                  </button>
                }
                items={[
                  {
                    key: "role",
                    label: ROLE_LABELS[user.role],
                    disabled: true,
                  },
                  {
                    key: "dashboard",
                    label: uz.common.dashboard,
                    href: "/dashboard",
                    icon: <LayoutDashboard className="size-4" aria-hidden="true" />,
                  },
                  {
                    key: "courses",
                    label: uz.nav.courses,
                    href: "/courses",
                    icon: <BookOpen className="size-4" aria-hidden="true" />,
                  },
                  {
                    key: "homework",
                    label: uz.actions.homework,
                    href: "/homework",
                    icon: <GraduationCap className="size-4" aria-hidden="true" />,
                  },
                  {
                    key: "reputation",
                    label: uz.reputation.title,
                    href: "/reputation",
                    icon: <Trophy className="size-4" aria-hidden="true" />,
                  },
                  {
                    key: "profile",
                    label: uz.common.profile,
                    href: "/profile",
                    icon: <UserRound className="size-4" aria-hidden="true" />,
                  },
                  {
                    key: "subscription",
                    label: uz.common.subscription,
                    href: "/subscription",
                    icon: <CreditCard className="size-4" aria-hidden="true" />,
                  },
                ]}
              />
              <form action={logoutAction} className="hidden sm:block">
                <button
                  type="submit"
                  className={buttonStyles({ variant: "secondary", size: "sm" })}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {uz.common.logout}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonStyles({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                {uz.common.login}
              </Link>
              <Link
                href="/register"
                className={cn(buttonStyles({ variant: "primary", size: "sm" }), "hidden sm:inline-flex")}
              >
                {uz.common.register}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex size-11 items-center justify-center rounded-2xl border-2 border-line bg-surface text-ink shadow-button-soft transition-all hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 active:translate-y-1 active:shadow-none lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? uz.common.close : uz.common.menu}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="animate-menu-in mx-auto mt-2 w-full max-w-6xl origin-top overflow-hidden rounded-[1.4rem] border border-white/80 bg-surface/95 shadow-lift backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1 p-3">
            {variant === "marketing"
              ? marketingLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-control px-3 py-2.5 text-sm font-medium text-muted hover:bg-slate-100 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))
              : null}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-control px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-100"
                >
                  {uz.common.dashboard}
                </Link>
                <Link
                  href="/courses"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-control px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-100"
                >
                  {uz.nav.courses}
                </Link>
                <Link
                  href="/homework"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-control px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-100"
                >
                  {uz.actions.homework}
                </Link>
                <Link
                  href="/reputation"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-control px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-100"
                >
                  {uz.reputation.title}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-control px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-100"
                >
                  {uz.common.profile}
                </Link>
                <Link
                  href="/subscription"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-control px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-100"
                >
                  {uz.common.subscription}
                </Link>
                <form action={logoutAction} className="pt-1">
                  <button
                    type="submit"
                    className={cn(buttonStyles({ variant: "secondary", size: "md" }), "w-full")}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    {uz.common.logout}
                  </button>
                </form>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={buttonStyles({ variant: "secondary", size: "md" })}
                >
                  {uz.common.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={buttonStyles({ variant: "primary", size: "md" })}
                >
                  {uz.common.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
