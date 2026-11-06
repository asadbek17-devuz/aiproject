"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { Input, type InputProps } from "@/components/ui/input";

export function PasswordInput(props: Omit<InputProps, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-1 top-[1.9rem] inline-flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        aria-label={visible ? uz.common.hidePassword : uz.common.showPassword}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
