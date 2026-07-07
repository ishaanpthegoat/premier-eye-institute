"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { ImageDown, VideoOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FRAME_FINISHES,
  LENS_TINTS,
  type FrameFinish,
  type LensTint,
} from "@/lib/eyewear-studio";
import { GlassesModel } from "./glasses-model";
import { Swatches } from "./swatches";

/* Pinned to the installed @mediapipe/tasks-vision version. */
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/* Face Mesh landmark indices used to pose the glasses. */
const LM = {
  eyeRightOuter: 33,
  eyeLeftOuter: 263,
  forehead: 10,
  chin: 152,
  glabella: 168,
  noseBridge: 6,
};

/* Glasses front width relative to outer-eye-corner span (~9cm span,
   ~13.5–14cm frame). The model itself is normalized to width 1. */
const WIDTH_PER_EYESPAN = 1.55;

/* Where the bridge contact point sits in normalized model space —
   the model point that gets pinned to the wearer's nose bridge. */
const BRIDGE_LOCAL = new THREE.Vector3(0, 0.05, 0.35);

/* How fast the rendered glasses chase the detected pose. Higher = snappier,
   lower = smoother. Applied frame-rate-independently (see FaceAnchor) so it
   feels the same at 60 and 120fps, instead of the old fixed per-frame lerp
   that jittered faster on high-refresh screens. */
const POSE_DAMP = 16;

/* Face detection occasionally drops a single frame (a blink, a fast turn).
   Hold the last pose for this many missed frames before hiding the glasses,
   so they don't flicker off and snap back on every dropped frame. */
const MISS_GRACE = 6;

type Phase = "loading" | "live" | "error";

type Pose = {
  tracked: boolean;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
};

/* Applies the latest detected pose to the glasses with a short lerp so
   30fps detection still reads as smooth 60fps motion. */
function FaceAnchor({
  pose,
  children,
}: {
  pose: React.MutableRefObject<Pose>;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const p = pose.current;
    if (!p.tracked) {
      g.visible = false;
      return;
    }
    if (!g.visible) {
      // First frame back: snap to the pose instead of gliding in from
      // wherever it was left, so it doesn't fly across the mirror.
      g.visible = true;
      g.position.copy(p.position);
      g.quaternion.copy(p.quaternion);
      g.scale.setScalar(p.scale);
      return;
    }
    // Frame-rate-independent smoothing: t≈0.26 at 60fps, and the same
    // visual damping at 120fps. Clamped delta guards against a tab-restore
    // spike that would otherwise snap the glasses.
    const t = 1 - Math.exp(-POSE_DAMP * Math.min(delta, 0.05));
    g.position.lerp(p.position, t);
    g.quaternion.slerp(p.quaternion, t);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, p.scale, t));
  });
  return (
    <group ref={group} visible={false}>
      {children}
    </group>
  );
}

