/**
 * Services scroll-story data — single source of truth for the /services/[slug]
 * scroll-scrubbed cartoon journeys.
 *
 * WHERE THIS GOES: drop this file at `lib/services-journeys.ts`.
 *
 * ⏱ EVERY `duration` VALUE BELOW IS AN EDITABLE PLACEHOLDER.
 * They are typical optometry timings, NOT confirmed Premier Eye Institute facts.
 * Confirm each with the clinic, then edit here. This file is the only place
 * durations live, so changing them here updates every page.
 *
 * ART: each scene's `art` is a local path under /public. The cartoon SVGs are
 * generated (see 03-ASSET-MANIFEST.md) and downloaded into
 * public/services-art/<service>/ by the setup step in the master prompt.
 * `art` is the crisp SVG; `artFallback` is a WebP raster fallback.
 */

export type JourneyScene = {
  /** stable id, used for anchor + art filenames */
  id: string;
  /** short caption headline (2-5 words) */
  headline: string;
  /** one or two plain-language sentences */
  body: string;
  /** ⏱ PLACEHOLDER — human-readable expected time for this step */
  duration: string;
  /** local vector art path (crisp, preferred) */
  art: string;
  /** local raster fallback path (webp) */
  artFallback: string;
  /**
   * How the art layer should drift as it scrubs through its scroll window.
   * Purely presentational; the component lerps between these. Tweak freely.
   */
  drift?: "left" | "right" | "center" | "up";
};

export type ServiceJourney = {
  /** must match a slug in lib/site.ts `services` */
  slug: string;
  title: string;
  /** short story tagline shown in the intro */
  tagline: string;
  /** ⏱ PLACEHOLDER — overall time summary shown on the closing card */
  totalTime: string;
  scenes: JourneyScene[];
  /** closing call to action */
  cta: { label: string; href: string };
};

