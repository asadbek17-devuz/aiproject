import Link from "next/link";
import { uz } from "@/lib/i18n/uz";
import { Brand } from "@/components/ui/app-header";

const columns = [
  {
    title: uz.footer.product,
    links: [
      { href: "/#kurslar", label: uz.footer.links.lessons },
      { href: "/#metodologiya", label: uz.nav.howItWorks },
      { href: "/#mentor", label: uz.footer.links.mentor },
    ],
  },
  {
    title: uz.footer.company,
    links: [
      { href: "/login", label: uz.common.login },
      { href: "/register", label: uz.common.register },
      { href: "/#afzalliklar", label: uz.footer.links.about },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="pb-4 sm:pb-6">
      <div className="container-page">
        <div className="overflow-hidden rounded-[2rem] border-2 border-white bg-white/85 shadow-soft backdrop-blur">
          <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Brand />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                {uz.footer.description}
              </p>
            </div>
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-display text-base font-extrabold text-ink">{column.title}</h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-semibold text-muted transition-colors hover:text-primary-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-2 border-t border-line bg-primary-50/50 px-7 py-5 text-xs text-muted sm:flex-row sm:items-center sm:px-9">
            <p>
              © {new Date().getFullYear()} {uz.common.appName}. {uz.footer.rights}
            </p>
            <p className="flex items-center gap-2">
              <span>{uz.footer.links.privacy}</span>
              <span className="text-line-strong" aria-hidden="true">
                ·
              </span>
              <span>{uz.footer.links.terms}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
