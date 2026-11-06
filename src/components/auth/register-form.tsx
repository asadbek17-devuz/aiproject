"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { registerAction } from "@/modules/auth/actions";
import type { AuthFormState } from "@/modules/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

const initialState: AuthFormState = { error: null };

export function RegisterForm({ nextPath }: { nextPath?: string | null }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

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
        label={uz.common.name}
        name="name"
        autoComplete="name"
        placeholder="Aziza Karimova"
        required
        minLength={2}
        maxLength={80}
        error={state.fieldErrors?.name?.[0]}
      />
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
        autoComplete="new-password"
        placeholder="••••••••"
        required
        minLength={8}
        hint={uz.auth.passwordHint}
        error={state.fieldErrors?.password?.[0]}
      />

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        {uz.auth.submitRegister}
      </Button>

      <p className="text-center text-sm text-muted">
        {uz.auth.hasAccount}{" "}
        <Link
          href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
          className="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          {uz.auth.loginLink}
        </Link>
      </p>
      <p className="text-center text-xs text-muted">{uz.auth.registerNote}</p>
    </form>
  );
}
