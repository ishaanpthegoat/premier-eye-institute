"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroShader } from "@/components/home/hero-shader";
import { withBasePath } from "@/lib/base-path";
import { site } from "@/lib/site";

/* The signature moment of the site: a 300vh scroll runway with a sticky
   stage. The hero video plays frameless — mix-blend-mode: multiply melts
   its white studio backdrop into the page, and a radial mask feathers the
   square edge away — so the glasses float directly on the site. As the
   story advances the video drifts across the stage (right, then left,
   then home) while each scene's caption slides in on the opposite side.
   Playback time is driven by scroll and eased with a lerp inside one
   persistent rAF loop; all per-frame DOM writes go through refs. */

/* Four beats matched to /hero-story.mp4 (~10s): glasses (0–2s), the
   phoropter (3–5s), its parts mid-air in orange light (5.5–8s), and the
   corneal topographer (8.5–10s). */
const SCENES = [
  {
    eyebrow: "01 · The frames",
    title: "Crafted frames, fitted to you",
    copy: "Honest styling help from our optical team — eyewear you'll actually want to wear.",
    from: 0.08,
    to: 0.27,
    side: "left" as const,
  },
  {
    eyebrow: "02 · The exam",
    title: "Unhurried, thorough exams",
    copy: "Modern imaging and screening, with time to actually talk about your eyes.",
    from: 0.33,
    to: 0.5,
    side: "right" as const,
  },
  {
    eyebrow: "03 · The precision",
    title: "Calibrated to the smallest detail",
    copy: "The instruments behind your prescription, tuned for exactness at every turn.",
    from: 0.56,
    to: 0.73,
    side: "left" as const,
  },
  {
    eyebrow: "04 · The technology",
    title: "Imaging that sees more",
    copy: "Advanced screening — from glaucoma testing to the corneal mapping behind Ortho-K.",
    from: 0.78,
    to: 0.94,
    side: "center" as const,
  },
];

/* Gentle scrub: the lower the lerp, the more the video glides behind the
   scroll instead of snapping to it. */
const LERP = 0.09;

/* The video's travel path across the stage: [progress, drift] pairs,
   where drift is a fraction of the max excursion (+1 = right, -1 = left).
   Smoothstepped between stops so direction changes never feel mechanical. */
const DRIFT_PATH: [number, number][] = [
  [0, 0],
  [0.05, 0],
  [0.13, 1],
  [0.28, 1],
  [0.38, -1],
  [0.51, -1],
  [0.6, 1],
  [0.74, 1],
  [0.82, 0],
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

/* Feather the video's square edge so it reads as part of the page. */
const VIDEO_MASK =
  "radial-gradient(closest-side, black 58%, transparent 99%)";

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
  const videoRef = useRef<HTMLVideoElement>(null);
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
    const video = videoRef.current;
    if (!hero || !video) return;

    let duration = 10;
    const setDur = () => {
      if (video.duration && isFinite(video.duration)) duration = video.duration;
    };
    video.addEventListener("loadedmetadata", setDur);
    video.addEventListener("durationchange", setDur);
    setDur();

    // Prime the pipeline once so the first seeks are instant.
    const prime = () => {
      video
        .play()
        .then(() => video.pause())
        .catch(() => {});
    };
    if (video.readyState >= 1) prime();
    else video.addEventListener("loadedmetadata", prime, { once: true });

    let progress = 0;
    let current = 0;
    let maxDrift = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let curParX = 0;
    let curParY = 0;
    let curDrift = 0;
    let raf = 0;

    const measure = () => {
      // Desktop: the video travels toward the empty side of the stage.
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

      // Headline drifts up and fades as the story takes over.
      const head = headRef.current;
      if (head) {
        const o = Math.max(0, 1 - p * 7);
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
        const fadeIn = Math.min(1, Math.max(0, local * 4));
        const fadeOut = Math.min(1, Math.max(0, (1 - local) * 4));
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
      // Lerp the video time toward the scroll target — buttery, not jumpy.
      const target = progress * duration;
      current += (target - current) * LERP;
      if (video.readyState >= 2 && Math.abs(target - current) > 0.001) {
        try {
          video.currentTime = Math.min(duration - 0.03, Math.max(0, current));
        } catch {
          /* seek can throw during teardown */
        }
      }

      // The video wanders the stage; the page appears to move with it.
      curParX += (parallaxX - curParX) * 0.06;
      curParY += (parallaxY - curParY) * 0.06;
      const targetDrift = sample(DRIFT_PATH, progress) * maxDrift;
      curDrift += (targetDrift - curDrift) * 0.1;
      const scale = sample(SCALE_PATH, progress);
      video.style.transform = `translate(${curDrift + curParX}px, ${
        progress * -14 + curParY
      }px) scale(${scale})`;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", onPointer, { passive: true });
    measure();
    onScroll();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      video.removeEventListener("loadedmetadata", setDur);
      video.removeEventListener("durationchange", setDur);
    };
  }, [reduced]);

  const registerScene =
    (scene: number, side: string) => (el: HTMLDivElement | null) => {
      sceneEls.current = sceneEls.current.filter(
        (s) => !(s.scene === scene && s.side === side)
      );
      if (el) sceneEls.current.push({ el, scene, side });
    };

  /* Reduced motion: no pinning, no scrubbing. The video plays once as a
     calm muted loop and the copy reads top to bottom. */
  if (reduced === true) {
    return (
      <section className="relative overflow-hidden px-5 pb-20 pt-32 text-center sm:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_0%,var(--hero-wash)_0%,#ffffff_55%)]"
        />
        <HeroCopy />
        <video
          src={withBasePath("/hero-story.mp4")}
          muted
          loop
          autoPlay
          playsInline
          className="relative mx-auto mt-8 aspect-square w-[min(82vw,460px)] object-cover"
          style={{
            mixBlendMode: "multiply",
            maskImage: VIDEO_MASK,
            WebkitMaskImage: VIDEO_MASK,
            /* lift the studio backdrop past pure white so multiply
               dissolves it completely into the page */
            filter: "brightness(1.07)",
          }}
          aria-label="A pair of black-framed glasses assembling in a slow, elegant animation"
        />
        <div className="mx-auto mt-12 grid max-w-3xl gap-8 text-left sm:grid-cols-3">
          {SCENES.map((s) => (
            <div key={s.title}>
              <p className="text-xs font-semibold uppercase tracking-[2.6px] text-accent">
                {s.eyebrow}
              </p>
              <h2 className="font-heading mt-2 text-xl font-semibold text-ink">
                {s.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-body-text">
                {s.copy}
              </p>
            </div>
          ))}
        </div>
        <HeroCta className="mt-10" />
      </section>
    );
  }

  return (
    <section ref={heroRef} className="relative h-[500vh]" aria-label="Introduction">
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
            video has just vacated. */}
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

        {/* The video itself: frameless, blended into the page. Blend, mask
            and transform all live on this one element — a transformed
            wrapper would isolate the blend and bring the backdrop back. */}
        <video
          ref={videoRef}
          src={withBasePath("/hero-story.mp4")}
          muted
          playsInline
          preload="auto"
          className="relative z-10 mt-4 aspect-square w-[min(88vw,44vh,450px)] object-cover will-change-transform sm:mt-6"
          style={{
            mixBlendMode: "multiply",
            maskImage: VIDEO_MASK,
            WebkitMaskImage: VIDEO_MASK,
            /* lift the studio backdrop past pure white so multiply
               dissolves it completely into the page */
            filter: "brightness(1.07)",
          }}
          aria-label="A pair of black-framed glasses assembling in a slow, elegant animation, played in step with your scrolling"
        />

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
