# Premier Eye Institute — Session Handoff Context

**Last updated:** July 6, 2026 (evening). All systems working. Live preview at https://ishaanpthegoat.github.io/premier-eye-institute/ — **if it ever shows the README instead of the site, run `npm run deploy:pages` to re-sync the live Pages branch.** Latest deploy: commit `91b2a21` on `main`, `gh-pages` force-pushed the same run (propagates in ~1 min per the deploy script; GitHub's own Pages build queue has separately taken up to ~10 min on a bad day — see gotchas below).

## What this is

A complete, working marketing website for **Premier Eye Institute** — an independent optometry practice owned by **Dr. Nisha P. Mehta, OD** in Creedmoor, NC (replacing their old iMatrix template site at peicare.com). The #1 business goal is appointment bookings; most visitors are on phones.

- **Location:** `C:\Users\Ishaa\OneDrive\Desktop\premier-eye-institute`
- **Stack:** Next.js 16.2.10 (App Router, Turbopack), TypeScript, Tailwind CSS v4, shadcn/ui (radix base, nova preset), Framer Motion, Lenis smooth scroll, lucide-react
- **Status:** Built end to end, production build passes, all 12 routes statically prerendered, ESLint clean. Real staff/doctor photos, real patient reviews, and the actual 3-service list are now live (see below) — this was previously the biggest gap before launch.
- **Source-of-truth docs in repo root:** `premier-eye-institute-PRD.md` (facts/plan) and `DESIGN.md` (design tokens). Follow them — but note `lib/site.ts`'s `services` array now intentionally diverges from the original PRD's broader list; the client confirmed only 3 services are real (see below).

## Commands

```bash
npm run dev                            # dev server on :3000
npm run build                          # production build (all static)
npx eslint app components lib          # lint (next lint was removed in Next 16)
npm run deploy:pages                   # build + force-push out/ to gh-pages
```

## Critical environment gotchas

- **Next.js 16 has breaking changes** vs training data. Per `AGENTS.md`: read `node_modules/next/dist/docs/` before using unfamiliar APIs. Turbopack is default, `next lint` removed, `turbopack.root` set in `next.config.ts` to silence a multi-lockfile warning.
- **OneDrive**: `create-next-app --src-dir` fails with EPERM rename here. The project uses root-level `app/` (no `src/`).
- **OneDrive + `.next` EPERM (new, July 6 2026):** running `npm run build` while a dev server (or `preview_start`) is also running against the same folder can throw `EPERM: operation not permitted, unlink .next/static/...` — OneDrive's cloud-sync process locks build artifacts out from under Next.js. Fix: stop the dev server, `Remove-Item -Recurse -Force .next`, then rebuild. Don't run `npm run build` and the dev server concurrently in this repo.
- **`.mcp.json` contains a real 21st.dev API key** and is **gitignored — never commit it**. shadcn MCP and chrome-devtools MCP are also configured and work.
- PowerShell on Windows; `npx <tool> init`-style commands often hang on interactive prompts — pipe input (`"1" | npx …`) or pass explicit flags.
- **Lenis + headless scroll testing (new, July 6 2026):** the site's global `SmoothScroll` (Lenis) intercepts real scroll on every page. In the preview tool, raw `window.scrollTo()` gets silently reverted by Lenis. Synthetic `WheelEvent` dispatches usually drive it correctly on an already-settled page, but were unreliable immediately after a fresh `window.location.href` navigation in one session (Lenis listener attach race, unconfirmed root cause). When that happens, don't fight it — verify below-the-fold assets a different way, e.g. loading a scratch `new Image()` pointed at the same URL to confirm the file itself decodes, instead of relying on scroll-triggered lazy-load.
- **TypeScript + `as const` arrays with divergent optional fields:** if array-literal objects don't all share the same shape (e.g. only some `team` entries have a `photo` field), a bare `[...] as const` infers each entry's own narrow type instead of a common shape, and `.photo` won't type-check on entries missing it. Give the array an explicit type (see `TeamMember` in `lib/site.ts`) instead of relying on inference once entries diverge.

## Design system (client-approved; do not drift)

