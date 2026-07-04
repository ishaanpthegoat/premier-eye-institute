"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* Adapted from 21st.dev "Gooey Text Morphing" (victorwelander). Fixes over
   the original: the rAF loop is actually cancelled on unmount, and under
   prefers-reduced-motion the first text renders statically. */

export function GooeyText({
  texts,
  morphTime = 1.2,
  cooldownTime = 1.4,
  className,
  textClassName,
}: {
  texts: readonly string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}) {
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (text2Ref.current) {
        text2Ref.current.textContent = texts[0];
        text2Ref.current.style.opacity = "100%";
      }
      return;
    }

    let raf = 0;
    let textIndex = texts.length - 1;
    let time = performance.now();
    let morph = 0;
    let cooldown = cooldownTime;

    const setMorph = (fraction: number) => {
      const t1 = text1Ref.current;
      const t2 = text2Ref.current;
      if (!t1 || !t2) return;
      t2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      t2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      const inv = 1 - fraction;
      t1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
      t1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = (now - time) / 1000;
      time = now;
      const wasCoolingDown = cooldown > 0;
      cooldown -= dt;

      if (cooldown <= 0) {
        if (wasCoolingDown) {
          textIndex = (textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[textIndex];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
          }
        }
        morph -= cooldown;
        cooldown = 0;
        let fraction = morph / morphTime;
        if (fraction > 1) {
          cooldown = cooldownTime;
          fraction = 1;
        }
        setMorph(fraction);
      } else {
        morph = 0;
        if (text1Ref.current && text2Ref.current) {
          text2Ref.current.style.filter = "";
          text2Ref.current.style.opacity = "100%";
          text1Ref.current.style.filter = "";
          text1Ref.current.style.opacity = "0%";
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn("relative", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="pei-gooey-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="flex size-full items-center justify-center"
        style={{ filter: "url(#pei-gooey-threshold)" }}
      >
        <span ref={text1Ref} aria-hidden="true" className={cn("absolute inline-block select-none text-center", textClassName)} />
        <span ref={text2Ref} aria-hidden="true" className={cn("absolute inline-block select-none text-center", textClassName)} />
      </div>
    </div>
  );
}
