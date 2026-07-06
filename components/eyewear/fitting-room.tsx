"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import { Camera, ImageDown, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_CAMERA,
  FRAME_FINISHES,
  HOTSPOTS,
  LENS_TINTS,
  type FrameFinish,
  type Hotspot,
  type LensTint,
} from "@/lib/eyewear-studio";
import { GlassesModel } from "./glasses-model";
import { Swatches } from "./swatches";

const TryOnDialog = dynamic(() => import("./try-on-dialog"), { ssr: false });

const IDLE_RESUME_MS = 4000;

/* Eases the camera toward a requested view. The owner clears the target
   when the user drags or when idle auto-rotate resumes; until then the
   camera just settles onto it. */
function CameraRig({
  flightTarget,
}: {
  flightTarget: React.RefObject<THREE.Vector3 | null>;
}) {
  useFrame((state, delta) => {
    const t = flightTarget.current;
    if (!t) return;
    const p = state.camera.position;
    p.x = THREE.MathUtils.damp(p.x, t.x, 4.5, delta);
    p.y = THREE.MathUtils.damp(p.y, t.y, 4.5, delta);
    p.z = THREE.MathUtils.damp(p.z, t.z, 4.5, delta);
  });
  return null;
}

function HotspotMarker({
  spot,
  index,
  active,
  onSelect,
}: {
  spot: Hotspot;
  index: number;
  active: boolean;
  onSelect: (spot: Hotspot) => void;
}) {
  return (
    <Html position={spot.position} center zIndexRange={[30, 10]}>
      <button
        type="button"
        onClick={() => onSelect(spot)}
        aria-label={`${spot.title} — show detail`}
        aria-pressed={active}
        className={cn(
          "flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums backdrop-blur-sm transition-colors duration-200",
          active
            ? "border-accent bg-accent text-white"
            : "border-white/35 bg-ink/55 text-white/90 hover:border-accent hover:text-white",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </button>
    </Html>
  );
}

function StageLoader() {
  return (
    <Html center>
      <div className="flex w-40 flex-col items-center gap-3">
        <p className="text-[12px] tracking-[0.14em] text-white/60 uppercase">
          Loading frames
        </p>
        <div className="h-px w-full overflow-hidden bg-white/15">
          <div className="h-full w-1/3 motion-safe:animate-[pei-scan_1.2s_linear_infinite] bg-accent" />
        </div>
      </div>
    </Html>
  );
}

export default function FittingRoom() {
  const reduceMotion = useReducedMotion();
  /* This component is client-only (dynamic, ssr: false), so window exists on
     first render. Narrow portrait stages need the camera further back — the
     frame is 1 unit wide and fov is vertical, so width crops first. */
  const [cam] = useState(() => {
    const narrow = window.matchMedia("(max-width: 640px)").matches;
    return {
      position: (narrow ? [0.9, 0.26, 2.1] : DEFAULT_CAMERA) as [
        number,
        number,
        number,
      ],
      spotScale: narrow ? 1.4 : 1,
    };
  });
  const [finish, setFinish] = useState<FrameFinish>(FRAME_FINISHES[0]);
  const [tint, setTint] = useState<LensTint>(LENS_TINTS[0]);
  const [active, setActive] = useState<Hotspot | null>(null);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [idle, setIdle] = useState(true);
  const [inView, setInView] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const flightTarget = useRef<THREE.Vector3 | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* Only run the render loop while the stage is near the viewport. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const restartIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      flightTarget.current = null; // don't fight the auto-rotate
      setIdle(true);
    }, IDLE_RESUME_MS);
  }, []);

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const selectHotspot = useCallback(
    (spot: Hotspot) => {
      const next = active?.id === spot.id ? null : spot;
      setActive(next);
      if (next) {
        flightTarget.current = new THREE.Vector3(...next.camera).multiplyScalar(
          cam.spotScale,
        );
        setIdle(false);
        clearTimeout(idleTimer.current);
      } else {
        restartIdleTimer();
      }
    },
    [active, cam.spotScale, restartIdleTimer],
  );

  const resetView = useCallback(() => {
    setActive(null);
    flightTarget.current = new THREE.Vector3(...cam.position);
    restartIdleTimer();
  }, [cam.position, restartIdleTimer]);

  const screenshot = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;
    const src = gl.domElement;
    const out = document.createElement("canvas");
    out.width = src.width;
    out.height = src.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1b1714";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, 0, 0);
    const pad = Math.round(out.width * 0.04);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = `600 ${Math.max(14, Math.round(out.width * 0.016))}px sans-serif`;
    ctx.fillText("Premier Eye Institute — The Fitting Room", pad, out.height - pad);
    const a = document.createElement("a");
    a.download = `premier-eye-frames-${finish.id}-${tint.id}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  }, [finish.id, tint.id]);

  const cardMotion = useMemo(
    () =>
      reduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 10 },
          },
    [reduceMotion],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.3fr] lg:gap-12">
      {/* Stage */}
      <div
        ref={stageRef}
        data-lenis-prevent
        className="relative order-1 overflow-hidden rounded-[34px] border border-white/10 bg-[#231c17] lg:order-2"
        role="group"
        aria-label="Interactive 3D glasses viewer. Drag to turn the frame, scroll to zoom."
      >
        {/* warm studio glow behind the frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 48% at 50% 40%, rgba(231,89,42,0.16), transparent 72%)",
          }}
        />
        <div className="h-[420px] sm:h-[520px] lg:h-[560px]">
          <Canvas
            dpr={[1, 2]}
            frameloop={inView ? "always" : "never"}
            camera={{ position: cam.position, fov: 35, near: 0.1, far: 20 }}
            gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
            onCreated={(state) => {
              glRef.current = state.gl;
            }}
          >
            <Suspense fallback={<StageLoader />}>
              <GlassesModel finish={finish} tint={tint} />
              {HOTSPOTS.map((spot, i) => (
                <HotspotMarker
                  key={spot.id}
                  spot={spot}
                  index={i}
                  active={active?.id === spot.id}
                  onSelect={selectHotspot}
                />
              ))}
              <Environment resolution={256}>
                <Lightformer intensity={1.7} position={[0, 2.2, 2]} scale={[6, 3, 1]} />
                <Lightformer
                  intensity={0.9}
                  position={[-3, 1, -1]}
                  rotation-y={Math.PI / 2}
                  scale={[4, 2, 1]}
                  color="#ffe3d1"
                />
                <Lightformer
                  intensity={0.8}
                  position={[3, 0.6, 1]}
                  rotation-y={-Math.PI / 2}
                  scale={[4, 2, 1]}
                />
                <Lightformer
                  intensity={0.45}
                  position={[0, -2, 3]}
                  scale={[5, 2, 1]}
                  color="#ffd9c2"
                />
              </Environment>
              <ContactShadows
                position={[0, -0.4, 0]}
                opacity={0.55}
                scale={2.6}
                blur={2.8}
                far={0.9}
                color="#2a150a"
                frames={1}
              />
            </Suspense>
            <CameraRig flightTarget={flightTarget} />
            <OrbitControls
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              minDistance={0.9}
              maxDistance={2.6}
              minPolarAngle={0.4}
              maxPolarAngle={2.35}
              autoRotate={idle && !reduceMotion}
              autoRotateSpeed={-0.65}
              onStart={() => {
                flightTarget.current = null;
                setIdle(false);
                clearTimeout(idleTimer.current);
              }}
              onEnd={restartIdleTimer}
            />
          </Canvas>
        </div>

        {/* stage utilities */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={screenshot}
            title="Save a screenshot"
            aria-label="Save a screenshot of the current view"
            className="press flex size-10 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-white/85 backdrop-blur-sm transition-colors duration-200 hover:border-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ImageDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            title="Reset view"
            aria-label="Reset the camera view"
            className="press flex size-10 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-white/85 backdrop-blur-sm transition-colors duration-200 hover:border-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>

        <p className="pointer-events-none absolute right-5 bottom-4 hidden text-[11px] tracking-[0.14em] text-white/40 uppercase sm:block">
          Drag to turn · Scroll to zoom
        </p>

        {/* hotspot detail card */}
        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id}
              {...cardMotion}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className="absolute inset-x-4 bottom-4 max-w-[340px] rounded-2xl border border-white/12 bg-ink/85 p-4 shadow-warm backdrop-blur-md sm:left-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading text-[17px] text-white italic">
                  {active.title}
                </p>
                <button
                  type="button"
                  onClick={() => selectHotspot(active)}
                  aria-label="Close detail"
                  className="mt-0.5 text-white/60 transition-colors hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-[1.55] text-white/70">
                {active.copy}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control rail */}
      <div className="order-2 flex flex-col justify-between gap-9 lg:order-1">
        <div className="space-y-8">
          <Swatches
            legend="Acetate"
            options={FRAME_FINISHES}
            value={finish}
            onChange={setFinish}
          />
          <Swatches
            legend="Lens tint"
            options={LENS_TINTS}
            value={tint}
            onChange={setTint}
          />

          <ol className="divide-y divide-white/10 border-y border-white/10">
            {HOTSPOTS.map((spot, i) => (
              <li key={spot.id}>
                <button
                  type="button"
                  onClick={() => selectHotspot(spot)}
                  aria-pressed={active?.id === spot.id}
                  className="group flex w-full items-baseline gap-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span
                    className={cn(
                      "text-[11px] font-semibold tabular-nums transition-colors",
                      active?.id === spot.id ? "text-accent" : "text-white/40",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-heading text-[17px] transition-colors",
                      active?.id === spot.id
                        ? "text-white"
                        : "text-white/75 group-hover:text-white",
                    )}
                  >
                    {spot.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="pill"
            size="pill-sm"
            onClick={() => setTryOnOpen(true)}
          >
            <Camera data-icon="inline-start" className="size-4" />
            Try them on
          </Button>
          <Button variant="pill-ghost" size="pill-sm" asChild>
            <Link href="/book">Book a fitting</Link>
          </Button>
          <p className="w-full text-[12px] text-white/45">
            Try-on uses your camera, entirely in your browser — nothing is
            recorded or uploaded.
          </p>
        </div>
      </div>

      {tryOnOpen && (
        <TryOnDialog
          finish={finish}
          tint={tint}
          onFinishChange={setFinish}
          onTintChange={setTint}
          onClose={() => setTryOnOpen(false)}
        />
      )}
    </div>
  );
}
