import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { Timeline } from "@/components/ui/timeline";
import { withBasePath } from "@/lib/base-path";
import { team, doctorCredentials, site } from "@/lib/site";

const doctor = team[0];

const visitSteps = [
  {
    title: "Check-in",
    content: (
      <p className="max-w-md text-[15px] leading-[1.65] text-body-text">
        A warm welcome from the front desk, a few minutes of paperwork if
        you&apos;re new, and quick pre-testing to map how your eyes are doing
        today.
      </p>
    ),
  },
  {
    title: "The exam",
    content: (
      <p className="max-w-md text-[15px] leading-[1.65] text-body-text">
        Unhurried time with Dr. Mehta — modern imaging and screening, honest
        answers, and a prescription you can trust.
      </p>
    ),
  },
  {
    title: "The optical",
    content: (
      <p className="max-w-md text-[15px] leading-[1.65] text-body-text">
        If you need eyewear, our optical team helps you find frames that fit
        your face, your prescription, and your budget — then adjusts them
        until they&apos;re right.
      </p>
    ),
  },
  {
    title: "After your visit",
    content: (
      <p className="max-w-md text-[15px] leading-[1.65] text-body-text">
        You leave with a clear plan for your eyes. Between visits, we&apos;re a
        phone call away — and existing patients can use the Crystal PM portal.
      </p>
    ),
  },
];

export const metadata: Metadata = {
  title: "About Us & Meet the Team",
  description:
    "Meet Dr. Nisha Mehta, OD and the team at Premier Eye Institute — an independent optometry practice serving Creedmoor, NC since 2014.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            Independent, local, and{" "}
            <em className="italic text-accent">personal</em> since{" "}
            {site.founded}.
          </>
        }
        lead="Premier Eye Institute is a doctor-owned practice — no corporate playbook, just careful eye care and honest advice for our neighbors in Creedmoor."
      />

      <section className="mx-auto max-w-[1140px] px-5 pb-24 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden rounded-xl bg-gradient-to-br from-hero-wash via-accent-tint to-[#f3dccd] shadow-warm-lg ring-1 ring-ink/5">
              {doctor.photo ? (
                <Image
                  src={withBasePath(doctor.photo)}
                  alt={doctor.name}
                  fill
                  sizes="400px"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-accent">
                  <span className="font-heading text-7xl font-medium">NM</span>
                  <span className="text-xs font-semibold uppercase tracking-[2.6px] text-ink/50">
                    Photo coming soon
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="eyebrow mb-3.5">Your doctor</p>
              <h2 className="font-heading text-[clamp(28px,4vw,46px)] font-medium leading-[1.08] tracking-[-0.5px] text-ink">
                Dr. Nisha Mehta, OD
              </h2>
              <p className="mt-4 text-base leading-[1.65] text-body-text">
                Dr. Mehta founded Premier Eye Institute in {site.founded} and
                has examined more than 5,000 eyes in Creedmoor since. Her
                training spans clinical eye disease, academia, and mission
                work — and it shows in exams that are thorough, calm, and
                clearly explained.
              </p>
            </Reveal>
            <ul className="mt-7 space-y-3">
              {doctorCredentials.map((c, i) => (
                <Reveal as="li" key={c} delay={i * 0.06}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <p className="text-[14.5px] leading-relaxed text-body-text">
                      {c}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1140px] px-5 pb-10 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-3.5">What to expect</p>
          <h2 className="font-heading text-[clamp(28px,4vw,46px)] font-medium leading-[1.08] tracking-[-0.5px] text-ink">
            Your first visit, step by step.
          </h2>
        </Reveal>
        <Timeline data={visitSteps} />
      </section>

      <section className="bg-surface-alt">
        <div className="mx-auto max-w-[1140px] px-5 py-24 sm:px-8">
          <Reveal className="mb-12">
            <p className="eyebrow mb-3.5">Meet the team</p>
            <h2 className="font-heading text-[clamp(28px,4vw,46px)] font-medium leading-[1.08] tracking-[-0.5px] text-ink">
              The people behind your visit.
            </h2>
          </Reveal>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.slice(1).map((m, i) => (
              <Reveal as="li" key={m.name} delay={(i % 3) * 0.08}>
                <div className="flex h-full flex-col rounded-lg border border-ink/[0.07] bg-white p-7 shadow-soft">
                  {m.photo ? (
                    <span className="relative mb-4 inline-block size-16 overflow-hidden rounded-full ring-1 ring-ink/5">
                      <Image
                        src={withBasePath(m.photo)}
                        alt={m.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <span className="font-heading mb-4 inline-flex size-12 items-center justify-center rounded-full bg-accent-tint text-lg font-semibold text-accent">
                      {m.name.charAt(0)}
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-semibold text-ink">
                    {m.name}
                  </h3>
                  <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[1.8px] text-accent">
                    {m.role}
                  </p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-body-text">
                    {m.bio}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
