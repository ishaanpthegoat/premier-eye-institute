"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

/* Adapted from 21st.dev "Testimonials Columns" (sshahaider): an endless,
   slowly rising column of review cards. Restyled to the warm token system,
   avatars swapped for initials (no stock faces for placeholder reviews),
   and the loop pauses entirely under prefers-reduced-motion. */

export type ColumnTestimonial = {
  quote: string;
  name: string;
  detail: string;
};

export function TestimonialsColumn({
  testimonials,
  duration = 18,
  className = "",
}: {
  testimonials: readonly ColumnTestimonial[];
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={className} aria-hidden="true">
      <motion.div
        animate={reduced ? undefined : { translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {Array.from({ length: 2 }).map((_, pass) => (
          <Fragment key={pass}>
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="w-full max-w-xs rounded-lg border border-ink/[0.08] bg-surface p-6 shadow-soft"
              >
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="font-heading mt-3 text-[16.5px] leading-[1.45] text-[#221d19]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-ink/[0.07] pt-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[12.5px] font-bold text-accent-hover">
                    {t.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-bold text-ink">
                      {t.name}
                    </span>
                    <span className="block text-[11.5px] font-medium uppercase tracking-[1.5px] text-soft">
                      {t.detail}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </Fragment>
        ))}
      </motion.div>
    </div>
  );
}