export const journeys: ServiceJourney[] = [
  {
    slug: "eye-exams",
    title: "Eye & Vision Exams",
    tagline: "Your comprehensive eye exam, start to finish.",
    totalTime: "About 45–60 minutes, start to finish. ⏱ PLACEHOLDER",
    cta: { label: "Book your eye exam", href: "/book" },
    scenes: [
      {
        id: "e1-welcome",
        headline: "Check in, no rush",
        body: "You'll be greeted by name and asked a few quick questions about your history and what brought you in today.",
        duration: "About 5 min ⏱ PLACEHOLDER",
        art: "/services-art/eye-exams/e1-welcome.svg",
        artFallback: "/services-art/eye-exams/e1-welcome.webp",
        drift: "left",
      },
      {
        id: "e2-pretest",
        headline: "A few quick measurements",
        body: "Painless pre-testing captures baseline images and readings of your eyes, so the doctor starts your exam already prepared.",
        duration: "About 10 min ⏱ PLACEHOLDER",
        art: "/services-art/eye-exams/e2-pretest.svg",
        artFallback: "/services-art/eye-exams/e2-pretest.webp",
        drift: "right",
      },
      {
        id: "e3-exam",
        headline: "The exam itself",
        body: "Dr. Mehta checks your vision and the health of your eyes, then walks you through anything she finds in plain English. She never rushes the exam.",
        duration: "About 20–25 min ⏱ PLACEHOLDER",
        art: "/services-art/eye-exams/e3-exam.svg",
        artFallback: "/services-art/eye-exams/e3-exam.webp",
        drift: "center",
      },
      {
        id: "e4-dilation",
        headline: "Sometimes we dilate",
        body: "If we need a wider view of the back of your eye, we'll use drops. They take a little time to work, so you'll relax for a bit while they do.",
        duration: "About 15–20 min wait ⏱ PLACEHOLDER",
        art: "/services-art/eye-exams/e4-dilation.svg",
        artFallback: "/services-art/eye-exams/e4-dilation.webp",
        drift: "left",
      },
      {
        id: "e5-review",
        headline: "Clear answers before you leave",
        body: "We go over your results, your prescription, and anything to keep an eye on. You leave knowing exactly where your eyes stand.",
        duration: "About 5–10 min ⏱ PLACEHOLDER",
        art: "/services-art/eye-exams/e5-review.svg",
        artFallback: "/services-art/eye-exams/e5-review.webp",
        drift: "center",
      },
    ],
  },
  {
    slug: "contact-lenses",
    title: "Contact Lens Exams & Fittings",
    tagline: "Finding the contact lens that fits your life.",
    totalTime:
      "About 45–75 minutes, often paired with your eye exam. ⏱ PLACEHOLDER",
    cta: { label: "Book a contact lens fitting", href: "/book" },
    scenes: [
      {
        id: "c1-lifestyle",
        headline: "It starts with your day",
        body: "Screens, sports, allergies, how often you'd wear them — we talk through your routine first, because that decides which lenses actually suit you.",
        duration: "About 5–10 min ⏱ PLACEHOLDER",
        art: "/services-art/contact-lenses/c1-lifestyle.svg",
        artFallback: "/services-art/contact-lenses/c1-lifestyle.webp",
        drift: "left",
      },
      {
        id: "c2-measure",
        headline: "Measured to fit",
        body: "We measure the curve of your eye and check your tear film, so your lenses sit comfortably and stay comfortable all day.",
        duration: "About 10 min ⏱ PLACEHOLDER",
        art: "/services-art/contact-lenses/c2-measure.svg",
        artFallback: "/services-art/contact-lenses/c2-measure.webp",
        drift: "right",
      },
      {
        id: "c3-types",
        headline: "So many options",
        body: "Daily, extended-wear, disposable, gas-permeable — modern lenses come in many types. We'll explain the trade-offs and narrow it to the right one.",
        duration: "About 5 min ⏱ PLACEHOLDER",
        art: "/services-art/contact-lenses/c3-types.svg",
        artFallback: "/services-art/contact-lenses/c3-types.webp",
        drift: "center",
      },
      {
        id: "c4-trial",
        headline: "Try before you decide",
        body: "We place trial lenses on your eyes and give them a few minutes to settle, so we can see exactly how they feel and fit on you.",
        duration: "About 15–20 min to settle ⏱ PLACEHOLDER",
        art: "/services-art/contact-lenses/c4-trial.svg",
        artFallback: "/services-art/contact-lenses/c4-trial.webp",
        drift: "left",
      },
      {
        id: "c5-fit",
        headline: "Checking the fit",
        body: "We look at how the lens moves and centers on your eye, and fine-tune the choice until it's right.",
        duration: "About 5–10 min ⏱ PLACEHOLDER",
        art: "/services-art/contact-lenses/c5-fit.svg",
        artFallback: "/services-art/contact-lenses/c5-fit.webp",
        drift: "right",
      },
      {
        id: "c6-training",
        headline: "New to contacts? We'll teach you",
        body: "If it's your first time, we'll walk you through putting lenses in, taking them out, and caring for them, until you feel confident.",
        duration: "About 15–20 min ⏱ PLACEHOLDER",
        art: "/services-art/contact-lenses/c6-training.svg",
        artFallback: "/services-art/contact-lenses/c6-training.webp",
        drift: "center",
      },
      {
        id: "c7-order",
        headline: "Ordered and set",
        body: "We finalize your prescription, help you order, and set a follow-up to make sure everything's still comfortable.",
        duration: "About 5 min ⏱ PLACEHOLDER",
        art: "/services-art/contact-lenses/c7-order.svg",
        artFallback: "/services-art/contact-lenses/c7-order.webp",
        drift: "left",
      },
    ],
  },
  {
    slug: "lasik",
    title: "LASIK Co-Management",
    tagline: "LASIK, from your first question to your final follow-up.",
    totalTime:
      "The full journey spans several weeks; most of your visits are short, and your care stays local. ⏱ PLACEHOLDER",
    cta: { label: "Ask us about LASIK", href: "/book" },
    scenes: [
      {
        id: "l1-candidacy",
        headline: "Start with a real conversation",
        body: "LASIK can correct nearsightedness, farsightedness, and astigmatism. First we check whether you're a good candidate, honestly and without pressure.",
        duration: "First visit, about 30–45 min ⏱ PLACEHOLDER",
        art: "/services-art/lasik/l1-candidacy.svg",
        artFallback: "/services-art/lasik/l1-candidacy.webp",
        drift: "left",
      },
      {
        id: "l2-measurements",
        headline: "Precise measurements",
        body: "We map your eyes in detail and prepare everything your surgeon needs, so your procedure is planned around your exact eyes.",
        duration: "About 30 min ⏱ PLACEHOLDER",
        art: "/services-art/lasik/l2-measurements.svg",
        artFallback: "/services-art/lasik/l2-measurements.webp",
        drift: "right",
      },
      {
        id: "l3-surgeon",
        headline: "Matched with a trusted surgeon",
        body: "We work alongside experienced LASIK surgeons and coordinate your procedure, so you're in the right hands on surgery day.",
        duration: "Scheduled with a partner surgeon ⏱ PLACEHOLDER",
        art: "/services-art/lasik/l3-surgeon.svg",
        artFallback: "/services-art/lasik/l3-surgeon.webp",
        drift: "center",
      },
      {
        id: "l4-surgery",
        headline: "The procedure is quick",
        body: "The LASIK procedure itself is fast and done at the surgical center. You'll rest, then head home the same day.",
        duration: "The procedure is about 15 min ⏱ PLACEHOLDER",
        art: "/services-art/lasik/l4-surgery.svg",
        artFallback: "/services-art/lasik/l4-surgery.webp",
        drift: "left",
      },
      {
        id: "l5-followup",
        headline: "We handle your recovery",
        body: "Your follow-up visits happen right here with us. We track your healing and make sure your vision settles in beautifully.",
        duration: "Follow-ups over the days and weeks after ⏱ PLACEHOLDER",
        art: "/services-art/lasik/l5-followup.svg",
        artFallback: "/services-art/lasik/l5-followup.webp",
        drift: "center",
      },
    ],
  },
];

/** Helper: look up a journey by slug (returns undefined if none). */
export function getJourney(slug: string): ServiceJourney | undefined {
  return journeys.find((j) => j.slug === slug);
}
