import type { Metadata } from "next";
import { ShieldCheck, BadgeCheck, CreditCard, Phone, HelpCircle } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { FeatureGrid } from "@/components/ui/feature-grid";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Payments & Insurance",
  description:
    "Premier Eye Institute in Creedmoor, NC accepts VSP (including the VSP Premier Program) and CareCredit. Call (919) 734-2273 to verify your plan.",
};

export default function PaymentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Payments & insurance"
        title={
          <>
            Good care shouldn&apos;t be{" "}
            <em className="italic text-accent">confusing to pay for</em>.
          </>
        }
        lead="We'll help you understand your benefits before your visit, so there are no surprises after it."
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
        <Reveal>
          <FeatureGrid
            columns={4}
            features={[
              {
                title: "VSP",
                description:
                  "We accept Vision Service Plan — exams, lenses, and your eyewear allowance.",
                icon: ShieldCheck,
              },
              {
                title: "VSP Premier Program",
                description:
                  "As a Premier Program location, VSP members often get extra savings here.",
                icon: BadgeCheck,
              },
              {
                title: "CareCredit",
                description:
                  "A healthcare credit card that lets you spread the cost of care and eyewear over time.",
                icon: CreditCard,
              },
              {
                title: "Other plans",
                description:
                  "Networks change, and we accept more plans than we can list. Call and we'll check yours.",
                icon: HelpCircle,
              },
            ]}
          />
        </Reveal>

        <Reveal delay={0.12} className="mt-8">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-surface-alt p-8 text-center sm:p-10">
            <h2 className="font-heading text-2xl font-semibold text-ink">
              Not sure about your plan?
            </h2>
            <p className="max-w-md text-[14.5px] leading-relaxed text-body-text">
              Insurance networks change, and we accept more plans than we can
              list here. Call us with your insurance card handy and we&apos;ll
              verify your coverage in a couple of minutes.
            </p>
            <Button asChild variant="pill" size="pill">
              <a href={site.phoneHref}>
                <Phone className="size-4" aria-hidden="true" />
                Call {site.phoneDisplay}
              </a>
            </Button>
          </div>
        </Reveal>
      </section>

      <CtaBand />
    </>
  );
}
