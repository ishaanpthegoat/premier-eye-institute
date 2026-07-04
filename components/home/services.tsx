import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ServiceIcon } from "@/components/home/service-icon";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { services } from "@/lib/site";

export function Services() {
  return (
    <section
      id="services"
      className="mx-auto max-w-[1200px] px-5 pb-24 pt-20 sm:px-8 md:pb-36 md:pt-28"
    >
      <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-3.5">What we do</p>
          <h2 className="font-heading text-[clamp(30px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-0.5px] text-ink">
            Care for every kind of eye.
          </h2>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-[14.5px] font-semibold text-ink transition-colors hover:text-accent"
        >
          Explore all services
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Reveal>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal
            as="li"
            key={s.slug}
            delay={(i % 3) * 0.09}
            className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
          >
            <SpotlightCard className="h-full rounded-lg">
              <Link
                href={`/services#${s.slug}`}
                className="group flex h-full flex-col rounded-lg border border-ink/[0.08] bg-surface p-7 pb-8 transition-[transform,translate,border-color,box-shadow] duration-[400ms] ease-[var(--ease-soft)] hover:-translate-y-1 hover:border-ink/[0.14] hover:shadow-warm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span className="mb-5 inline-flex size-[46px] items-center justify-center rounded-[13px] bg-accent-tint text-accent">
                  <ServiceIcon icon={s.icon} />
                </span>
                <h3 className="font-heading text-[22px] font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.62] text-body-text">
                  {s.short}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13.5px] font-semibold text-accent opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Learn more
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </SpotlightCard>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