- **Palette:** white background, **orange accent `#E7592A`** (`--accent`, with `--accent-hover: #C9481E`, `--accent-tint: #FCEBE1`), **mostly black text** — body copy is `--text-body: #2b2520`. Dark sections use `--ink: #1B1714`.
- The accent is deliberately a single variable set — switching to DESIGN.md §2's medical blue means changing the three `--accent*` values in `app/globals.css` only.
- **Fonts:** Newsreader (serif, headings, italic accent words) + Manrope (sans, body) via `next/font`, exposed as `--font-newsreader`/`--font-manrope`; `.font-heading` utility class.
- **Radii:** sm 12 / md 16 / lg 24 / xl 34px; pill buttons. **Shadows:** warm-tinted tokens `--shadow-warm`, `--shadow-warm-lg`, `--shadow-cta`.
- **Motion:** transform/opacity only, `--ease-soft` cubic-bezier(0.22,0.61,0.36,1), reveals fade-up ~26px, always respect `prefers-reduced-motion`.
- **Known AA tension (deliberate):** buttons keep brand `#E7592A` bg with white text (3.6:1, borderline fail); small accent text uses `--accent-hover` (~5:1) instead. User accepted this trade-off.
- **On photo/image treatments:** user dislikes feathered vignette masks that clip real subject detail (removed the hero's radial mask on July 6 pm — see below) — prefers the plain multiply-blend dissolve over the studio-white backdrop without extra masking, even though it means a harder (but still blend-dissolved) edge.
- Anti-patterns to keep out: bounce easing, cards-in-cards, Inter, purple gradients, generic template look.

## Architecture

Business facts (address, phone 919-734-2273, hours, **3 services**, 7 team members — 3 with real photos, credentials, stats, 9 real testimonials, nav) are centralized in **`lib/site.ts`** — edit once, propagates everywhere. Design tokens + keyframes (`pei-marquee`, `pei-float`) in **`app/globals.css`**.

```
app/
  layout.tsx        fonts, SEO metadata, LocalBusiness JSON-LD, Header/Footer/MobileCtaBar/SmoothScroll
  page.tsx          Home: VideoHero → Intro → Marquee → Services → Doctor → Testimonials → Stats → Faq → ContactSection
  about/ services/ eyewear/ reviews/ payments-insurance/ patient-resources/ contact/ book/
  sitemap.ts robots.ts not-found.tsx
components/
  home/video-hero.tsx    ★ the scroll-scrubbed hero (see below)
  home/hero-shader.tsx   ★ warm WebGL wash behind the hero (no deps, raw WebGL)
  home/{intro,marquee,services,doctor,testimonials,stats,faq,service-icon}.tsx
  site/{header,footer,logo,page-hero,cta-band,mobile-cta-bar,smooth-scroll}.tsx
  contact/{contact-section,contact-form}.tsx
  motion/{reveal,count-up}.tsx          (framer-motion whileInView wrapper; rAF count-up)
  ui/                                    shadcn components
public/hero-frames/frame_0001…0122.webp   public/hero-fallback/*.webp   public/team/{dr-mehta,katie,maddie}.webp   public/logo.webp
```

## The video hero (`components/home/video-hero.tsx`) — the signature piece (rebuilt July 6 2026: canvas image-sequence scrubber)

- **The MP4 scrubber is gone** (`video.currentTime` seeking stuttered/froze). The hero now draws a **preloaded WebP frame sequence on a `<canvas>`**: `public/hero-frames/frame_0001…0122.webp` (900×900, libwebp q62, ~3.9 MB total). Story: glasses → morph → phoropter → shatter apart → suspended parts → reform → auto-refractor. Built from two 10s/24fps morph MP4s (every 4th frame) + three anchor stills; **every frame color-graded from the source's blue accents to brand orange** with ffmpeg `huesaturation=hue=-175:colors=c+b:strength=100:saturation=0.12` (selective — keeps the phoropter's green level bubble; global `hue` breaks it). Same-graded anchor stills live at `public/hero-fallback/{glasses,phoropter,autorefractor}.webp`. `hero-story.mp4` was deleted (restorable via git history).
- Scroll progress → frame index through the **STORY storyboard with HOLD zones** (0-based boundaries: glasses hold = 0; morph 1 = 0→61; phoropter hold = 61; shatter = 61→91; shatter-apex hold = 91; reform = 91→121; auto-refractor hold = 121). Each caption peaks inside a hold so text never sits over a moving frame; scene 03 ("The precision") narrates the shatter apex — the exploded instrument suspended mid-air got its own micro-hold. Runway **700vh** (widened same day — user wanted more scroll per slide; holds re-budgeted wider, `CAPTION_FADE = 5` gives a snappy fade in/out but a long full-opacity plateau — measured 449–622px of scroll per caption at full opacity, up from ~286–396px), frame LERP **0.09** (slow scrub — keep), `drawImage` only when the rounded index changes, backing store = CSS size × devicePixelRatio (capped at 2), one persistent rAF loop + refs. All frames are `img.decode()`d behind a thin loader veil ("Loading…" + hairline accent bar) before the scrub enables; **phones (<768px) load every other frame plus the 4 exact hold poses (64 requests ≈ 2 MB)**.
- **Frameless, blended into the page, no vignette**: the art gets `mix-blend-mode: multiply` + `filter: brightness(1.07)` only — **the radial vignette mask was removed July 6 pm** (it faded the instruments' edge detail and drop shadow, which read as artificial to the user; multiply alone already kills the white studio backdrop). **Blend + filter + transform all live on the `<canvas>` element itself** — the layout wrapper around canvas + loader deliberately has no z-index or transform, since either would create a stacking context that isolates the blend and brings the white backdrop back.
- **The art travels the stage**: `DRIFT_PATH`/`SCALE_PATH` keyframes sampled with smoothstep and lerped in the rAF loop, retuned to the widened hold zones. Desktop drift `min(15vw, 240px)`; <1024px just a 2vw sway. Mouse parallax (±14px/±10px, lerped, mouse-only).
- **Scene windows tuned to the hold zones:** 0.06–0.24 left (glasses hold 0–0.20), 0.37–0.56 right (phoropter hold 0.38–0.55), 0.62–0.76 left (shatter-apex hold 0.63–0.75), 0.83–0.99 center (auto-refractor hold 0.84–1.0). Retune by editing the `STORY` from/to columns in video-hero.tsx — they're commented.
- **Scene 04 copy rewritten** (was "glaucoma testing... corneal mapping behind Ortho-K" — a mismatch with the auto-refractor visual, *and* named two services the practice doesn't actually offer). Now reads "Precise measurements behind every exam and prescription — advanced imaging, clearly explained," which fits the visual and doesn't claim a removed service.
- **`hero-shader.tsx`**: raw-WebGL fragment shader behind the stage, unchanged this session. Not mounted under reduced motion.
- Reduced motion: no pinning, no canvas — the three graded fallback stills in normal flow, each with its caption(s) beneath (phoropter carries scenes 02 + 03), CTA above the stills.

## Real content pass (July 6 2026, evening)

The client sent real staff photos, real Google reviews, and the practice's actual service list (the old peicare.com copy). All three landed this session:

- **Staff/doctor photos**: real files arrived in `Downloads/` already named `maddie.webp`, `katie.webp`, `drmehta.png.webp` — matched directly to `lib/site.ts`'s existing `Maddie` (Optical Specialist) / `Katie` (Optometric Technician) / `Dr. Nisha Mehta, OD` entries, no guessing needed. Copied into `public/team/` (Maddie/Katie center-cropped to 280×280 square via ffmpeg; Dr. Mehta's headshot copied as-is, 363×434). Wired into the homepage `Doctor` section, the About page doctor bio slot, and the About page team grid (replacing the initials-badge for whichever team members have a `photo`). Required adding an explicit `TeamMember` type to `lib/site.ts` (see gotchas above).
- **Testimonials**: replaced all 9 placeholders with real Google reviews — Ashley Harrell, Denise Green, Carolyn Peace, Alejandro Casarrubias-Rauda, Sherri Baker, Crystal Hart, Cathy Lefebvre, Dale Lawrence, Jordan Boice. Two negative/billing-complaint reviews in the source batch were deliberately excluded per the client's "use only the good ones" instruction. Some quotes were lightly trimmed where the Google source text was cut off mid-sentence ("...More").
- **Services trimmed to the real 3**: client confirmed (after being asked directly, since this contradicted the previously-confirmed PRD list) that Premier Eye Institute only offers **Eye & Vision Exams, Contact Lens Exams & Fittings, and LASIK Co-Management** as clinical services — Ortho-K, Dry Eye Treatment, Computer Vision Care, Sports Vision, and Glaucoma Testing were removed from `lib/site.ts`'s `services` array. Glasses/sunglasses stayed as-is on the separate `/eyewear` page (products, not clinical services — the practice clearly still sells them). Since `services` is the single source of truth for both the homepage teaser and `/services` page, trimming it there cascaded automatically; everywhere else that named a removed service was swept and fixed by hand: root layout + `/services` + `/reviews` meta descriptions, the homepage marquee ticker (down to 4 words), the FAQ's "What is Ortho-K?" entry (removed), the contact form's topic dropdown, and the hero's scene 04 caption (see above).

## Motion polish (Emil Kowalski pass, July 3 2026 pm)

- His official skills installed at `.agents/skills/{emil-design-eng,review-animations,animation-vocabulary}` (from github.com/emilkowalski/skills).
- `.press` class (globals.css, **unlayered** so it beats Tailwind layers): `:active → scale(0.97)` on all pill CTAs.
- `--ease-out-strong: cubic-bezier(0.23,1,0.32,1)` token; `Reveal` at 0.7s with that curve.
- CTA transitions: explicit `transition-[transform,translate,background-color,border-color] duration-200`.
- **Magic MCP gotcha**: the server doesn't always get the API key when the session launches from the Desktop cwd — work around by calling the API directly: `POST https://api.21st.dev/api/search` with `x-api-key` from `.mcp.json`.

## 21st.dev component layer (July 3 2026, second pass)

Twelve components pulled from 21st.dev and adapted to the token system in `components/ui/`: `testimonials-column`, `spotlight-card`, `lamp-glow`, `text-rotate`, `timeline`, `bento-grid`, `feature-grid`, `display-cards`, `gooey-text`, `glow-border`, plus the tubelight nav lamp inline in `site/header.tsx`. All animated adaptations handle `prefers-reduced-motion`.

**All pill CTAs go through shadcn `Button`** — variants `pill` / `pill-outline` / `pill-ghost` + sizes `pill` / `pill-sm` in `components/ui/button.tsx`. Don't hand-roll CTA classNames.

Repo: https://github.com/ishaanpthegoat/premier-eye-institute (public; `.mcp.json` key never committed).

## GitHub Pages preview

Live at **https://ishaanpthegoat.github.io/premier-eye-institute/**. `next.config.ts` uses `output: "export"` + `basePath` from `NEXT_PUBLIC_BASE_PATH`; raw asset srcs go through `withBasePath()` from `lib/base-path.ts`. Deploy with **`npm run deploy:pages`** (`scripts/deploy-pages.mjs`: builds with the base path, force-pushes `out/` as a fresh single-commit `gh-pages` branch). The gh CLI token lacks the `workflow` scope so an Actions workflow can't be pushed — run `gh auth refresh -s workflow` if CI deploys are ever wanted. Real launch should still be a proper host/custom domain (peicare.com) — the base path only exists for the Pages subpath.

## Confirmed business facts (from client)

Hours (already in `lib/site.ts`): Mon–Wed 8:00am–5:00pm, Thu 9:00am–6:00pm, Fri 8:00am–3:00pm, **Sat "By Appointment Only"**, Sun Closed. Insurance: VSP incl. Premier Program, CareCredit. Portal: Crystal PM (crystalpm.com). Fax 919-238-4321. Address: 2531 E Lyon Station Rd, Suite F, Creedmoor, NC 27522. Founded 2014, 5,000+ eyes examined. **Services (confirmed July 6 2026): only Eye Exams, Contact Lens Exams & Fittings, and LASIK Co-Management** — glasses/sunglasses are sold as retail eyewear, not listed as a clinical service.

## Remaining TODO before launch

1. ~~Testimonials are placeholders~~ — **done July 6 2026**, real Google reviews now in `lib/site.ts`. Still worth confirming the homepage `stats` array's "4.9 average star rating" against the practice's actual aggregate Google rating (not derivable from the individual reviews we have).
2. **Contact form simulates its send** (`components/contact/contact-form.tsx`) — wire to Formspree/Resend/practice email.
3. ~~Staff/doctor photos~~ — **done July 6 2026**, real photos for Dr. Mehta, Katie, and Maddie. Crystal, Amanda, Wendy, and Brianne still show initials-only cards — add photos for them the same way if/when the client sends more.
4. Confirm full insurance list with client; PRD open questions (booking system embed?, blog?).
5. **Launch deploy:** Vercel (recommended, zero config; native Next.js) or a real domain instead of the GitHub Pages subpath. When going live, remove `basePath` from `next.config.ts` and redeploy to your own host.

## Deployment quick-start

```bash
# Live preview on GitHub Pages:
npm run deploy:pages

# Real launch on Vercel (recommended):
npx vercel                    # staging
npx vercel --prod             # production

# Before launch, revert the Pages-only config:
# 1. In next.config.ts, remove the basePath logic
# 2. In components/home/video-hero.tsx and components/site/logo.tsx, replace withBasePath() with plain "/path"
# 3. Then redeploy to your real host
```

## User preferences & learnings

- Wants autonomous end-to-end execution; only ask when truly blocked — and when blocked, prefers a direct question over a guess, especially where the guess would touch real business/medical facts (services list, staff photo attribution).
- Full toolset approach: shadcn for components, chrome-devtools/preview tools for verification, 21st.dev for reference, Emil Kowalski pass for motion.
- Premium/calm/warm aesthetic, "ultra cool" motion, but never blocking the booking flow.
- **Dislikes vignette/mask treatments that clip real subject detail** — plain multiply-blend dissolve over a white studio backdrop is preferred over a feathered radial mask, even at the cost of a harder edge.
- **Wants generous scroll runway per hero beat** — when in doubt, err toward more scroll-per-slide/longer caption plateaus rather than a snappier scrub.
- **Deploy-Pages gotcha:** GitHub Pages doesn't build Next.js. The site lives in the `gh-pages` branch (force-pushed by `npm run deploy:pages`). If it ever reverts to README, the build queue got stuck — POST to `/pages/builds` to kick a fresh build request, or re-run the deploy script.
- **The 21st.dev API key in `.mcp.json`** is gitignored and safe (never committed).
