"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { loginAction } from "@/modules/auth/actions";
import type { AuthFormState } from "@/modules/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

const initialState: AuthFormState = { error: null };

export function LoginForm({ nextPath }: { nextPath?: string | null }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-control border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <Input
        label={uz.common.email}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="siz@example.com"
        required
        error={state.fieldErrors?.email?.[0]}
      />
      <PasswordInput
        label={uz.common.password}
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        error={state.fieldErrors?.password?.[0]}
      />

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        {uz.auth.submitLogin}
      </Button>

      <p className="text-center text-sm text-muted">
        {uz.auth.noAccount}{" "}
        <Link
          href={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"}
          className="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          {uz.auth.registerLink}
        </Link>
      </p>
    </form>
  );
}
