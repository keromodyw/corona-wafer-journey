# WAFER Journey!

> NOT OFFICIAL — made by AUG round QA interns 2026.

An educational, scroll-animated single-page website showing the wafer production line and the role of the QA engineer at every stage, with downloadable flowchart exports.

## Quick start

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run lint      # oxlint (0 warnings expected)
npm run smoke     # Node smoke test: layout engine + full detailed-PDF generation
```

## Features

- Disclaimer gate → 9-stage scroll journey (GSAP ScrollTrigger + Lenis smooth scroll, CSS-3D reveals, per-stage WebGL illustrations with drag/touch orbit controls + slow auto-rotate).
- Corona palette (red/peach/orange/rose/pink) + user-provided logo (in `public/logo/`), fully responsive, reduced-motion safe.
- Header "Quality Instructions" switch shows/hides all QA panels at once; disclaimer lists the interns with photos, names and LinkedIn buttons.
- "Final Product" section shows the packaged wafer item (single-item PNG + all-types poster) with the company description.
- Flowchart exports from a single source of truth (`src/export/layout.ts`), all **landscape** with large, space-filling text:
  - **JPG** — one premium infographic of the line (snake layout, ~3× text).
  - **PDF · 1 page** — the same infographic as a single-page PDF.
  - **PDF · detailed** — cover + disclaimer + one full stage page per step (10 pages, A4 landscape, palette-matched, dark pages).

## Editing content

All stage data lives in `src/data/stages.ts` (one file, typed). No code changes needed to swap in official stages.

## Tech

Vite 8 · React 19 · TypeScript 6 (strict) · GSAP 3.15 · Lenis · jsPDF 4 (lazy-loaded on export).
