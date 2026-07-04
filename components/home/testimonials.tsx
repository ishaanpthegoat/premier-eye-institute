import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TestimonialsColumn } from "@/components/ui/testimonials-column";
import { testimonials } from "@/lib/site";

export function Testimonials() {
  const first = testimonials.slice(0, 3);
  const second = testimonials.slice(3, 6);
  const third = testimonials.slice(6, 9);

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 md:py-36">
      <Reveal className="mb-12 text-center">
        <p className="eyebrow eyebrow-centered mb-3.5 justify-center">
          From our patients
        </p>
        <h2 className="font-heading text-[clamp(30px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-0.5px] text-ink">
          Word travels around <em className="italic text-accent">Creedmoor</em>.
        </h2>
      </Reveal>

      {/* Endless columns are decorative; the same reviews are listed for
          screen readers below. */}
      <Reveal className="flex justify-center gap-5 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] max-h-[620px]">
        <TestimonialsColumn testimonials={first} duration={19} />
        <TestimonialsColumn
          testimonials={second}
          duration={25}
          className="hidden md:block"
        />
        <TestimonialsColumn
          testimonials={third}
          duration={21}
          className="hidden lg:block"
        />
      </Reveal>

      <ul className="sr-only">
        {testimonials.map((t) => (
          <li key={t.name}>
            {t.name}, {t.detail}: {t.quote}
          </li>
        ))}
      </ul>

      <Reveal delay={0.1} className="mt-10 text-center">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-[14.5px] font-semibold text-ink transition-colors hover:text-accent"
        >
          Read more reviews
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}
