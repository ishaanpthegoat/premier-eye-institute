import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Award, HeartHandshake } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { withBasePath } from "@/lib/base-path";
import { site, team } from "@/lib/site";

const doctor = team[0];

const highlights = [
  {
    icon: GraduationCap,
    text: "Pennsylvania College of Optometry, with a residency in eye disease at the Baltimore VA",
  },
  {
    icon: Award,
    text: "Fellow of the American Academy of Optometry and former clinical assistant professor at UNC Chapel Hill",
  },
  {
    icon: HeartHandshake,
    text: "Eye care mission work in Guatemala — care with heart, at home and abroad",
  },
];

export function Doctor() {
  return (
    <section className="bg-surface-alt">
      <div className="mx-auto grid max-w-[1140px] items-center gap-12 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-xl bg-gradient-to-br from-hero-wash via-accent-tint to-[#f3dccd] shadow-warm-lg ring-1 ring-ink/5">
            {doctor.photo ? (
              <Image
                src={withBasePath(doctor.photo)}
                alt={doctor.name}
                fill
                sizes="(min-width: 1024px) 420px, 80vw"
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
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]"
            />
          </div>
          <div className="absolute -bottom-5 left-1/2 w-max -translate-x-1/2 rounded-full border border-ink/[0.07] bg-white px-6 py-3 shadow-warm lg:left-auto lg:right-2 lg:translate-x-0">
            <p className="font-heading text-[15px] font-semibold text-ink">
              {site.doctor}
            </p>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[2px] text-soft lg:text-left">
              Optometrist & owner
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow mb-3.5">Meet your doctor</p>
            <h2 className="font-heading text-[clamp(30px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-0.5px] text-ink">
              Care built on{" "}
              <em className="italic text-accent">experience</em> — and time to
              listen.
            </h2>
            <p className="mt-5 max-w-[520px] text-base leading-[1.65] text-body-text">
              Dr. Nisha Mehta founded Premier Eye Institute in {site.founded}{" "}
              to practice eye care the way she believes it should be done:
              thorough, personal, and never rushed. She holds an MBA from East
              Carolina University and has examined more than 5,000 eyes right
              here in Creedmoor.
            </p>
          </Reveal>

          <ul className="mt-8 space-y-4">
            {highlights.map((h, i) => (
              <Reveal as="li" key={h.text} delay={i * 0.09}>
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                    <h.icon className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <p className="pt-1.5 text-[14.5px] leading-relaxed text-body-text">
                    {h.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.2}>
            <Link
              href="/about"
              className="mt-9 inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-[14.5px] font-semibold text-ink transition-colors hover:text-accent"
            >
              Meet the whole team
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
