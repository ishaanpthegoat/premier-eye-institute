"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { withBasePath } from "@/lib/base-path";
import type { FrameFinish, LensTint } from "@/lib/eyewear-studio";

export const GLASSES_MODEL_URL = withBasePath("/models/glasses.glb");

/* Self-hosted Draco decoder (supply-chain hardening). The glasses .glb is
   Draco-compressed; by default drei fetches the decoder from
   www.gstatic.com at runtime. Passing this path as useGLTF's 2nd arg makes
   drei load the decoder from our own origin instead (files copied from
   three/examples/jsm/libs/draco/gltf into /public/draco), so the CSP can stay
   locked to 'self' with no external code execution. */
const DRACO_DECODER_PATH = withBasePath("/draco/");

type Slot = "frame" | "temple" | "lens";

type Part = {
  mesh: THREE.Mesh;
  original: THREE.Material | THREE.Material[];
  slot: Slot;
};

type Built = {
  root: THREE.Group;
  parts: Part[];
  frameMat: THREE.MeshPhysicalMaterial;
  lensMat: THREE.MeshPhysicalMaterial;
};

/* Material names as authored in the GLB (verified with gltf-transform):
   "Frame" = untextured front, "Handles" = textured temples, "Frame.1" = lenses. */
function slotFor(material: THREE.Material | THREE.Material[]): Slot {
  const name = (Array.isArray(material) ? material[0] : material)?.name ?? "";
  if (name === "Frame") return "frame";
  if (name === "Handles") return "temple";
  return "lens";
}

function build(scene: THREE.Group): Built {
  const root = scene.clone(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = 1 / size.x;
  root.scale.setScalar(s);
  root.position.set(-center.x * s, -center.y * s, -center.z * s);

  const parts: Part[] = [];
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      parts.push({ mesh: o, original: o.material, slot: slotFor(o.material) });
    }
  });

  const frameMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.3,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.1,
  });
  const lensMat = new THREE.MeshPhysicalMaterial({
    transparent: true,
    roughness: 0.08,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    envMapIntensity: 1.4,
  });
  return { root, parts, frameMat, lensMat };
}

/**
 * The shared glasses mesh: normalized so the frame front is exactly 1 unit
 * wide, centered on the origin, facing +Z. Both the fitting-room stage and
 * the try-on overlay mount this and drive finish/tint through props.
 */
export function GlassesModel({
  finish,
  tint,
}: {
  finish: FrameFinish;
  tint: LensTint;
}) {
  const { scene } = useGLTF(GLASSES_MODEL_URL, DRACO_DECODER_PATH);

  /* Lazily build a per-mount clone + working materials. */
  const builtRef = useRef<Built | null>(null);
  if (builtRef.current === null) {
    builtRef.current = build(scene);
  }

  useEffect(() => {
    const built = builtRef.current;
    return () => {
      built?.frameMat.dispose();
      built?.lensMat.dispose();
    };
  }, []);

  /* eslint-disable react-hooks/immutability --
     three.js interop: retinting means mutating scene-graph materials owned
     by our per-mount ref, not React-managed values. */
  useLayoutEffect(() => {
    const built = builtRef.current;
    if (!built) return;
    built.frameMat.color.set(finish.hex);
    built.lensMat.color.set(tint.hex);
    built.lensMat.opacity = tint.opacity;
    for (const p of built.parts) {
      if (p.slot === "lens") {
        p.mesh.material = built.lensMat;
        p.mesh.renderOrder = 1; // draw after the frame; depthWrite is off
      } else if (finish.original) {
        p.mesh.material = p.original;
      } else {
        p.mesh.material = built.frameMat;
      }
    }
  }, [finish, tint]);
  /* eslint-enable react-hooks/immutability */

  /* eslint-disable-next-line react-hooks/refs --
     lazy-init ref: guaranteed non-null after the init block above, and
     stable for the lifetime of the mount. */
  return <primitive object={builtRef.current.root} />;
}

useGLTF.preload(GLASSES_MODEL_URL, DRACO_DECODER_PATH);
