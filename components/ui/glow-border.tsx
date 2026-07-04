"use client";

import { useRef, type ReactNode } from "react";

/* Compact port of 21st.dev "Glowing Effect" (aceternity): an accent arc of
   border light that swings around the card to face the pointer. Rewritten
   from ~190 lines to the essentials — per-card pointer math, no document
   listeners, no motion dependency; the arc angle eases via CSS transition
   on a custom property registered as an <angle>. */

export function GlowBorder({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--glow-angle", `${angle}deg`);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`group/glow relative ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/glow:opacity-100"
        style={{
          background:
            "conic-gradient(from var(--glow-angle, 0deg), transparent 0deg, transparent 140deg, rgba(231,89,42,0.75) 180deg, transparent 220deg, transparent 360deg)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1.5px",
        }}
      />
      {children}
    </div>
  );
}
