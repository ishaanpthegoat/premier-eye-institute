"use client";

import { useRef, type ReactNode } from "react";

/* Adapted from 21st.dev "Spotlight Card" (easemize): a warm pointer-follow
   spotlight. Rewritten for a light theme — per-card listeners instead of a
   global pointermove, an accent-tint radial instead of hue-rotating HSL,
   and no fixed background-attachment (it forces repaints on scroll).
   Desktop-only by nature: the spotlight simply never moves on touch. */

export function SpotlightCard({
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--spot-x", `${x}px`);
      el.style.setProperty("--spot-y", `${y}px`);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`group/spot relative ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(231, 89, 42, 0.08), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
