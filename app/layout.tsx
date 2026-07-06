import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";
import { site } from "@/lib/site";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://peicare.com"),
  title: {
    default: "Eye Doctor in Creedmoor, NC | Premier Eye Institute",
    template: "%s | Premier Eye Institute",
  },
  description:
    "Premier Eye Institute is an independent optometry practice in Creedmoor, NC led by Dr. Nisha Mehta, OD. Comprehensive eye exams, contact lens fittings, LASIK co-management, and eyewear. Call (919) 734-2273 to book.",
  keywords: [
    "eye doctor Creedmoor NC",
    "optometrist Creedmoor",
    "eye exam Creedmoor",
    "contact lenses Creedmoor NC",
    "Premier Eye Institute",
  ],
  openGraph: {
    title: "Eye Doctor in Creedmoor, NC | Premier Eye Institute",
    description:
      "Comprehensive, unhurried eye care in Creedmoor, NC. Exams, contact lenses, LASIK co-management, and eyewear from Dr. Nisha Mehta, OD.",
    url: "https://peicare.com",
    siteName: "Premier Eye Institute",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Optician",
  name: site.legalName,
  url: site.currentSite,
  telephone: `+1-${site.phone}`,
  faxNumber: `+1-${site.fax}`,
  foundingDate: String(site.founded),
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.zip,
    addressCountry: "US",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday"], opens: "08:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "09:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "08:00", closes: "15:00" },
  ],
  sameAs: [site.facebook, site.twitter],
  founder: { "@type": "Person", name: site.doctor, jobTitle: "Optometrist" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${manrope.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col overflow-x-clip">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileCtaBar />
      </body>
    </html>
  );
}
