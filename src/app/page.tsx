import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, Code2, PenLine, PlayCircle, Sparkles } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { getSessionUser } from "@/server/auth/session";
import { buttonStyles } from "@/components/ui/button";
import { AppHeader } from "@/components/ui/app-header";
import { Avatar } from "@/components/ui/avatar";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { HomeTracks } from "@/components/marketing/home-tracks";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MethodologyTimeline } from "@/components/marketing/methodology-timeline";
import { CareerPath } from "@/components/marketing/career-path";
import { FeaturedCourse } from "@/components/marketing/featured-course";
import { MentorSection } from "@/components/marketing/mentor-section";
import { Benefits } from "@/components/marketing/benefits";
import { CtaSection } from "@/components/marketing/cta-section";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: uz.meta.title,
  description: uz.meta.description,
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteConfig.name,
      url: siteConfig.url,
      logo: absoluteUrl("/icon-512.png"),
      description: siteConfig.description,
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      publisher: { "@id": absoluteUrl("/#organization") },
    },
    {
      "@type": "Course",
      name: uz.landing.courses.courseTitle,
      description: uz.landing.courses.courseDescription,
      url: siteConfig.url,
      inLanguage: siteConfig.language,
      educationalLevel: uz.landing.courses.badge,
      provider: { "@id": absoluteUrl("/#organization") },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT6H",
      },
    },
  ],
};

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  const hero = uz.landing.hero;

  return (
    <div className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AppHeader user={user} />
      <main id="main" className="flex-1">
        <section className="container-page relative pt-8 sm:pt-10">
          <div className="relative overflow-hidden rounded-[2.25rem] border-2 border-white bg-gradient-to-br from-white via-white to-primary-50/70 p-5 shadow-lift sm:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute inset-0 bg-dotted opacity-40 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-primary-200/50 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-sky-200/50 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-200 bg-white/80 px-4 py-2 text-xs font-extrabold text-primary-700 shadow-soft backdrop-blur">
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-500 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary-600" />
                  </span>
                  {hero.eyebrow}
                </span>

                <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                  {hero.title}{" "}
                  <span className="text-gradient">{hero.titleAccent}</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-muted sm:text-base">
                  {hero.subtitle}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href="/register" className={buttonStyles({ size: "lg" })}>
                    {hero.ctaPrimary}
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </Link>
                  <a href="#metodologiya" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                    <PlayCircle className="size-5" aria-hidden="true" />
                    {hero.ctaSecondary}
                  </a>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex -space-x-2" aria-hidden="true">
                    {["Aziza Karimova", "Sardor Aliyev", "Malika Yusupova"].map((name) => (
                      <Avatar key={name} name={name} size="sm" className="ring-2 ring-white" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-muted">{hero.trust}</p>
                </div>
              </div>

              <div className="relative animate-fade-up [animation-delay:120ms]">
                <div
                  className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-primary-200/70 via-sky-100/60 to-transparent blur-2xl"
                  aria-hidden="true"
                />
                <HeroPreview className="relative" />
                <span className="animate-float absolute -left-4 top-14 hidden items-center gap-1.5 rounded-2xl border-2 border-white bg-white px-3 py-2 text-xs font-extrabold text-primary-700 shadow-lift sm:inline-flex">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {hero.preview.mentorName.split(" — ")[0]}
                </span>
                <span className="animate-float absolute -right-3 bottom-16 hidden items-center gap-1.5 rounded-2xl border-2 border-white bg-white px-3 py-2 text-xs font-extrabold text-ink shadow-lift [animation-delay:1.4s] sm:inline-flex">
                  <Code2 className="size-4 text-primary-600" aria-hidden="true" />
                  {hero.preview.codeCaption}
                </span>
              </div>
            </div>
          </div>

          <dl className="mt-3 grid gap-2 sm:grid-cols-3">
            {hero.stats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-[1.25rem] border-2 border-white bg-white/80 px-4 py-3 shadow-soft backdrop-blur"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  {index === 0 ? (
                    <Sparkles className="size-4" aria-hidden="true" />
                  ) : index === 1 ? (
                    <PenLine className="size-4" aria-hidden="true" />
                  ) : (
                    <Code2 className="size-4" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <dd className="font-display text-xl font-extrabold tracking-tight text-ink">
                    {stat.value}
                  </dd>
                  <dt className="text-[11px] font-bold text-muted">{stat.label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <HomeTracks />
        <HowItWorks />
        <MethodologyTimeline />
        <CareerPath />
        <FeaturedCourse />
        <MentorSection />
        <Benefits />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
