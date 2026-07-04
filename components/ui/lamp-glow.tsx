"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* Adapted from 21st.dev "Lamp" (aceternity): the conic-gradient lamp that
   widens as the section scrolls into view. Re-lit for the warm palette —
   accent instead of cyan, sized as a section header on the ink band rather
   than a full-screen stage. */

export function LampGlow({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const widen = (from: string, to: string) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0.4, width: from },
          whileInView: { opacity: 1, width: to },
          viewport: { once: true, amount: 0.6 },
          transition: { delay: 0.15, duration: 0.8, ease: [0.65, 0, 0.35, 1] as const },
        };

  return (
    <div className="relative isolate flex w-full flex-col items-center overflow-hidden pt-24">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 flex h-44 items-start justify-center"
      >
        <motion.div
          {...widen("14rem", "28rem")}
          style={{
            backgroundImage:
              "conic-gradient(from 70deg at center top, var(--accent), transparent 28%)",
          }}
          className="absolute right-1/2 top-0 h-44 w-[28rem] opacity-[0.32] [mask-image:linear-gradient(to_bottom,white,transparent_85%)]"
        />
        <motion.div
          {...widen("14rem", "28rem")}
          style={{
            backgroundImage:
              "conic-gradient(from 290deg at center top, transparent 72%, var(--accent))",
          }}
          className="absolute left-1/2 top-0 h-44 w-[28rem] opacity-[0.32] [mask-image:linear-gradient(to_bottom,white,transparent_85%)]"
        />
        <motion.div
          {...widen("10rem", "22rem")}
          className="absolute top-0 h-[3px] w-[22rem] rounded-full bg-accent shadow-[0_0_28px_6px_rgba(231,89,42,0.55)]"
        />
      </div>
      {children}
    </div>
  );
}
