# Premier Eye Institute — Session Handoff Context

**Last updated:** July 3, 2026 pm. All systems working. Live preview at https://ishaanpthegoat.github.io/premier-eye-institute/ — **if it ever shows the README instead of the site, run `npm run deploy:pages` to re-sync the live Pages branch.**

## What this is

A complete, working marketing website for **Premier Eye Institute** — an independent optometry practice owned by **Dr. Nisha P. Mehta, OD** in Creedmoor, NC (replacing their old iMatrix template site at peicare.com). The #1 business goal is appointment bookings; most visitors are on phones.

- **Location:** `C:\Users\Ishaa\OneDrive\Desktop\premier-eye-institute`
- **Stack:** Next.js 16.2.10 (App Router, Turbopack), TypeScript, Tailwind CSS v4, shadcn/ui (radix base, nova preset), Framer Motion, Lenis smooth scroll, lucide-react
- **Status:** Built end to end, verified in Chrome DevTools MCP, production build passes, all 11 routes statically prerendered. ESLint clean, `npx impeccable detect app components` clean.
- **Source-of-truth docs in repo root:** `premier-eye-institute-PRD.md` (facts/plan) and `DESIGN.md` (design tokens). Follow them.

## Commands

```bash
npm run dev                            # dev server on :3000
npm run build                          # production build (all static)
npx eslint app components lib          # lint (next lint was removed in Next 16)
npx impeccable detect app components   # AI-slop / anti-pattern scanner (needs Node 24; installed: v24.16.0)
```

## Critical environment gotchas

- **Next.js 16 has breaking changes** vs training data. Per `AGENTS.md`: read `node_modules/next/dist/docs/` before using unfamiliar APIs. Relevant already-handled bits: Turbopack is default, `next lint` removed, async `params`/`searchParams` (site doesn't use them), `turbopack.root` set in `next.config.ts` to silence a multi-lockfile warning (there's a stray `package-lock.json` on the Desktop).
- **OneDrive**: `create-next-app --src-dir` fails with EPERM rename here. The project uses root-level `app/` (no `src/`). Avoid scaffolds that rename directories.
- **`.mcp.json` contains a real 21st.dev API key** and is **gitignored — never commit it**. The Magic MCP (`mcp__magic__*`) failed all of last session because the server was launched before the key existed; it should work in a fresh session. shadcn MCP and chrome-devtools MCP are also configured and work.
- Design skills live in `.agents/skills/` (impeccable + 13 taste-skill variants), installed for the project.
- PowerShell on Windows; `npx <tool> init`-style commands often hang on interactive prompts — pipe input (`"1" | npx …`) or pass explicit flags.

## Design system (client-approved; do not drift)

- **Palette:** white background, **orange accent `#E7592A`** (`--accent`, with `--accent-hover: #C9481E`, `--accent-tint: #FCEBE1`), **mostly black text** — body copy is `--text-body: #2b2520` (client explicitly asked for near-black body text; the original DESIGN.md warm gray `#6F665F` now lives in `--soft` for small labels). Dark sections use `--ink: #1B1714`.
- The accent is deliberately a single variable set — switching to DESIGN.md §2's medical blue means changing the three `--accent*` values in `app/globals.css` only.
- **Fonts:** Newsreader (serif, headings, italic accent words) + Manrope (sans, body) via `next/font`, exposed as `--font-newsreader`/`--font-manrope`; `.font-heading` utility class.
- **Radii:** sm 12 / md 16 / lg 24 / xl 34px; pill buttons. **Shadows:** warm-tinted tokens `--shadow-warm`, `--shadow-warm-lg`, `--shadow-cta`.
- **Motion:** transform/opacity only, `--ease-soft` cubic-bezier(0.22,0.61,0.36,1), reveals fade-up ~26px, always respect `prefers-reduced-motion`.
- **Known AA tension (deliberate):** buttons keep brand `#E7592A` bg with white text (3.6:1, borderline fail); small accent text uses `--accent-hover` (~5:1) instead; `.eyebrow` is accent-hover on light, accent on `.bg-ink` sections (CSS rule in globals). User accepted this trade-off.
- Anti-patterns to keep out: bounce easing (impeccable flagged it once — replaced with `pei-float`), cards-in-cards, Inter, purple gradients, generic template look.

## Architecture

