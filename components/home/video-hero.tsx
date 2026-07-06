"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroShader } from "@/components/home/hero-shader";
import { withBasePath } from "@/lib/base-path";
import { site } from "@/lib/site";

/* The signature moment of the site: a 700vh scroll runway with a sticky
   stage. The hero art plays frameless — mix-blend-mode: multiply melts
   its white studio backdrop into the page — so the instruments float
   directly on the site, natural shadow and all. As the story advances
   the art drifts across the stage (right, then left, then home) while
   each scene's caption slides in on the opposite side.

   Frames come from a preloaded WebP image sequence drawn on a <canvas> —
   not a seeking <video>, which browsers can't scrub smoothly. Scroll
   progress maps to a frame index through a storyboard with HOLD zones,
   so every caption sits over a settled pose instead of a mid-morph blur.
   The frame index is eased with a lerp inside one persistent rAF loop;
   all per-frame DOM writes go through refs. */

/* ---------------------------------------------------------------------
   The frame sequence: public/hero-frames/frame_0001.webp … frame_0122.webp
   (900×900 WebP, graded so the source footage's blue accents match the
   site's warm orange).

   0-based frame boundaries, recorded when the sequence was built:
     idx   0        glasses, settled pose
     idx   0 →  61  morph 1 — glasses transform into the phoropter
     idx  61        phoropter, settled pose (morph 2's first frame)
     idx  61 →  91  morph 2a — the phoropter shatters apart
     idx  91        shatter apex — parts suspended mid-air
     idx  91 → 121  morph 2b — parts reform as the auto-refractor
     idx 121        auto-refractor, settled pose
   --------------------------------------------------------------------- */
const FRAME_COUNT = 122;

const framePath = (i: number) =>
  withBasePath(`/hero-frames/frame_${String(i + 1).padStart(4, "0")}.webp`);

/* Scroll progress → frame storyboard. Each row maps a progress span to a
   frame span; rows where f0 === f1 are HOLD zones (the pose freezes so a
   caption can sit over it). Retune by editing the from/to columns — they
   must stay sorted and contiguous from 0 to 1. Caption windows in SCENES
   below are tuned so each caption peaks inside its hold. */
const STORY: { from: number; to: number; f0: number; f1: number }[] = [
  { from: 0.0, to: 0.2, f0: 0, f1: 0 }, //      hold: glasses      — caption 01
  { from: 0.2, to: 0.38, f0: 0, f1: 61 }, //   morph 1: glasses → phoropter
  { from: 0.38, to: 0.55, f0: 61, f1: 61 }, //  hold: phoropter    — caption 02
  { from: 0.55, to: 0.63, f0: 61, f1: 91 }, //  morph 2a: shatter apart
  { from: 0.63, to: 0.75, f0: 91, f1: 91 }, //  hold: shatter apex — caption 03
  { from: 0.75, to: 0.84, f0: 91, f1: 121 }, // morph 2b: reform
  { from: 0.84, to: 1.0, f0: 121, f1: 121 }, // hold: auto-refractor — caption 04
];

/* Frames that must stay pixel-exact even when small screens load only
   every other frame: the four rest poses the captions sit over. */
const HOLD_FRAMES = [0, 61, 91, 121];

function frameForProgress(p: number) {
  for (const s of STORY) {
    if (p <= s.to) {
      const t =
        s.to === s.from
          ? 0
          : Math.min(1, Math.max(0, (p - s.from) / (s.to - s.from)));
      return s.f0 + (s.f1 - s.f0) * t;
    }
  }
  return STORY[STORY.length - 1].f1;
}

/* Caption beats. Windows are tuned so each caption is fully visible
   inside its hold zone: fades run over the first/last fifth of the
   window (see CAPTION_FADE), so the middle 60% is a full-opacity
   plateau. Scene 03 narrates the shatter apex — the exploded instrument
   suspended mid-air. */
