"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* Adapted from 21st.dev "Text Rotate" (danielpetho), reduced to what this
   site needs: one word swapping on an interval with a spring. Under
   prefers-reduced-motion the first word simply stays put. */

export function TextRotate({
  texts,
  interval = 2600,
  className = "",
}: {
  texts: readonly string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % texts.length);
    }, interval);
    return () => clearInterval(id);
  }, [texts.length, interval, reduced]);

  if (reduced) {
    return <span className={className}>{texts[0]}</span>;
  }

  return (
    <span
      className={`relative inline-flex overflow-hidden py-0.5 align-bottom ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={texts[index]}
          initial={{ y: "80%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-80%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="inline-block"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
