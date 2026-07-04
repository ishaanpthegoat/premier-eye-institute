import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GooeyText } from "@/components/ui/gooey-text";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <GooeyText
        texts={["404", "Blurry", "404", "Out of focus"]}
        className="mb-5 h-24 w-full"
        textClassName="font-heading text-[clamp(56px,9vw,96px)] font-medium text-accent"
      />
      <h1 className="font-heading text-[clamp(40px,6vw,72px)] font-medium leading-[1.05] text-ink">
        This page needs a{" "}
        <em className="italic text-accent">new prescription</em>.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-body-text">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
        Let&apos;s get you back to something clear.
      </p>
      <Button asChild variant="pill" size="pill" className="mt-8">
        <Link href="/">Back to the homepage</Link>
      </Button>
    </section>
  );
}
