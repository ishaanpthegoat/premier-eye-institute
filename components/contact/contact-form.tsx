"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { site } from "@/lib/site";

type Status = "idle" | "submitting" | "success";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed submit re-renders, move focus to the first invalid field.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>("[aria-invalid='true']")
      ?.focus();
  }, [errors]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next: Record<string, string> = {};

    if (!String(data.get("name") ?? "").trim())
      next.name = "Please tell us your name.";
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    if (!phone && !email)
      next.phone = "Add a phone number or email so we can reach you.";
    if (email && !/^\S+@\S+\.\S+$/.test(email))
      next.email = "That email doesn't look right — check for typos.";
    if (!String(data.get("message") ?? "").trim())
      next.message = "Let us know how we can help.";

    setErrors({ ...next });
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    /* No form backend is wired up yet — connect this to Formspree, Resend,
       or the practice's email before launch. We simulate the round trip so
       the UX (loading + confirmation) is complete. */
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex h-full min-h-[380px] flex-col items-center justify-center gap-4 rounded-lg border border-ink/[0.07] bg-white p-8 text-center shadow-warm"
      >
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent-tint text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h3 className="font-heading text-2xl font-semibold text-ink">
          Message sent
        </h3>
        <p className="max-w-xs text-[14.5px] leading-relaxed text-body-text">
          Thanks — we&apos;ll get back to you within one business day. Need us
          sooner? Call{" "}
          <a href={site.phoneHref} className="font-semibold text-accent">
            {site.phoneDisplay}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-ink/[0.07] bg-white p-6 shadow-warm sm:p-8"
    >
      <h3 className="font-heading text-2xl font-semibold text-ink">
        Send us a message
      </h3>
      <p className="mt-1.5 text-[13.5px] text-body-text">
        Questions about services, insurance, or appointments — we&apos;ll
        reply within one business day.
      </p>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-1.5">
          <Label htmlFor="cf-name">
            Name <span aria-hidden="true" className="text-error">*</span>
          </Label>
          <Input
            id="cf-name"
            name="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            className="h-11 rounded-md"
          />
          {errors.name && (
            <p id="cf-name-error" role="alert" className="text-[13px] text-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="cf-phone">Phone</Label>
            <Input
              id="cf-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "cf-phone-error" : undefined}
              className="h-11 rounded-md"
            />
            {errors.phone && (
              <p id="cf-phone-error" role="alert" className="text-[13px] text-error">
                {errors.phone}
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cf-email">Email</Label>
            <Input
              id="cf-email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "cf-email-error" : undefined}
              className="h-11 rounded-md"
            />
            {errors.email && (
              <p id="cf-email-error" role="alert" className="text-[13px] text-error">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="cf-topic">What can we help with?</Label>
          <Select name="topic" defaultValue="appointment">
            <SelectTrigger id="cf-topic" className="h-11 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appointment">Booking an appointment</SelectItem>
              <SelectItem value="exam">Eye or vision exam</SelectItem>
              <SelectItem value="contacts">Contact lenses</SelectItem>
              <SelectItem value="eyewear">Glasses or sunglasses</SelectItem>
              <SelectItem value="insurance">Insurance or billing</SelectItem>
              <SelectItem value="other">Something else</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="cf-message">
            Message <span aria-hidden="true" className="text-error">*</span>
          </Label>
          <Textarea
            id="cf-message"
            name="message"
            rows={4}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "cf-message-error" : undefined}
            className="rounded-md"
          />
          {errors.message && (
            <p id="cf-message-error" role="alert" className="text-[13px] text-error">
              {errors.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={status === "submitting"}
          className="press min-h-12 rounded-full bg-accent text-[15px] font-semibold text-white shadow-cta transition-[transform,translate,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-accent-hover disabled:translate-y-0"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </Button>
        <p className="text-[12px] leading-relaxed text-soft">
          For medical emergencies, call 911. Please don&apos;t include
          sensitive health details in this form.
        </p>
      </div>
    </form>
  );
}
