"use client";

import { cn } from "@/lib/utils";

/* Color swatch row for the fitting room + try-on mirror (dark surfaces). */
export function Swatches<T extends { id: string; label: string; hex: string }>({
  legend,
  options,
  value,
  onChange,
  compact = false,
}: {
  legend: string;
  options: T[];
  value: T;
  onChange: (option: T) => void;
  compact?: boolean;
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
        {legend}
      </legend>
      <div className={cn("flex items-center", compact ? "mt-2 gap-2" : "mt-3 gap-2.5")}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o)}
            aria-label={`${legend}: ${o.label}`}
            aria-pressed={o.id === value.id}
            className={cn(
              "press rounded-full border transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              compact ? "size-7" : "size-8",
              o.id === value.id
                ? "border-accent shadow-[0_0_0_3px_rgba(231,89,42,0.35)]"
                : "border-white/25 hover:border-white/50",
            )}
            style={{ backgroundColor: o.hex }}
          />
        ))}
      </div>
      {!compact && <p className="mt-2.5 text-[13px] text-white/60">{value.label}</p>}
    </fieldset>
  );
}
