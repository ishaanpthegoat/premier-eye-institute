import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { LampGlow } from "@/components/ui/lamp-glow";
import { site } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="bg-ink">
      <LampGlow>
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-7 px-5 pb-20 pt-2 text-center sm:px-8 md:pb-24">
        <Reveal>
          <p className="eyebrow eyebrow-centered mb-4 justify-center">
            Ready when you are
          </p>
          <h2 className="font-heading text-[clamp(30px,4.4vw,52px)] font-medium leading-[1.08] tracking-[-0.5px] text-white">
            Let&apos;s get you{" "}
            <em className="italic text-accent">booked in</em>.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-wrap items-center justify-center gap-3.5">
          <Button asChild variant="pill" size="pill">
            <Link href="/book">Book Appointment</Link>
          </Button>
          <Button asChild variant="pill-ghost" size="pill">
            <a href={site.phoneHref}>
              <Phone className="size-4 text-accent" aria-hidden="true" />
              {site.phoneDisplay}
            </a>
          </Button>
        </Reveal>
        </div>
      </LampGlow>
    </section>
  );
}
