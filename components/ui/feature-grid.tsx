import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

/* Adapted from 21st.dev "Feature Section with hover effects" (aceternity):
   the quiet bordered grid where each cell warms up and its title nudges
   right on hover. Recolored to the warm tokens, lucide icons. */

export type FeatureGridItem = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export function FeatureGrid({
  features,
  columns = 4,
}: {
  features: readonly FeatureGridItem[];
  columns?: 3 | 4;
}) {
  const perRow = columns;
  return (
    <div
      className={cn(
        "relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 md:grid-cols-2",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}
    >
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} perRow={perRow} total={features.length} />
      ))}
    </div>
  );
}

function Feature({
  title,
  description,
  icon: Icon,
  index,
  perRow,
  total,
}: FeatureGridItem & { index: number; perRow: number; total: number }) {
  const firstRow = index < perRow;
  return (
    <div
      className={cn(
        "group/feature relative flex flex-col py-9 lg:border-r lg:border-ink/[0.07]",
        index % perRow === 0 && "lg:border-l lg:border-ink/[0.07]",
        index < total - perRow && "lg:border-b lg:border-ink/[0.07]"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-200 group-hover/feature:opacity-100",
          firstRow
            ? "bg-gradient-to-t from-accent-tint/45 to-transparent"
            : "bg-gradient-to-b from-accent-tint/45 to-transparent"
        )}
      />
      <div className="relative z-10 mb-4 px-8 text-accent">
        <Icon className="size-6" />
      </div>
      <div className="relative z-10 mb-2 px-8">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-r-full bg-ink/[0.12] transition-[height,background-color] duration-200 group-hover/feature:h-8 group-hover/feature:bg-accent"
        />
        <span className="font-heading inline-block text-[19px] font-semibold text-ink transition-transform duration-200 ease-[var(--ease-soft)] group-hover/feature:translate-x-2">
          {title}
        </span>
      </div>
      <p className="relative z-10 max-w-xs px-8 text-[14px] leading-[1.6] text-body-text">
        {description}
      </p>
    </div>
  );
}