const SCENES = [
  {
    eyebrow: "01 · The frames",
    title: "Crafted frames, fitted to you",
    copy: "Honest styling help from our optical team — eyewear you'll actually want to wear.",
    from: 0.06,
    to: 0.24,
    side: "left" as const,
  },
  {
    eyebrow: "02 · The exam",
    title: "Unhurried, thorough exams",
    copy: "Modern imaging and screening, with time to actually talk about your eyes.",
    from: 0.37,
    to: 0.56,
    side: "right" as const,
  },
  {
    eyebrow: "03 · The precision",
    title: "Calibrated to the smallest detail",
    copy: "The instruments behind your prescription, tuned for exactness at every turn.",
    from: 0.62,
    to: 0.76,
    side: "left" as const,
  },
  {
    eyebrow: "04 · The technology",
    title: "Imaging that sees more",
    copy: "Precise measurements behind every exam and prescription — advanced imaging, clearly explained.",
    from: 0.83,
    to: 0.99,
    side: "center" as const,
  },
];

/* How sharply captions fade at the edges of their window: opacity ramps
   over the first and last 1/CAPTION_FADE of the window. Higher = snappier
   fade, longer readable plateau. */
const CAPTION_FADE = 5;

/* Gentle scrub: the lower the lerp, the more the frames glide behind the
   scroll instead of snapping to it. */
const LERP = 0.09;

/* The art's travel path across the stage: [progress, drift] pairs, where
   drift is a fraction of the max excursion (+1 = right, -1 = left).
   Stops follow the storyboard: right for caption 01, left for 02, right
   for 03, home for 04. Smoothstepped between stops so direction changes
   never feel mechanical. */
const DRIFT_PATH: [number, number][] = [
  [0, 0],
  [0.06, 0],
  [0.12, 1],
  [0.26, 1],
  [0.35, -1],
  [0.57, -1],
  [0.64, 1],
  [0.76, 1],
  [0.85, 0],
  [1, 0],
];

const SCALE_PATH: [number, number][] = [
  [0, 1],
  [0.45, 1.06],
  [0.8, 1.04],
  [1, 0.96],
];

function sample(path: [number, number][], p: number) {
  if (p <= path[0][0]) return path[0][1];
  for (let i = 1; i < path.length; i++) {
    const [p1, v1] = path[i];
    if (p <= p1) {
      const [p0, v0] = path[i - 1];
      const t = (p - p0) / (p1 - p0);
      const s = t * t * (3 - 2 * t);
      return v0 + (v1 - v0) * s;
    }
  }
  return path[path.length - 1][1];
}

/* Blend + brightness float the white-backdrop art onto the page (no
   vignette mask — it faded the instruments' edges and their shadows,
   which read as artificial). They must live on the drawing element
   itself — a transformed wrapper creates a stacking context that
   isolates the blend and brings the backdrop back. */
const ART_STYLE = {
  mixBlendMode: "multiply" as const,
  /* lift the studio backdrop past pure white so multiply dissolves it
     completely into the page */
  filter: "brightness(1.07)",
};

