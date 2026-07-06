import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";

const faqs = [
  {
    q: "Do you take my insurance?",
    a: "We accept VSP (including the VSP Premier Program) and CareCredit, and we work with other plans too. Call us with your insurance card handy and we'll verify your coverage before your visit.",
  },
  {
    q: "Do you see kids?",
    a: "Yes — we provide full eye and vision exams for the whole family, from a child's first exam to lifelong care.",
  },
  {
    q: "Can I come in on a Saturday?",
    a: "Saturdays are by appointment only. Call the office and we'll find a time that works for your schedule.",
  },
  {
    q: "How do I book an appointment?",
    a: `The fastest way is to call ${site.phoneDisplay} during office hours. You can also send a request through our contact form and we'll call you back, and existing patients can reach us through the Crystal PM patient portal.`,
  },
];

export function Faq() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-3.5">Good to know</p>
          <h2 className="font-heading text-[clamp(30px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-0.5px] text-ink">
            Questions, <em className="italic text-accent">answered</em>.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-[1.6] text-body-text">
            Anything else on your mind? Call{" "}
            <a
              href={site.phoneHref}
              className="font-semibold text-accent-hover underline-offset-4 hover:underline"
            >
              {site.phoneDisplay}
            </a>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-semibold text-accent-hover underline-offset-4 hover:underline"
            >
              send us a message
            </Link>
            .
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion
            type="single"
            collapsible
            className="rounded-lg border border-ink/[0.08] bg-white px-6 shadow-soft sm:px-8"
          >
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="font-heading py-5 text-left text-[17.5px] font-semibold text-ink hover:no-underline sm:text-[19px]">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[14.5px] leading-[1.65] text-body-text">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
