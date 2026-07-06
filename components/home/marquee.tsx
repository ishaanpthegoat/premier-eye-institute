const WORDS = [
  "Eye exams",
  "Contact lenses",
  "LASIK co-management",
  "Frame styling",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="font-heading whitespace-nowrap px-6 text-[clamp(20px,2.6vw,30px)] font-medium italic text-ink/70 sm:px-9">
            {w}
          </span>
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-accent"
          />
        </span>
      ))}
    </div>
  );
}

/* A slow editorial ticker of everything the practice does. Pure CSS
   animation; pauses on hover and stops entirely under reduced motion. */
export function Marquee() {
  return (
    <section
      aria-label="Services at a glance"
      className="overflow-hidden border-y border-ink/[0.06] bg-surface-alt py-6"
    >
      <div className="group flex w-max motion-safe:animate-[pei-marquee_46s_linear_infinite] motion-safe:hover:[animation-play-state:paused]">
        <Row />
        <div aria-hidden="true" className="flex shrink-0 items-center">
          <Row />
        </div>
      </div>
    </section>
  );
}