/* Reduced-motion fallback: the three settled poses as plain images. */
const FALLBACK_STILLS = [
  {
    src: "/hero-fallback/glasses.webp",
    alt: "A pair of black-framed glasses with a warm orange accent line",
    scenes: [0],
  },
  {
    src: "/hero-fallback/phoropter.webp",
    alt: "A phoropter, the lens-switching instrument used during your exam",
    scenes: [1, 2],
  },
  {
    src: "/hero-fallback/autorefractor.webp",
    alt: "An auto-refractor imaging device with a softly glowing lens",
    scenes: [3],
  },
];

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(callback: () => void) {
  const mql = window.matchMedia(MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMotionPreference() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function getServerMotionPreference(): boolean | null {
  return null;
}

type SceneEl = { el: HTMLDivElement; scene: number; side: string };

export function VideoHero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const sceneEls = useRef<SceneEl[]>([]);
  const reduced = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference
  );

  useEffect(() => {
    if (reduced !== false) return;
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;

    /* ---- Frame preload -------------------------------------------- */
    /* Phones get every other frame (half the payload); the four hold
       poses are always loaded exactly so captions never sit over a
       neighbor frame. Desktop loads the full sequence. */
    const step = window.matchMedia("(max-width: 767px)").matches ? 2 : 1;
    const wanted: number[] = [];
    for (let i = 0; i < FRAME_COUNT; i += step) wanted.push(i);
    for (const f of HOLD_FRAMES) if (!wanted.includes(f)) wanted.push(f);

    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(
      null
    );
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    let ready = false;
    let settledCount = 0;

    /* ---- Canvas drawing ------------------------------------------- */
    let lastDrawn = -1;

    const sizeCanvas = () => {
      // offsetWidth ignores the drift/parallax transform, unlike
      // getBoundingClientRect — we want the layout size.
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      lastDrawn = -1; // buffer was cleared; force a redraw
    };

    const draw = (idx: number) => {
      const img = images[idx];
      if (!img) return;
      // Cover: fill the square buffer, preserving the frame's aspect.
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      lastDrawn = idx;
    };

    /* Nearest loaded frame to the requested index — covers the skipped
       frames on phones and any frame that failed to decode. */
    const snapToLoaded = (idx: number) => {
      idx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(idx)));
      if (loaded[idx]) return idx;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (idx - d >= 0 && loaded[idx - d]) return idx - d;
        if (idx + d < FRAME_COUNT && loaded[idx + d]) return idx + d;
      }
      return -1;
    };

    /* ---- Scroll / pointer state (written by listeners, read by rAF) */
    let progress = 0;
    let curFrame = 0;
    let maxDrift = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let curParX = 0;
    let curParY = 0;
    let curDrift = 0;
    let raf = 0;

    const begin = () => {
      if (disposed) return;
      ready = true;
      // Pick the story up wherever the user has scrolled to — don't
      // replay the morph from frame 0.
      curFrame = frameForProgress(progress);
      const loaderEl = loaderRef.current;
      if (loaderEl) loaderEl.style.opacity = "0";
    };

    const settle = (i: number, ok: boolean) => {
      if (disposed) return;
      if (ok) loaded[i] = true;
      settledCount++;
      const bar = barRef.current;
      if (bar) bar.style.transform = `scaleX(${settledCount / wanted.length})`;
      if (settledCount === wanted.length) begin();
    };

    for (const i of wanted) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = framePath(i);
      images[i] = img;
      img.decode().then(
        () => settle(i, true),
        () => {
          // decode() can reject even when the fetch succeeded; fall back
          // to load state / events before giving up on the frame.
          if (img.complete) settle(i, img.naturalWidth > 0);
          else {
            img.addEventListener("load", () => settle(i, true), {
              once: true,
            });
            img.addEventListener("error", () => settle(i, false), {
              once: true,
            });
          }
        }
      );
    }

    const measure = () => {
      // Desktop: the art travels toward the empty side of the stage.
      // Small screens: just a gentle sway beneath the captions.
      maxDrift =
        window.innerWidth >= 1024
          ? Math.min(window.innerWidth * 0.15, 240)
          : window.innerWidth * 0.02;
    };

    const onScroll = () => {
      const total = hero.offsetHeight - window.innerHeight;
      const p =
        total > 0
          ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / total))
          : 0;
      progress = p;

      // Headline drifts up and fades as the story takes over — gone
      // before caption 01's plateau begins.
      const head = headRef.current;
      if (head) {
        const o = Math.max(0, 1 - p * 11);
        head.style.opacity = String(o);
        head.style.transform = `translateY(${p * -44}px)`;
        head.style.visibility = o <= 0.01 ? "hidden" : "visible";
      }
      const cue = cueRef.current;
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 6));

      // Scene captions slide in at their beats: side captions from the
      // outside edge, centered ones drifting up into the headline space.
      sceneEls.current.forEach(({ el, scene, side }) => {
        const s = SCENES[scene];
        const span = s.to - s.from;
        const local = (p - s.from) / span;
        const fadeIn = Math.min(1, Math.max(0, local * CAPTION_FADE));
        const fadeOut = Math.min(1, Math.max(0, (1 - local) * CAPTION_FADE));
        const o = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        if (side === "left") {
          el.style.transform = `translate(${(o - 1) * 28}px, -50%)`;
        } else if (side === "right") {
          el.style.transform = `translate(${(1 - o) * 28}px, -50%)`;
        } else {
          el.style.transform = `translateY(${(1 - o) * 14}px)`;
        }
        el.style.visibility = o <= 0.01 ? "hidden" : "visible";
      });
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      parallaxX = (e.clientX / window.innerWidth - 0.5) * 14;
      parallaxY = (e.clientY / window.innerHeight - 0.5) * 10;
    };

    const tick = () => {
      if (ready) {
        // Lerp the frame index toward the scroll target — buttery, not
        // jumpy — then draw only when the rounded index changes.
        const targetFrame = frameForProgress(progress);
        curFrame += (targetFrame - curFrame) * LERP;
        // Settle exactly on hold poses instead of asymptoting forever.
        if (Math.abs(targetFrame - curFrame) < 0.02) curFrame = targetFrame;
        const idx = snapToLoaded(curFrame);
        if (idx !== -1 && idx !== lastDrawn) draw(idx);
      }

      // The art wanders the stage; the page appears to move with it.
      curParX += (parallaxX - curParX) * 0.06;
      curParY += (parallaxY - curParY) * 0.06;
      const targetDrift = sample(DRIFT_PATH, progress) * maxDrift;
      curDrift += (targetDrift - curDrift) * 0.1;
      const scale = sample(SCALE_PATH, progress);
      canvas.style.transform = `translate(${curDrift + curParX}px, ${
        progress * -14 + curParY
      }px) scale(${scale})`;

      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      sizeCanvas();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    measure();
    sizeCanvas();
    onScroll();
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reduced]);

  const registerScene =
    (scene: number, side: string) => (el: HTMLDivElement | null) => {
      sceneEls.current = sceneEls.current.filter(
        (s) => !(s.scene === scene && s.side === side)
      );
      if (el) sceneEls.current.push({ el, scene, side });
    };

  /* Reduced motion: no pinning, no scrubbing, no canvas. The three
     settled poses read top to bottom with their captions. */
  if (reduced === true) {
    return (
      <section className="relative overflow-hidden px-5 pb-20 pt-32 text-center sm:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_0%,var(--hero-wash)_0%,#ffffff_55%)]"
        />
        <HeroCopy />
        <HeroCta className="mt-10" />
        {FALLBACK_STILLS.map((still, i) => (
          <div key={still.src} className="mx-auto mt-16 max-w-3xl">
            <Image
              src={withBasePath(still.src)}
              alt={still.alt}
              width={900}
              height={900}
              priority={i === 0}
              className="mx-auto aspect-square w-[min(72vw,340px)]"
              style={ART_STYLE}
            />
            {still.scenes.map((i) => (
              <div key={SCENES[i].title} className="mx-auto mt-6 max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[2.6px] text-accent">
                  {SCENES[i].eyebrow}
                </p>
                <h2 className="font-heading mt-2 text-xl font-semibold text-ink">
                  {SCENES[i].title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-body-text">
                  {SCENES[i].copy}
                </p>
              </div>
            ))}
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={heroRef} className="relative h-[700vh]" aria-label="Introduction">
      <div className="sticky top-0 flex h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 pb-10 pt-24 text-center sm:px-8">
        {/* Static wash first (SSR / no-WebGL), living shader light above it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-[radial-gradient(120%_90%_at_50%_0%,var(--hero-wash)_0%,#ffffff_55%)]"
        />
        <HeroShader />

        {/* Text stage: the headline fades out on scroll; the final scene's
            caption drifts up into the same space. */}
        <div className="relative z-10 flex min-h-[200px] w-full items-center justify-center sm:min-h-[230px]">
          <div ref={headRef} className="will-change-transform">
            <HeroCopy />
          </div>
          <div aria-hidden="true" className="absolute inset-0">
            {SCENES.map((s, i) => (
              <div
                key={s.title}
                ref={registerScene(i, "center")}
                style={{ opacity: 0, visibility: "hidden" }}
                className={`absolute inset-0 flex-col items-center justify-center will-change-transform ${
                  s.side === "center" ? "flex" : "flex lg:hidden"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[2.6px] text-accent">
                  {s.eyebrow}
                </p>
                <h2 className="font-heading mt-2 text-[clamp(26px,3.6vw,40px)] font-medium leading-tight tracking-[-0.4px] text-ink">
                  {s.title}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-body-text">
                  {s.copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Side captions (desktop): each beat's copy waits on the side the
            art has just vacated. */}
        {SCENES.filter((s) => s.side !== "center").map((s) => (
          <div
            key={s.title}
            ref={registerScene(SCENES.indexOf(s), s.side)}
            aria-hidden="true"
            style={{ opacity: 0, visibility: "hidden" }}
            className={`absolute top-[55%] z-10 hidden w-[300px] will-change-transform lg:block ${
              s.side === "left"
                ? "left-[clamp(32px,7vw,110px)] text-left"
                : "right-[clamp(32px,7vw,110px)] text-right"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[2.6px] text-accent">
              {s.eyebrow}
            </p>
            <h2 className="font-heading mt-2 text-[clamp(24px,2.4vw,32px)] font-medium leading-tight tracking-[-0.4px] text-ink">
              {s.title}
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-body-text">
              {s.copy}
            </p>
          </div>
        ))}

        {/* The art itself: a canvas drawing the preloaded frame sequence,
            frameless and blended into the page. The wrapper only reserves
            layout space — it carries no transform or z-index, so it never
            creates a stacking context that would isolate the blend. Blend,
            mask and transform all live on the <canvas>. */}
        <div className="relative mt-4 aspect-square w-[min(88vw,44vh,450px)] sm:mt-6">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Eyewear morphing into the exam and imaging instruments used at Premier Eye Institute, advancing in step with your scrolling"
            className="absolute inset-0 z-10 h-full w-full will-change-transform"
            style={ART_STYLE}
          />
          {/* Preload veil: fades out once every frame is decoded. */}
          <div
            ref={loaderRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 transition-opacity duration-500"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#b3a99f]">
              Loading…
            </span>
            <span className="h-[2px] w-[140px] overflow-hidden rounded-full bg-[#eadfd6]">
              <span
                ref={barRef}
                className="block h-full w-full origin-left scale-x-0 rounded-full bg-accent"
              />
            </span>
          </div>
        </div>

        {/* Screen-reader version of the scene story. */}
        <div className="sr-only">
          {SCENES.map((s) => (
            <p key={s.title}>
              {s.title}. {s.copy}
            </p>
          ))}
        </div>

        <HeroCta className="relative z-20 mt-6 sm:mt-8" />

        <div
          ref={cueRef}
          aria-hidden="true"
          className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[#b3a99f] [@media(min-height:960px)]:flex"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[2px]">
            Scroll
          </span>
          <span className="relative inline-block h-[34px] w-[22px] rounded-[12px] border-[1.5px] border-[#d8cec5]">
            <span className="absolute left-1/2 top-1.5 h-[7px] w-[3px] animate-[pei-float_1.6s_var(--ease-inout)_infinite] rounded-sm bg-accent" />
          </span>
        </div>
      </div>
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center">
      <p className="eyebrow eyebrow-centered animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 [animation-delay:100ms]">
        {site.tagline}
      </p>
      <h1 className="font-heading animate-in fade-in slide-in-from-bottom-5 mt-4 text-[clamp(38px,5.6vw,72px)] font-medium leading-[1.02] tracking-[-0.5px] text-ink fill-mode-both duration-1000 [animation-delay:220ms]">
        See the world in{" "}
        <em className="italic text-accent">sharper</em> detail.
      </h1>
      <p className="animate-in fade-in slide-in-from-bottom-4 mt-4 max-w-[500px] text-[clamp(15px,1.5vw,17px)] leading-relaxed text-body-text fill-mode-both duration-1000 [animation-delay:340ms]">
        Comprehensive, unhurried eye care in Creedmoor. Scroll to look closer.
      </p>
    </div>
  );
}

function HeroCta({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 flex flex-wrap items-center justify-center gap-3 fill-mode-both duration-1000 [animation-delay:480ms] ${className}`}
    >
      <Button asChild variant="pill" size="pill">
        <Link href="/book">Book an Appointment</Link>
      </Button>
      <Button asChild variant="pill-outline" size="pill">
        <a href={site.phoneHref}>{site.phoneDisplay}</a>
      </Button>
    </div>
  );
}
