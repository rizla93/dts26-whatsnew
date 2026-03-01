export type DemoEntry = {
  id: string;
  label: string;
  path: string;
  tagName: string;
  load: () => Promise<unknown>;
};

export const DEMOS: DemoEntry[] = [
  {
    id: "gaussian-splat-stairs",
    label: "Gaussian Splat Layer Stairs",
    path: "/demos/gaussian-splat-stairs",
    tagName: "demo-gaussian-splat-stairs",
    load: () => import("./gaussian-splat-stairs/page"),
  },
  {
    id: "sf-construction",
    label: "San Francisco construction buildings",
    path: "/demos/sf-construction",
    tagName: "demo-sf-construction",
    load: () => import("./sf-construction/page"),
  },
  {
    id: "glow-building",
    label: "Glow building",
    path: "/demos/glow-building",
    tagName: "demo-glow-building",
    load: () => import("./glow-building/page"),
  },
  {
    id: "fire-perimeters",
    label: "Fire perimeters",
    path: "/demos/fire-perimeters",
    tagName: "demo-fire-perimeters",
    load: () => import("./fire-perimeters/page"),
  },
];
