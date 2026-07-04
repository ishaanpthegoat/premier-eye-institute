import type { Metadata } from "next";
import { Phone, Clock, MapPin, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { GlowBorder } from "@/components/ui/glow-border";
import { site, hours } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book an eye exam at Premier Eye Institute in Creedmoor, NC. Call (919) 734-2273 or send a request online — new patients welcome.",
};

export default function BookPage() {
  return (
    <>
      <PageHero
        eyebrow="Book an appointment"
        title={
          <>
            The fastest way to book is a{" "}
            <em className="italic text-accent">quick call</em>.
          </>
        }
        lead="Call during office hours and we'll usually find you a time this week. Prefer to write? Send a request below and we'll call you back."
      />

      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div className="space-y-5">
            <Reveal>
              <a
                href={site.phoneHref}
                className="flex items-center gap-5 rounded-lg bg-accent p-7 text-white shadow-cta transition-transform duration-250 hover:-translate-y-0.5 sm:p-8"
              >
                <span className="inline-flex size-13 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Phone className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold uppercase tracking-[2px] text-white/75">
                    Tap to call
                  </span>
                  <span className="font-heading block text-[clamp(24px,3vw,32px)] font-semibold leading-tight">
                    {site.phoneDisplay}
                  </span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.08}>
              <GlowBorder className="rounded-lg">
              <div className="rounded-lg border border-ink/[0.07] bg-white p-7 shadow-soft sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                    <Clock className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h2 className="text-[14.5px] font-bold text-ink">
                      Office hours
                    </h2>
                    <dl className="mt-2 space-y-1 text-[13.5px] leading-[1.9] text-body-text">
                      {hours.map((h) => (
                        <div key={h.day} className="flex justify-between gap-4">
                          <dt>{h.day}</dt>
                          <dd className="font-semibold text-ink">{h.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
                <div className="my-6 h-px bg-ink/[0.07]" />
                <div className="flex items-start gap-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                    <MapPin className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-[14.5px] font-bold text-ink">
                      Where to find us
                    </h2>
                    <address className="mt-1 text-sm not-italic leading-relaxed text-body-text">
                      {site.addressLine}
                    </address>
                    <a
                      href={site.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Get directions
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
              </GlowBorder>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="px-1 text-[13px] leading-relaxed text-soft">
                Existing patient? You can also reach us through the{" "}
                <a
                  href={site.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Crystal PM patient portal
                </a>
                .
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
