import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { Brand } from "@/components/ui/app-header";
import { MentorAvatar } from "@/components/classroom/mentor-avatar";

export type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgb(255_255_255/0.18),transparent_30%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border-[36px] border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />

        <Link
          href="/"
          className="relative inline-flex w-fit items-center gap-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex size-10 -rotate-3 items-center justify-center rounded-2xl bg-white text-sm font-black text-primary-700 shadow-lift transition-transform hover:rotate-0">
            AI
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">AI Academy</span>
        </Link>

        <div className="relative max-w-md">
          <div className="relative w-fit">
            <MentorAvatar state="speaking" className="sticker size-32 rounded-full" />
            <span className="animate-float absolute -right-8 top-2 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-primary-700 shadow-lift">
              AI mentor
            </span>
            <span className="animate-wiggle absolute -bottom-3 -left-6 inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-extrabold text-amber-950 shadow-lift">
              <Sparkles className="size-3.5" aria-hidden="true" />
              24/7
            </span>
          </div>
          <h2 className="mt-8 text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight">
            {uz.auth.shellTitle}
          </h2>
          <p className="mt-3 text-[15px] font-semibold leading-relaxed text-primary-100">
            {uz.auth.shellSubtitle}
          </p>
          <ul className="mt-7 space-y-3">
            {uz.auth.shellBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm font-semibold text-primary-50">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs font-semibold text-primary-200">{uz.footer.demoNote}</p>
      </aside>

      <main id="main" className="flex flex-col bg-canvas/60">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="lg:hidden">
            <Brand />
          </div>
          <Link
            href="/"
            className="ml-auto rounded-full px-4 py-2 text-sm font-bold text-muted transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            {uz.auth.backHome}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-8">
          <div className="animate-fade-up w-full max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-700">
              <Sparkles className="size-3" aria-hidden="true" />
              AI Academy
            </span>
            <h1 className="mt-4 text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-muted">{subtitle}</p>
            <div className="mt-7 rounded-card border-2 border-white bg-surface p-5 shadow-lift sm:p-7">
              {children}
            </div>
            {footer ? <div className="mt-5 text-center text-sm text-muted">{footer}</div> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
