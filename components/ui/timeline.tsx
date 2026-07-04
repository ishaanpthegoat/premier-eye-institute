"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/* Adapted from 21st.dev "Timeline" (aceternity): a beam that fills the
   spine as you scroll the entries. Warm palette, ResizeObserver instead of
   a one-shot measure, and a static full beam under reduced motion. */

export type TimelineEntry = {
  title: string;
  content: ReactNode;
};

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const spineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = spineRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.getBoundingClientRect().height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 60%"],
  });
  const beamHeight = useTransform(scrollYProgress, [0, 1], [0, height]);
  const beamOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={containerRef} className="w-full">
      <div ref={spineRef} className="relative mx-auto max-w-[1000px]">
        {data.map((item) => (
          <div key={item.title} className="flex justify-start gap-4 pt-12 md:gap-10 md:pt-20">
            <div className="sticky top-28 z-10 flex max-w-xs flex-col items-start self-start md:w-full md:flex-row lg:max-w-sm">
              <span className="absolute left-2 flex size-10 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-ink/[0.07] md:left-2">
                <span className="size-3.5 rounded-full bg-accent-tint ring-1 ring-accent/60" />
              </span>
              <h3 className="font-heading hidden pl-20 text-2xl font-medium text-ink/60 md:block md:text-4xl">
                {item.title}
              </h3>
            </div>
            <div className="relative w-full pl-16 pr-2 md:pl-4">
              <h3 className="font-heading mb-3 block text-left text-xl font-medium text-ink/70 md:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          aria-hidden="true"
          style={{ height: height + "px" }}
          className="absolute left-[27px] top-0 w-[2px] overflow-hidden bg-gradient-to-b from-transparent via-ink/[0.08] to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          {reduced ? (
            <div className="absolute inset-x-0 top-0 h-full w-[2px] rounded-full bg-gradient-to-b from-accent via-accent-hover to-transparent" />
          ) : (
            <motion.div
              style={{ height: beamHeight, opacity: beamOpacity }}
              className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-b from-accent via-accent-hover to-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
}
