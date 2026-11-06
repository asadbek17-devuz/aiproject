import { uz } from "@/lib/i18n/uz";

const FALLBACK_URL = "https://ai-academy.uz";

function normalizeSiteUrl(value: string | undefined): string {
  if (!value) return FALLBACK_URL;
  try {
    return new URL(value).origin;
  } catch {
    return FALLBACK_URL;
  }
}

export const siteConfig = {
  name: uz.common.appName,
  title: uz.meta.title,
  description: uz.meta.description,
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "uz_UZ",
  language: "uz",
  keywords: [
    "AI mentor",
    "dasturlash o'rganish",
    "veb dasturlash",
    "HTML kurs",
    "CSS kurs",
    "JavaScript kurs",
    "o'zbek tilida IT",
    "onlayn ta'lim",
    "AI Academy",
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
