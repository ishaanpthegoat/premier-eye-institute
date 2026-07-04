import type { Metadata } from "next";
import {
  CalendarCheck,
  FileText,
  MonitorSmartphone,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Patient Resources & Portal",
  description:
    "Patient resources for Premier Eye Institute in Creedmoor, NC — access the Crystal PM patient portal, new patient information, and contact options.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Patient resources"
        title={
          <>
            Everything you need,{" "}
            <em className="italic text-accent">before and after</em> your
            visit.
          </>
        }
      />

      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-8">
        <Reveal>
          <BentoGrid>
            <BentoCard
              name="Patient portal"
              description="Existing patients can log in to the Crystal PM portal to manage their information."
              icon={MonitorSmartphone}
              href={site.portalUrl}
              cta="Open the portal"
              external
              className="lg:col-span-2"
            />
            <BentoCard
              name="Book an appointment"
              description="The fastest way is a quick call — or send a request and we'll call you back."
              icon={CalendarCheck}
              href="/book"
              cta="Book a visit"
            />
            <BentoCard
              name="New patient forms"
              description="Save time at check-in. Call us before your first visit and we'll make sure your paperwork is ready to go."
              icon={FileText}
              href={site.phoneHref}
              cta={`Call ${site.phoneDisplay}`}
              external
            />
            <BentoCard
              name="Insurance & payments"
              description="We accept VSP (including the Premier Program) and CareCredit — and we'll verify your plan before your visit."
              icon={ShieldCheck}
              href="/payments-insurance"
              cta="See what's covered"
            />
            <BentoCard
              name="Questions between visits"
              description="Wendy and Amanda are happy to help with scheduling, prescriptions, and general questions during office hours."
              icon={Phone}
              href="/contact"
              cta="Contact us"
            />
          </BentoGrid>
        </Reveal>
      </section>

      <CtaBand />
    </>
  );
}
