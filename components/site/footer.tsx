import Link from "next/link";
import { MapPin, Phone, Printer, ExternalLink } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { nav, site, hoursCompact, services } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-20">
        <div>
          <Logo dark />
          <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-[#b8afa8]">
            An independent optometry practice serving Creedmoor and the
            surrounding Triangle since {site.founded}. Led by {site.doctor}.
          </p>
          <div className="mt-6 flex gap-4 text-[13.5px] text-[#b8afa8]">
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-white"
            >
              Facebook
            </a>
            <a
              href={site.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-white"
            >
              X / Twitter
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-semibold uppercase tracking-[2.6px] text-accent">
            Explore
          </h2>
          <ul className="mt-5 space-y-2.5 text-[14.5px]">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[#d8d1cb] underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/patient-resources"
                className="text-[#d8d1cb] underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Patient Resources
              </Link>
            </li>
            <li>
              <a
                href={site.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#d8d1cb] underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Patient Portal
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Services">
          <h2 className="text-xs font-semibold uppercase tracking-[2.6px] text-accent">
            Services
          </h2>
          <ul className="mt-5 space-y-2.5 text-[14.5px]">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-[#d8d1cb] underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[2.6px] text-accent">
            Visit us
          </h2>
          <address className="mt-5 space-y-3 text-[14.5px] not-italic text-[#d8d1cb]">
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 transition-colors hover:text-white"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state} {site.address.zip}
              </span>
            </a>
            <a
              href={site.phoneHref}
              className="flex items-center gap-2.5 transition-colors hover:text-white"
            >
              <Phone className="size-4 shrink-0 text-accent" aria-hidden="true" />
              {site.phoneDisplay}
            </a>
            <p className="flex items-center gap-2.5">
              <Printer className="size-4 shrink-0 text-accent" aria-hidden="true" />
              Fax {site.fax}
            </p>
          </address>
          <dl className="mt-5 space-y-1 text-[13px] text-[#b8afa8]">
            {hoursCompact.map((h) => (
              <div key={h.label} className="flex justify-between gap-4">
                <dt>{h.label}</dt>
                <dd className="text-[#d8d1cb]">{h.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[13px] text-[#b8afa8] sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.legalName} · Creedmoor, NC
          </p>
          <p>
            <a
              href={site.phoneHref}
              className="underline-offset-4 hover:text-white hover:underline"
            >
              Call {site.phoneDisplay}
            </a>{" "}
            to book an appointment
          </p>
        </div>
      </div>
    </footer>
  );
}
