import Link from "next/link";
import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { site, hoursCompact } from "@/lib/site";

export function ContactSection({ heading = true }: { heading?: boolean }) {
  return (
    <section id="contact" className="bg-surface-alt">
      <div className="mx-auto max-w-[1140px] px-5 py-24 sm:px-8 md:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            {heading && (
              <Reveal>
                <p className="eyebrow mb-4">Ready when you are</p>
                <h2 className="font-heading text-[clamp(34px,5vw,62px)] font-medium leading-[1.04] tracking-[-0.6px] text-ink">
                  Book your visit today.
                </h2>
                <p className="mt-4 max-w-[440px] text-base leading-[1.6] text-body-text">
                  New patients welcome. Most exams take under an hour, and
                  we&apos;ll help you make the most of your vision plan.
                </p>
                <div className="mt-8 flex flex-wrap gap-3.5">
                  <Button asChild variant="pill" size="pill">
                    <Link href="/book">Book Appointment</Link>
                  </Button>
                  <Button asChild variant="pill-outline" size="pill">
                    <a href={site.phoneHref}>
                      <Phone className="size-4 text-accent" aria-hidden="true" />
                      {site.phoneDisplay}
                    </a>
                  </Button>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.12} className={heading ? "mt-10" : ""}>
              <div className="rounded-lg border border-ink/[0.07] bg-white p-7 shadow-warm sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                    <MapPin className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[14.5px] font-bold text-ink">Visit us</h3>
                    <address className="mt-0.5 text-sm not-italic leading-relaxed text-body-text">
                      {site.address.street}
                      <br />
                      {site.address.city}, {site.address.state} {site.address.zip}
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

                <div className="my-6 h-px bg-ink/[0.07]" />

                <div className="flex items-start gap-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                    <Clock className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-[14.5px] font-bold text-ink">
                      Office hours
                    </h3>
                    <dl className="mt-1.5 space-y-1 text-[13.5px] leading-[1.9] text-body-text">
                      {hoursCompact.map((h) => (
                        <div key={h.label} className="flex justify-between gap-4">
                          <dt>{h.label}</dt>
                          <dd className="font-semibold text-ink">{h.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.18} className="mt-5">
              <div className="overflow-hidden rounded-lg border border-ink/[0.07] shadow-soft">
                <iframe
                  src={site.mapsEmbedSrc}
                  title="Map showing the Premier Eye Institute office at 2531 E Lyon Station Rd, Suite F, Creedmoor, NC"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[260px] w-full border-0"
                />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:sticky lg:top-24">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