Business facts (address, phone 919-734-2273, hours, 10 services, 7 team members, credentials, stats, placeholder testimonials, nav) are centralized in **`lib/site.ts`** — edit once, propagates everywhere. Design tokens + keyframes (`pei-marquee`, `pei-float`) in **`app/globals.css`**.

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
public/hero-frames/frame_0001…0122.webp   public/hero-fallback/*.webp   public/logo.webp  (real logo, 300×80)
```

## The video hero (`components/home/video-hero.tsx`) — the signature piece (rebuilt July 6 2026: canvas image-sequence scrubber)

- **The MP4 scrubber is gone** (`video.currentTime` seeking stuttered/froze). The hero now draws a **preloaded WebP frame sequence on a `<canvas>`**: `public/hero-frames/frame_0001…0122.webp` (900×900, libwebp q62, ~3.9 MB total). Story: glasses → morph → phoropter → shatter apart → suspended parts → reform → auto-refractor. Built from two 10s/24fps morph MP4s (every 4th frame) + three anchor stills; **every frame color-graded from the source's blue accents to brand orange** with ffmpeg `huesaturation=hue=-175:colors=c+b:strength=100:saturation=0.12` (selective — keeps the phoropter's green level bubble; global `hue` breaks it). Same-graded anchor stills live at `public/hero-fallback/{glasses,phoropter,autorefractor}.webp`. `hero-story.mp4` was deleted (restorable via git).
- Scroll progress → frame index through the **STORY storyboard with HOLD zones** (0-based boundaries: glasses hold = 0; morph 1 = 0→61; phoropter hold = 61; shatter = 61→91; shatter-apex hold = 91; reform = 91→121; auto-refractor hold = 121). Each caption peaks inside a hold so text never sits over a moving frame; scene 03 ("The precision") narrates the shatter apex — the exploded instrument suspended mid-air got its own micro-hold. Runway **700vh** (July 6 pm: user wanted more scroll per slide — holds re-budgeted wider, CAPTION_FADE=5 gives snappy fades + a long full-opacity plateau, headline fades at `1 - p*11`), frame LERP **0.09** (slow scrub — keep), `drawImage` only when the rounded index changes, backing store = CSS size × devicePixelRatio (capped at 2), one persistent rAF loop + refs as before. All frames are `img.decode()`d behind a thin loader veil (tracked-uppercase "Loading…" + hairline accent bar) before the scrub enables; **phones (<768px) load every other frame plus the 4 exact hold poses (64 requests ≈ 2 MB)**.
- **Frameless, blended into the page**: the art (white-studio-background frames) gets `mix-blend-mode: multiply` + `filter: brightness(1.07)` (clips the studio backdrop past pure white so it dissolves completely). **No vignette mask** — there was a radial `mask-image` feather until July 6 pm; the user found it weird-looking (it faded the instruments' edge details and shadows), and multiply alone kills the square edge. **Blend + filter + transform all live on the `<canvas>` element itself — a transformed/z-indexed wrapper creates a stacking context that isolates the blend and brings the backdrop back** (the layout wrapper around canvas + loader deliberately has no z-index or transform).
- **The video travels the stage**: `DRIFT_PATH`/`SCALE_PATH` keyframes sampled with smoothstep and lerped in the rAF loop. Center → drifts right (scene 1 caption slides in from the left) → drifts left (scene 2 caption on the right) → returns center-small (scene 3 caption drifts up into the headline space) → the stage unsticks and the page carries it away. Desktop drift `min(15vw, 240px)`; <1024px just a 2vw sway with the old center-crossfade captions. Mouse parallax (±14px/±10px, lerped, mouse-only) replaced the old chip tilt.
- **Scene windows tuned to the hold zones:** 0.06–0.24 left (glasses hold 0–0.20), 0.37–0.56 right (phoropter hold 0.38–0.55), 0.62–0.76 left (shatter-apex hold 0.63–0.75), 0.83–0.99 center (auto-refractor hold 0.84–1.0). DRIFT_PATH stops retuned to match. Retune by editing the STORY from/to columns in video-hero.tsx — they're commented.
- **`hero-shader.tsx`**: raw-WebGL fragment shader behind the stage ("light through a lens") — white → hero-wash base, three drifting warm blooms, faint breathing accent halo, hash-dither against banding. Colors hardcoded from globals.css tokens (comment in FRAG maps them). Renders at 0.5× resolution (softness by design), `powerPreference: low-power`, pauses via IntersectionObserver + visibilitychange, fades in on first frame, static-gradient div beneath as SSR/no-WebGL fallback. Not mounted under reduced motion. 21st.dev shaders were rejected (dark/techy palettes, one needed three.js).
- Reduced motion (`useSyncExternalStore` on the media query — a plain `setState`-in-effect fails the `react-hooks/set-state-in-effect` lint rule): no pinning, no canvas — the three graded fallback stills in normal flow (same blend+mask treatment, next/image with manual `withBasePath`), each with its caption(s) beneath (phoropter carries scenes 02 + 03), CTA moved above the stills.
- Perf verified after rework: CLS 0.00, no long-frame insights in a DevTools trace during scripted scroll.

## Motion polish (Emil Kowalski pass, July 3 2026 pm)

- His official skills installed at `.agents/skills/{emil-design-eng,review-animations,animation-vocabulary}` (from github.com/emilkowalski/skills).
- `.press` class (globals.css, **unlayered** so it beats Tailwind layers): `:active → scale(0.97)` on all pill CTAs (hero, header, cta-band, contact, mobile bar). Composes with hover lift because Tailwind v4 translate utilities use the separate `translate` property.
- `--ease-out-strong: cubic-bezier(0.23,1,0.32,1)` token added; `Reveal` now 0.7s with that curve.
- CTA transitions: `transition-all` replaced with explicit `transition-[transform,translate,background-color,border-color] duration-200` (web-interface-guidelines + Emil rule).
- **Magic MCP gotcha**: the server still doesn't get the API key when the session launches from the Desktop cwd — work around by calling the API directly: `POST https://api.21st.dev/api/search` with `x-api-key` from `.mcp.json`, JSON body `{"search":"...","page":1,"per_page":8}`; component code lives at the returned `component_data.code` CDN URL.

## 21st.dev component layer (July 3 2026, second pass)

Twelve components pulled from 21st.dev and adapted to the token system in `components/ui/`: `testimonials-column` (home + /reviews, initials instead of stock faces, sr-only fallback lists), `spotlight-card` (services cards), `lamp-glow` (CtaBand ink band), `text-rotate` (Intro "see/read/work/drive/play"), `timeline` (about "Your first visit" — beam fills on scroll), `bento-grid` (patient-resources), `feature-grid` (payments-insurance), `display-cards` (eyewear fan; flattens below md), `gooey-text` (404 morph; fixed the original's rAF leak), `glow-border` (book page card), plus the tubelight nav lamp living inline in `site/header.tsx` (layoutId spring, pathname-driven). Rejected with reasons: sparkles (tsparticles dep), radial-orbital + shader components (dark/off-brand), scroll-expansion-hero (wheel hijack vs Lenis), stock 404 (broken code). All animated adaptations handle `prefers-reduced-motion`.

**All pill CTAs go through shadcn `Button`** — variants `pill` / `pill-outline` / `pill-ghost` + sizes `pill` / `pill-sm` in `components/ui/button.tsx` (press feedback + explicit transition list baked in). Don't hand-roll CTA classNames anymore.

Repo: https://github.com/ishaanpthegoat/premier-eye-institute (now PUBLIC — user flipped it for Pages; key was never committed). Testimonials are now NINE placeholders in lib/site.ts — still all placeholder, replace before launch.

## GitHub Pages preview (July 3 2026)

Live at **https://ishaanpthegoat.github.io/premier-eye-institute/**. `next.config.ts` uses `output: "export"` + `basePath` from `NEXT_PUBLIC_BASE_PATH`; raw asset srcs (video, and the logo — **unoptimized next/image does NOT apply basePath**) go through `withBasePath()` from `lib/base-path.ts`. Deploy with **`npm run deploy:pages`** (`scripts/deploy-pages.mjs`: builds with the base path, force-pushes `out/` as a fresh single-commit `gh-pages` branch; Pages serves that branch in legacy mode). The gh CLI token lacks the `workflow` scope so an Actions workflow can't be pushed — run `gh auth refresh -s workflow` if CI deploys are ever wanted. GitHub's Pages builds ran slow (~10 min) that day; POSTing `repos/.../pages/builds` unsticks a stuck one. Real launch should still be a proper host/custom domain (peicare.com) — the base path only exists for the Pages subpath.

## Confirmed business facts (from client, July 3 2026)

Hours (already in `lib/site.ts`): Mon–Wed 8:00am–5:00pm, Thu 9:00am–6:00pm, Fri 8:00am–3:00pm, **Sat "By Appointment Only"**, Sun Closed. Insurance: VSP incl. Premier Program, CareCredit. Portal: Crystal PM (crystalpm.com). Fax 919-238-4321. Address: 2531 E Lyon Station Rd, Suite F, Creedmoor, NC 27522. Founded 2014, 5,000+ eyes examined.

## Remaining TODO before launch

1. **Testimonials are placeholders** (`lib/site.ts`, clearly commented) — replace with real Google/Facebook reviews; confirm the 4.9 stat.
2. **Contact form simulates its send** (`components/contact/contact-form.tsx`) — wire to Formspree/Resend/practice email.
3. **Staff/doctor photos** — "photo coming soon" gradient placeholders in doctor section + about page.
4. Confirm full insurance list with client; PRD open questions (booking system embed?, blog?).
4b. **Hero scene 04 copy vs visual**: the final hero pose is an auto-refractor, but caption 04 still says "corneal mapping behind Ortho-K" (a corneal topographer). Client must reconcile the copy or the asset — do not silently change medical claims.
5. **Launch deploy:** Vercel (recommended, zero config; native Next.js) or a real domain instead of the GitHub Pages subpath. The Pages setup is a preview-only arrangement — when going live, remove `basePath` from next.config.ts and deploy to your own host.

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

- Wants autonomous end-to-end execution; only ask when truly blocked.
- Full toolset approach: shadcn for components, chrome-devtools for verification, 21st.dev for reference, Emil Kowalski pass for motion.
- Premium/calm/warm aesthetic, "ultra cool" motion, but never blocking the booking flow.
- **Deploy-Pages gotcha:** GitHub Pages doesn't build Next.js. The site lives in the `gh-pages` branch (force-pushed by `npm run deploy:pages`), and it takes ~10 minutes to propagate. If it ever reverts to README, the build queue got stuck — POST to `/pages/builds` to kick a fresh build request, or re-run the deploy script.
- **The 21st.dev API key in `.mcp.json`** is gitignored and safe (never committed). The Magic MCP loses its key when a session launches from the Desktop cwd — work around by calling the API directly with the key from `.mcp.json`.
