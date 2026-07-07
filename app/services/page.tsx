import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { ServiceIcon } from "@/components/home/service-icon";
import { Button } from "@/components/ui/button";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Eye Care Services in Creedmoor, NC",
  description:
    "Comprehensive eye exams, contact lens fittings, and LASIK co-management at Premier Eye Institute in Creedmoor, NC.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Everything your eyes need,{" "}
            <em className="italic text-accent">in one place</em>.
          </>
        }
        lead="Exams, contact fittings, and LASIK co-management — all done the same way: unhurried, and explained in plain English."
      />

      <section className="mx-auto max-w-[900px] px-5 pb-24 sm:px-8">
        <ul className="space-y-5">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={Math.min(i * 0.04, 0.2)}>
              <article
                id={s.slug}
                className="scroll-mt-28 rounded-lg border border-ink/[0.08] bg-surface p-7 shadow-soft transition-shadow duration-300 hover:shadow-warm sm:p-9"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:gap-7">
                  <span className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                    <ServiceIcon icon={s.icon} className="size-7" />
                  </span>
                  <div>
                    <h2 className="font-heading text-[26px] font-semibold leading-tight text-ink">
                      <Link
                        href={`/services/${s.slug}`}
                        className="transition-colors duration-200 hover:text-accent"
                      >
                        {s.title}
                      </Link>
                    </h2>
                    <p className="mt-2.5 max-w-[600px] text-[15px] leading-[1.65] text-body-text">
                      {s.long}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Button asChild variant="pill" size="pill-sm" className="min-h-10 px-5 text-[13.5px]">
                        <Link href="/book">Book this service</Link>
                      </Button>
                      <Button asChild variant="pill-outline" size="pill-sm" className="min-h-10 px-5 text-[13.5px]">
                        <a href={site.phoneHref}>
                          <Phone className="size-3.5 text-accent" aria-hidden="true" />
                          Ask us about it
                        </a>
                      </Button>
                      <Link
                        href={`/services/${s.slug}`}
                        className="group/story inline-flex items-center gap-1.5 px-1 text-[13.5px] font-semibold text-accent-hover transition-colors duration-200 hover:text-accent"
                      >
                        See how your visit goes
                        <ArrowRight
                          className="size-3.5 transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover/story:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}
