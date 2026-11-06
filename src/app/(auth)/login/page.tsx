import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { uz } from "@/lib/i18n/uz";
import { getSessionUser } from "@/server/auth/session";
import { safeNextPath } from "@/lib/safe-redirect";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: uz.common.login,
  robots: { index: false, follow: false },
};

const demoAccounts = [
  { role: "Talaba", email: "student1@aiacademy.uz", password: "Student123!" },
  { role: "O'qituvchi", email: "teacher@aiacademy.uz", password: "Teacher123!" },
  { role: "Admin", email: "admin@aiacademy.uz", password: "Admin123!" },
];

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);
  const user = await getSessionUser();
  if (user) redirect(nextPath ?? "/dashboard");

  return (
    <AuthShell
      title={uz.auth.loginTitle}
      subtitle={uz.auth.loginSubtitle}
      footer={
        <>
          {uz.auth.noAccount}{" "}
          <Link
            href={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"}
            className="font-semibold text-primary-700 hover:underline"
          >
            {uz.auth.registerLink}
          </Link>
        </>
      }
    >
      <LoginForm nextPath={nextPath} />

      <details className="mt-5 rounded-control border border-line bg-canvas px-3 py-2.5">
        <summary className="cursor-pointer select-none text-xs font-semibold text-muted">
          {uz.auth.demoTitle}
        </summary>
        <div className="mt-2 space-y-1.5">
          {demoAccounts.map((account) => (
            <div
              key={account.email}
              className="flex flex-wrap items-center justify-between gap-1 rounded-[8px] bg-surface px-2.5 py-1.5 text-[11px]"
            >
              <span className="font-semibold text-ink">{account.role}</span>
              <span className="font-mono text-muted">
                {account.email} · {account.password}
              </span>
            </div>
          ))}
          <p className="pt-1 text-[10px] leading-relaxed text-muted">{uz.auth.demoHint}</p>
        </div>
      </details>
    </AuthShell>
  );
}
