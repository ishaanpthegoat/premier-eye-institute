import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

/* Adapted from 21st.dev "Display Cards" (Codehagen): the skewed fanned
   stack, warmed up — no grayscale veil, accent icon chips, and the fan
   flattens politely on touch layouts (stack only fans from md up). */

export type DisplayCardItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  meta: string;
  className?: string;
};

export function DisplayCards({ cards }: { cards: DisplayCardItem[] }) {
  return (
    <div className="grid place-items-center gap-4 md:[grid-template-areas:'stack'] md:gap-0">
      {cards.map(({ icon: Icon, title, description, meta, className }) => (
        <div
          key={title}
          className={cn(
            "relative flex w-full max-w-[22rem] flex-col justify-between gap-3 rounded-lg border border-ink/[0.08] bg-white/85 px-5 py-4 shadow-soft backdrop-blur-sm transition-[transform,translate,border-color,box-shadow] duration-500 ease-[var(--ease-soft)]",
            "md:h-40 md:w-[22rem] md:-skew-y-[8deg] md:[grid-area:stack] md:after:absolute md:after:-right-1 md:after:top-[-5%] md:after:h-[110%] md:after:w-[20rem] md:after:bg-gradient-to-l md:after:from-white md:after:to-transparent md:after:content-[''] md:hover:border-accent/40 md:hover:shadow-warm",
            className
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent-tint">
              <Icon className="size-4 text-accent" />
            </span>
            <p className="font-heading text-[18px] font-semibold text-ink">{title}</p>
          </div>
          <p className="text-[14px] leading-snug text-body-text">{description}</p>
          <p className="text-[12px] font-medium uppercase tracking-[1.5px] text-soft">{meta}</p>
        </div>
      ))}
    </div>
  );
}