export default function TryOnDialog({
  finish,
  tint,
  onFinishChange,
  onTintChange,
  onClose,
}: {
  finish: FrameFinish;
  tint: LensTint;
  onFinishChange: (f: FrameFinish) => void;
  onTintChange: (t: LensTint) => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("loading");
  const [aspect, setAspect] = useState(4 / 3);
  const [faceSeen, setFaceSeen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const overlayGl = useRef<THREE.WebGLRenderer | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const pose = useRef<Pose>({
    tracked: false,
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: 1,
  });
  /* Consecutive detection frames with no face — see MISS_GRACE. */
  const missRef = useRef(0);

  /* Scratch objects reused every detection frame — no per-frame allocation. */
  const scratch = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      c: new THREE.Vector3(),
      d: new THREE.Vector3(),
      x: new THREE.Vector3(),
      y: new THREE.Vector3(),
      z: new THREE.Vector3(),
      m: new THREE.Matrix4(),
    }),
    [],
  );

  /* Lock page scroll behind the dialog. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Track the overlay's CSS-pixel size: the ortho scene maps 1 unit = 1px. */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      sizeRef.current = {
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      };
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const runDetection = useCallback(
    (landmarker: FaceLandmarker, video: HTMLVideoElement) => {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      const result = landmarker.detectForVideo(video, performance.now());
      const face = result.faceLandmarks?.[0];
      if (!face) {
        // Ride out a few dropped frames on the last good pose before
        // hiding — a blink or quick turn shouldn't blink the glasses off.
        missRef.current += 1;
        if (missRef.current > MISS_GRACE) {
          pose.current.tracked = false;
          setFaceSeen(false);
        }
        return;
      }
      missRef.current = 0;
      const { a, b, c, d, x, y, z, m } = scratch;
      /* Normalized landmark → scene px: x right, y up, z toward the viewer.
         The overlay canvas is CSS-mirrored together with the video, so all
         math stays in un-mirrored image space. */
      const put = (i: number, out: THREE.Vector3) =>
        out.set(
          (face[i].x - 0.5) * w,
          -(face[i].y - 0.5) * h,
          -face[i].z * w,
        );

      put(LM.eyeRightOuter, a);
      put(LM.eyeLeftOuter, b);
      const eyeSpan = a.distanceTo(b);
      x.subVectors(b, a).normalize();
      put(LM.forehead, c);
      put(LM.chin, d);
      y.subVectors(c, d).normalize();
      z.crossVectors(x, y).normalize();
      y.crossVectors(z, x);
      m.makeBasis(x, y, z);
      pose.current.quaternion.setFromRotationMatrix(m);

      const scale = eyeSpan * WIDTH_PER_EYESPAN;
      pose.current.scale = scale;

      /* Pin the model's bridge point to the wearer's nose bridge. */
      put(LM.glabella, a);
      put(LM.noseBridge, b);
      a.add(b).multiplyScalar(0.5);
      c.copy(BRIDGE_LOCAL)
        .multiplyScalar(scale)
        .applyQuaternion(pose.current.quaternion);
      pose.current.position.copy(a).sub(c);
      pose.current.tracked = true;
      setFaceSeen(true);
    },
    [scratch],
  );

  /* Camera + FaceLandmarker lifecycle. */
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let landmarker: FaceLandmarker | null = null;
    let lastTime = -1;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-camera");
        const { FaceLandmarker: FL, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const [fileset, media] = await Promise.all([
          FilesetResolver.forVisionTasks(WASM_URL),
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          }),
        ]);
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = media;
        const options = (delegate: "GPU" | "CPU") => ({
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: "VIDEO" as const,
          numFaces: 1,
        });
        try {
          landmarker = await FL.createFromOptions(fileset, options("GPU"));
        } catch {
          landmarker = await FL.createFromOptions(fileset, options("CPU"));
        }
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = media;
        await video.play();
        if (cancelled) return;
        setAspect(video.videoWidth / video.videoHeight || 4 / 3);
        setPhase("live");
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (!landmarker || video.readyState < 2) return;
          if (video.currentTime === lastTime) return;
          lastTime = video.currentTime;
          runDetection(landmarker, video);
        };
        loop();
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      landmarker?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [runDetection]);

  const screenshot = useCallback(() => {
    const video = videoRef.current;
    const glCanvas = overlayGl.current?.domElement;
    if (!video || !glCanvas || video.readyState < 2) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    /* Match the mirrored on-screen view. */
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.drawImage(glCanvas, 0, 0, w, h);
    ctx.restore();
    const pad = Math.round(w * 0.04);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `600 ${Math.max(14, Math.round(w * 0.018))}px sans-serif`;
    ctx.fillText("Premier Eye Institute — Virtual try-on", pad, h - pad);
    const a = document.createElement("a");
    a.download = `premier-eye-try-on-${finish.id}-${tint.id}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  }, [finish.id, tint.id]);

  /* This module is only ever loaded client-side (dynamic, ssr: false),
     so document is always available for the portal. */
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Virtual try-on mirror"
      data-lenis-prevent
    >
      <motion.button
        type="button"
        aria-label="Close try-on"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-md"
      />
      <motion.div
        initial={
          reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.98 }
        }
        animate={
          reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative w-full max-w-[680px] overflow-hidden rounded-[24px] border border-white/12 bg-[#231c17] shadow-warm-lg sm:rounded-[34px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
          <div>
            <p className="font-heading text-[22px] text-white italic">
              The mirror
            </p>
            <p className="mt-0.5 text-[12px] text-white/50">
              Runs entirely in your browser — nothing is recorded or uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close try-on"
            className="press flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors duration-200 hover:border-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mirror */}
        <div className="px-5 pt-4 sm:px-7">
          <div
            ref={boxRef}
            className="relative w-full overflow-hidden rounded-2xl bg-black/45"
            style={{ aspectRatio: `${aspect}` }}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity duration-500 ${
                phase === "live" ? "opacity-100" : "opacity-0"
              }`}
            />
            {phase === "live" && (
              <Canvas
                orthographic
                camera={{ position: [0, 0, 600], zoom: 1, near: 0.1, far: 5000 }}
                dpr={[1, 2]}
                gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
                onCreated={(state) => {
                  overlayGl.current = state.gl;
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "scaleX(-1)",
                  pointerEvents: "none",
                }}
              >
                <ambientLight intensity={0.9} />
                <directionalLight position={[0, 200, 600]} intensity={1.1} />
                <Suspense fallback={null}>
                  <FaceAnchor pose={pose}>
                    <GlassesModel finish={finish} tint={tint} />
                  </FaceAnchor>
                  <Environment resolution={128}>
                    <Lightformer
                      intensity={1.5}
                      position={[0, 3, 4]}
                      scale={[8, 4, 1]}
                    />
                    <Lightformer
                      intensity={0.7}
                      position={[-4, 1, 2]}
                      rotation-y={Math.PI / 2}
                      scale={[5, 3, 1]}
                      color="#ffe3d1"
                    />
                  </Environment>
                </Suspense>
              </Canvas>
            )}

            {phase === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <p className="text-[12px] tracking-[0.14em] text-white/60 uppercase">
                  Warming up the mirror
                </p>
                <div className="h-px w-40 overflow-hidden bg-white/15">
                  <div className="h-full w-1/3 motion-safe:animate-[pei-scan_1.2s_linear_infinite] bg-accent" />
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <VideoOff className="size-6 text-white/50" />
                <p className="max-w-[360px] text-[14px] leading-[1.6] text-white/75">
                  We couldn&apos;t open your camera. Check your browser&apos;s
                  camera permission — or just come see us, fittings are always
                  free.
                </p>
                <Button variant="pill" size="pill-sm" asChild>
                  <Link href="/book">Book a fitting</Link>
                </Button>
              </div>
            )}

            {phase === "live" && !faceSeen && (
              <p className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full border border-white/15 bg-ink/70 px-4 py-1.5 text-[12px] text-white/80 backdrop-blur-sm">
                Center your face in the frame
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Swatches
              legend="Acetate"
              options={FRAME_FINISHES}
              value={finish}
              onChange={onFinishChange}
              compact
            />
            <Swatches
              legend="Lens tint"
              options={LENS_TINTS}
              value={tint}
              onChange={onTintChange}
              compact
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="pill-ghost"
              size="pill-sm"
              onClick={screenshot}
              disabled={phase !== "live"}
            >
              <ImageDown data-icon="inline-start" className="size-4" />
              Save photo
            </Button>
            <Button variant="pill" size="pill-sm" asChild>
              <Link href="/book">Book a fitting</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
