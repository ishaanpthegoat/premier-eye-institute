import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* Adapted from 21st.dev "Bento Grid" (magicui/aceternity): warm-token
   styling, lucide icons, Next Link, and the whole card is the link — the
   original's hover-only CTA hid the affordance from keyboards and touch. */

export function BentoGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid w-full auto-rows-[15rem] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  className = "",
  background,
  icon: Icon,
  description,
  href,
  cta,
  external = false,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  const content = (
    <>
      {background && <div aria-hidden="true">{background}</div>}
      <div className="pointer-events-none z-10 flex flex-col gap-1.5 p-6 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:-translate-y-8">
        <span className="mb-2 inline-flex size-11 items-center justify-center rounded-[12px] bg-accent-tint text-accent transition-transform duration-300 ease-[var(--ease-soft)] group-hover:scale-90">
          <Icon className="size-5" />
        </span>
        <h3 className="font-heading text-[20px] font-semibold text-ink">{name}</h3>
        <p className="max-w-lg text-[14px] leading-[1.55] text-body-text">{description}</p>
      </div>
      <div className="pointer-events-none absolute bottom-0 z-10 flex w-full translate-y-3 items-center p-6 pt-0 opacity-0 transition-[transform,opacity] duration-300 ease-[var(--ease-soft)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-hover">
          {cta}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-colors duration-300 group-hover:bg-accent-tint/20"
      />
    </>
  );

  const cardClass = cn(
    "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-ink/[0.08] bg-surface shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-ink/[0.14] hover:shadow-warm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
    className
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cardClass}>
      {content}
    </Link>
  );
}
