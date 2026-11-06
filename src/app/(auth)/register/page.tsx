import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { uz } from "@/lib/i18n/uz";
import { getCurrentUser } from "@/server/auth/session";
import { safeNextPath } from "@/lib/safe-redirect";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: uz.common.register,
  robots: { index: false, follow: false },
};

type RegisterPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);
  const user = await getCurrentUser();
  if (user) redirect(nextPath ?? "/dashboard");

  return (
    <AuthShell
      title={uz.auth.registerTitle}
      subtitle={uz.auth.registerSubtitle}
      footer={
        <>
          {uz.auth.hasAccount}{" "}
          <Link
            href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
            className="font-semibold text-primary-700 hover:underline"
          >
            {uz.auth.loginLink}
          </Link>
        </>
      }
    >
      <RegisterForm nextPath={nextPath} />
    </AuthShell>
  );
}
