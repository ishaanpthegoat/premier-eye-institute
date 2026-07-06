/* Config for the eyewear fitting room (3D showcase + virtual try-on).
   Positions are in normalized model space: the GLB is rescaled so the
   frame front is 1 unit wide, centered on the origin, facing +Z. */

export type FrameFinish = {
  id: string;
  label: string;
  /** Swatch + material color. */
  hex: string;
  /** Keep the as-shipped materials (patterned temples) instead of tinting. */
  original?: boolean;
};

export type LensTint = {
  id: string;
  label: string;
  hex: string;
  opacity: number;
};

export type Hotspot = {
  id: string;
  title: string;
  copy: string;
  /** Marker anchor in normalized model space. */
  position: [number, number, number];
  /** Camera position the view eases to when this spot is focused. */
  camera: [number, number, number];
};

export const FRAME_FINISHES: FrameFinish[] = [
  /* "classic" keeps the GLB's as-shipped materials — glossy black front
     with tortoise-patterned temples; the swatch hex approximates the mix. */
  { id: "classic", label: "Classic tortoise", hex: "#7a4423", original: true },
  { id: "noir", label: "Noir", hex: "#211d1a" },
  { id: "bone", label: "Bone", hex: "#e6dbc9" },
  { id: "smoke", label: "Smoke", hex: "#757069" },
  { id: "ember", label: "Ember", hex: "#E7592A" },
];

export const LENS_TINTS: LensTint[] = [
  { id: "clear", label: "Clear", hex: "#e8eef2", opacity: 0.16 },
  { id: "sunset", label: "Sunset brown", hex: "#4a2c14", opacity: 0.78 },
  { id: "g15", label: "G-15 green", hex: "#2e4438", opacity: 0.75 },
  { id: "slate", label: "Slate blue", hex: "#2f3d4d", opacity: 0.72 },
];

/* Each spot narrates a real part of a fitting at the practice —
   the numbering in the UI matches the markers on the model. */
export const HOTSPOTS: Hotspot[] = [
  {
    id: "front",
    title: "The acetate front",
    copy: "Hand-finished acetate, warmed and adjusted so the frame sits level — no face is perfectly symmetric, and that's fine.",
    position: [0.3, 0.1, 0.44],
    camera: [0.55, 0.35, 1.5],
  },
  {
    id: "bridge",
    title: "The bridge",
    copy: "Most of the fit lives here. We set the bridge so your frames don't pinch — and don't slide when you look down.",
    position: [0, 0.09, 0.46],
    camera: [0, 0.28, 1.6],
  },
  {
    id: "temples",
    title: "Hinges & temples",
    copy: "Temples are bent to your ears at pickup, and re-adjusted any time you drop by — usually on the spot.",
    position: [-0.46, 0.11, 0.3],
    camera: [-1.15, 0.32, 1.05],
  },
  {
    id: "lenses",
    title: "Your lenses",
    copy: "Cut to your prescription with the coatings you actually need — anti-reflective, blue-filter, or a full sun tint.",
    position: [-0.26, -0.02, 0.44],
    camera: [-0.35, 0.05, 1.55],
  },
];

export const DEFAULT_CAMERA: [number, number, number] = [0.85, 0.24, 1.5];
