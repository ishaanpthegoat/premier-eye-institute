"use client";

import dynamic from "next/dynamic";

/* The fitting room is WebGL-only — skip prerendering and show a quiet
   placeholder with the stage's exact footprint while the chunk loads. */
const FittingRoom = dynamic(() => import("./fitting-room"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.3fr] lg:gap-12">
      <div className="order-1 flex h-[420px] flex-col items-center justify-center gap-3 rounded-[34px] border border-white/10 bg-[#231c17] sm:h-[520px] lg:order-2 lg:h-[560px]">
        <p className="text-[12px] tracking-[0.14em] text-white/50 uppercase">
          Preparing the fitting room
        </p>
        <div className="h-px w-40 overflow-hidden bg-white/15">
          <div className="h-full w-1/3 motion-safe:animate-[pei-scan_1.2s_linear_infinite] bg-accent" />
        </div>
      </div>
      <div className="order-2 lg:order-1" aria-hidden />
    </div>
  ),
});

export function EyewearStudio() {
  return <FittingRoom />;
}
