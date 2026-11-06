import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, name, rows = 5, ...props },
  ref,
) {
  const textareaId = id ?? name;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={textareaId} className="mb-2 block text-sm font-extrabold text-ink">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full resize-y rounded-control border-2 bg-surface px-4 py-3 text-[15px] font-semibold text-ink shadow-press transition-[border-color,box-shadow] duration-150",
          "placeholder:text-slate-400 hover:border-line-strong",
          "focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
          error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
