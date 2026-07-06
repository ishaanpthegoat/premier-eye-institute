import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
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
            <em className="italic text-accent">under one roof</em>.
          </>
        }
        lead="From routine exams to specialty lenses, every service is delivered the same way: unhurried, explained in plain English, and tailored to you."
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
                      {s.title}
                    </h2>
                    <p className="mt-2.5 max-w-[600px] text-[15px] leading-[1.65] text-body-text">
                      {s.long}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild variant="pill" size="pill-sm" className="min-h-10 px-5 text-[13.5px]">
                        <Link href="/book">Book this service</Link>
                      </Button>
                      <Button asChild variant="pill-outline" size="pill-sm" className="min-h-10 px-5 text-[13.5px]">
                        <a href={site.phoneHref}>
                          <Phone className="size-3.5 text-accent" aria-hidden="true" />
                          Ask us about it
                        </a>
                      </Button>
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
