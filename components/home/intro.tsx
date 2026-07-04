import { Reveal } from "@/components/motion/reveal";
import { TextRotate } from "@/components/ui/text-rotate";

/* The Snellen column is a quiet nod to the exam room — decorative only. */
const SNELLEN = ["E", "FP", "TOZ", "LPED"];

export function Intro() {
  return (
    <section className="relative mx-auto max-w-[1000px] px-5 py-24 sm:px-8 md:py-36">
      <div
        aria-hidden="true"
        className="font-heading pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none flex-col items-center gap-3 text-center leading-none text-ink/[0.07] lg:flex"
      >
        <span className="text-7xl">{SNELLEN[0]}</span>
        <span className="text-5xl tracking-[0.3em]">{SNELLEN[1]}</span>
        <span className="text-3xl tracking-[0.35em]">{SNELLEN[2]}</span>
        <span className="text-xl tracking-[0.4em]">{SNELLEN[3]}</span>
        <span className="mt-1 h-px w-16 bg-ink/10" />
        <span className="font-sans text-[10px] uppercase tracking-[3px]">
          20 / 20
        </span>
      </div>

      <Reveal>
        <p className="font-heading mx-auto max-w-[760px] text-center text-[clamp(24px,3.4vw,40px)] font-normal leading-[1.32] tracking-[-0.3px] text-[#221d19] lg:pr-28 lg:text-left">
          A modern practice built around how you actually{" "}
          <TextRotate
            texts={["see", "read", "work", "drive", "play"]}
            className="min-w-[2.6em] text-accent"
          />{" "}
          — thorough exams, honest advice, and eyewear you&apos;ll want to wear
          every day.
        </p>
      </Reveal>
    </section>
  );
}
