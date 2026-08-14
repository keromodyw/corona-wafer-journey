# PROJECT_MAP — WAFER Journey!

> Living memory doc. Updated every milestone. Last sync: 2026-08-14 (user-requested polish batch, build pending).
> NOT OFFICIAL. Built by AUG round QA interns 2026.

---

## [TECH_STACK]

Pinned against npm registry (queried 2026-08-13, Node v24.18.0 local). Exact pins in `package.json`.

| Role            | Package                    | Version  | Note |
|-----------------|----------------------------|----------|------|
| Build tool      | vite                       | 8.2.1    | requires node ^20.19 \|\| >=22.12 ✓ |
| Framework       | react / react-dom          | 19.2.8   | |
| Toolchain       | typescript                 | 6.0.3    | installed from official create-vite line `~6.0.2`. TS 7.0.2 (native/tsgo) on npm `latest` tracked, not adopted |
| React plugin    | @vitejs/plugin-react       | 6.0.5    | |
| Scroll anim     | gsap (incl. ScrollTrigger) | 3.15.0   | scroll choreography + number parallax |
| Smooth scroll   | lenis                      | 1.3.26   | `lerp .09`, `anchors:true`, wired to gsap ticker |
| 3D (WebGL)      | three                      | 0.185.1  | per-stage 3D illustrations |
| R3F (WebGL)     | @react-three/fiber         | 9.7.0    | declarative scene graph per stage |
| 3D types        | @types/three               | 0.185.0  | dev — three ships no types |
| PDF export      | jspdf                      | 4.2.1    | **lazy-loaded** (`import()` at click) → split chunk, keeps main bundle small |
| JPG export      | (none)                     | —        | native `canvas.toBlob('image/jpeg', 0.9)` |
| Dev runner      | tsx                        | 4.23.12  | dev-only, used by `npm run smoke` |
| Logging         | (none)                     | —        | hand-rolled async wrapper `core/log.ts` |

**3D decision (upgraded 2026-08-14, user-approved):** two layers —
1. **WebGL (three + @react-three/fiber)** for one **real 3D illustration per stage** (`StageIllustration.tsx`, lazy-loaded, only mounts when a stage is ~300px from viewport): custom scenes for all 9 stages (raw materials, baking oven, open-air conveyor, filling prep, filling lanes with dripping nozzles, compressing press, cooling tunnel, divider + metal detector, packing/labelling) built from boxes/cylinders/tori/circles + flat-shaded mats. Wafer sheets use a procedurally-generated **waffle texture** (`getWaffleTexture`, 6×6 grid). **OrbitControls** (`three/examples/jsm/controls/OrbitControls.js`, wrapped for R3F) lets the user **drag/touch to rotate** the scene freely; gentle **auto-rotate** when animation is on, no zoom, clamped polar angles so the scene never shows its back. `frameloop='demand'` when motion disabled. Scroll-driven rotation was **removed** (it kept showing scenes from the back) — `scrollSignal.ts` deleted.
2. **CSS `preserve-3d`** still powers the hero wafer (finger-wafer sheet stack with waffle-grid + gloss + cream layers — no cookies) and the stage-card 3D flip reveals — zero GPU cost.

**Design decisions (user batch 2026-08-14):**
- **Palette:** `#dc0816` (red) primary · `#ffddc2` (peach) · `#f97d41` (orange) · `#d8606a` (rose) · `#ff9faa` (pink). Control badges: **CCP = red**, **CP = peach**, **OPRP = orange**.
- **Brand:** renamed **"Munchi QA Journey" → "WAFER Journey!"** everywhere (header, hero, exports, PDF, `<title>`); all "QA Journey" copy dropped ("Machines" label, "Production & Quality Control" subtitles). "AUG" replaces "Aug" in all copy.
- **Logo:** user's `Downloads/Corona.jpg` (15,728 b) copied to `public/logo/corona-logo.jpg` (old PNG removed). All white logo backdrops removed. **Logo sits beside the NOT OFFICIAL notice** on both the hero and the disclaimer (not above it).
- **Header:** dark, red-bordered **NOT OFFICIAL** tag (peach sub-copy) + a **global "Quality Instructions" switch** that shows/hides every QA panel at once (per-card toggles removed).
- **Exports are landscape & larger:** single-page JPG/PDF is a 3400×3040 **snake** flowchart with **~3× text** that fills the nodes (process 44 / QA 40 / checks 36, up to 4 wrapped lines each); multi-page PDF is A4 **landscape**, **dark pages** (ink background, red header band, palette-matched) with a cover whose "The Journey" TOC no longer overflows.
- **CCP badge:** outlined with a **black border** in the flowchart, the PDF and the site chips.
- **QA block per stage:** rendered only when the global header switch is ON — control badge (CCP/OPRP/CP), compact instruction, "TO DO" checklist.
- **The "filling trick":** stage 5 shows a mistaken line struck through on scroll, then the corrected line ("only middle-layer sheets get filling") slides in — driven by the card `.in-view` class. The stage-5 3D scene now drips filling on **one lane only**.
- **Wafer fingers (3D):** every `Finger` is now **wafer below + cream filling + wafer above** (three layers) in all scenes that use them.
- **Disclaimer:** logo + badge side-by-side, **intern cards** — bigger photos (104px), name below, LinkedIn button (Kirolos Mody = real link, Jana = placeholder) — and the user's updated disclaimer text. `public/interns/intern-1.jpg`.
- **Fresh Air stage kept** (scene `air`, open-air lane) — only its `machine` name was removed (machine is now optional per stage).
- **Final Product section:** `public/product/wafer-single.png` (single item, transparent) + `public/product/wafer-poster.jpg` (all types poster) + the company item description.
- **Removed:** flowchart intro paragraphs, "Educational project — not affiliated with Corona S.A." footer/PDF line, SpinShowcase.

**Explicitly rejected (no-feature-creep):** zod (static internal data), dom-to-image (maintenance mode), router/state libraries (single screen).

---

## [SYSTEM_FLOW]

Pure static SPA. No backend. Data is a single typed static module.

```
Boot → wireGlobalErrors()
 └─ App
     ├─ Disclaimer modal (gate): logo+badge, what/how, intern cards (photo+name+LinkedIn), made-by → [OK]
     │      └─ on OK → unlock scroll, start Lenis+GSAP, hero entrance
     ├─ Header: logo + "WAFER Journey!" + [Quality Instructions switch] + pill "NOT OFFICIAL · made by AUG round QA interns 2026"
     ├─ Hero: logo beside NOT OFFICIAL kicker, "The WAFER Journey", CTA → #journey + auto-spinning 3D wafer (Wafer3D, scroll-parallax)
     ├─ Journey: 9 StageSections (ScrollTrigger `once` reveal → 3D flip card + number parallax)
     │      each: STAGE nn badge · title · process · [fix trick] · machines
     │      + lazy WebGL 3D illustration (`StageIllustration`, drag/touch orbit + auto-rotate), mounts near viewport
     │      + QA panel (badge · instruction · TO DO checklist) only when the global Quality Instructions switch is ON
     ├─ FlowchartSection: canvas preview + [JPG] [PDF 1 page] [PDF detailed] + toast
     ├─ ProductSection: final-product single item + all-types poster + company description
     └─ Footer: logo, made-by, "Show disclaimer" (reopens modal)
```

Export pipeline (single source of truth — `export/layout.ts` geometry):

```
src/data/stages.ts ──► src/export/layout.ts (node rects, sizes, colors)
                            ├─► toCanvas.ts ──► preview + JPG  (canvas.toBlob jpeg .9)
                            └─► toPdf.ts (jsPDF vector)
                                   ├─► single-page PDF = same poster, one custom-ratio page
                                   └─► multi-page PDF  = cover+disclaimer + 1 stage/page (10pp)
```

---

## [ARCHITECTURE]

Feature-based, flat, no micro-files.

```
munchi-qa-journey/
  index.html                    ← fonts (Space Grotesk + Inter), meta, favicon=logo
  public/logo/corona-logo.jpg   ← user-provided logo (Corona.jpg)
  public/interns/intern-1.jpg   ← first intern photo (disclaimer avatar)
  public/product/               ← wafer-single.png (final item) + wafer-poster.jpg (all types)
  scripts/smoke.mts             ← Node smoke test (layout + full PDF runtime)
  src/
    main.tsx                    ← entry + wireGlobalErrors
    App.tsx                     ← shell: gating, scroll fx (Lenis+GSAP+progress), sections
    data/stages.ts              ← the ONLY editable content file (9 stages + QA)
    core/
      log.ts                    ← async non-blocking logger + window error hooks (protocol 4)
      brand.ts                  ← Corona palette, site copy (pure, Node-safe)
      assets.ts                 ← logo src + downloadBlob (browser-only)
      useReducedMotion.ts
    ui/   Header · Disclaimer · Hero · Wafer3D · StageSection · FlowchartSection · Footer
    three/
      StageIllustration.tsx      ← per-stage WebGL scene (three + R3F + OrbitControls, lazy-loaded) — emoji is the Suspense fallback
    export/
      layout.ts                 ← geometry engine (pure, Node-safe) — SHARED core
      toCanvas.ts               ← canvas renderer + logo loader (browser)
      toPdf.ts                  ← multi-page detailed + single-page poster (jsPDF, Node-safe)
      index.ts                  ← export API: exportJpg / exportPdfSingle / exportPdfMulti
    index.css                   ← tokens, responsive, reduced-motion, motion choreography
```

**Shared/Core rule:** shared only where truly reused — `layout.ts` (preview, JPG, both PDFs), `log.ts`, `brand.ts`. `tsconfig` is `strict`.

### Logging design (Safe Logging, async/non-blocking)
`core/log.ts`: levels `debug|info|warn|error`, level filter via `import.meta.env.DEV`, stamped prefix, 50-entry error ring, hooks `window.onerror` + `unhandledrejection`; never `await`s, never throws.

---

## [VERIFICATION — Protocol 2]

| Gate | Command | Result |
|------|---------|--------|
| Type-check + bundle | `npm run build` | PASS (0 errors) |
| Lint (104 rules) | `npm run lint` | PASS (0 warnings/errors) |
| Layout engine runtime | `npm run smoke` | PASS — 3400×3040 landscape, 9 nodes, no overlaps/OOB |
| Multi-page PDF runtime | `npm run smoke` | PASS — 10 pages, 97,330 bytes (A4 landscape) |
| Dev server transform | root + logo | PASS — 200 OK, logo corona-logo.jpg 15,728b + product/intern assets |
| Bundle sizing | main 352.7KB (119.9 gz) | jsPDF/html2canvas + StageIllustration all in lazy chunks (on-demand load) |

> Per-stage WebGL chunk: 896.1KB (236.7 gz) — lazy via `import()`, only fetched when a stage enters viewport → no cost on first paint.

---

## [ORPHANS & PENDING]

- [ ] **Manual QA (browser click-through):** the three export buttons (JPG / single PDF / detailed PDF), the modal→journey flow, the global Quality Instructions switch, the strikethrough fix trick, and the per-stage WebGL illustrations (drag/touch orbit + auto-rotate, single filling lane + 3-layer fingers, drip/air animations run, no WebGL errors in console) must be checked in a real browser. No browser automation is available in this environment; runtime PDF path is covered by the smoke test, the canvas path only by type-check + transform checks.
- [ ] **Visual check of logo in UI:** `Corona.jpg` is a 15,728 b JPEG and renders with `object-fit: contain` (no white backdrops); the authoring model cannot view images, so final look — and whether the JPEG's own background looks right on the dark site — needs a human eye.
- [ ] **Visual check of 3D scenes:** the authoring model cannot view WebGL output — stage scenes (esp. `fill-lanes` drips, `air` open lane, `baking` oven glow, `divide` metal-detector torus) need a human eye for proportions/colors and orbit feel.
- [ ] **Check the new palette, larger exports, and header switch in the browser:** chips (CCP red w/ black border / CP peach / OPRP orange) on dark cards, 3400×3040 landscape snake flowchart JPG/PDFs, bigger detailed PDF, header "Quality Instructions" switch, intern cards in the disclaimer, final-product section.
- [ ] Stage content is an editable DRAFT (standard wafer line). Swap in official stages in `src/data/stages.ts` — zero code change. The stage-5 "filling trick" strings (`fix.wrong` / `fix.right`) are placeholders to be confirmed against the real anecdote.
- [ ] Jana's intern photo + LinkedIn URL: `public/interns/intern-2.jpg` + `INTERNS` entry — currently a `?` placeholder + "coming soon" button in the disclaimer.
- [ ] TS 7.0.2 (native `tsgo`) on npm `latest` — tracked, not adopted (toolchain stability). Deprecation risk documented.

**Resolved during build:** logo asset provided → placed `public/logo/` ✓ · multi-page = cover+disclaimer+1 stage/page (user-approved) ✓ · JPG quality 0.9 size guard ✓ · TS pin (6.0.3 official line) ✓ · restyle batch 2026-08-14: new palette, Corona.jpg logo, landscape snake exports, QA toggle panel, fix trick, SpinShowcase removed, waffle-texture wafers, drip + open-air scenes ✓ · polish batch 2026-08-14: WAFER Journey! rename, AUG, header Quality Instructions switch, logo-beside-notice (hero+disclaimer), intern avatars, OrbitControls free rotate, MACHINES, flowchart intro removed, bigger export text, detailed-PDF palette pass ✓ · content batch 2026-08-14: fresh-air machine name removed (stage kept, machine optional), single filling lane in stage-5 scene, 3-layer wafer fingers (wafer-filling-wafer), ~3× flowchart text (3400×3040), CCP black-border chips, detailed-PDF dark pages + cover TOC fix, new disclaimer text, intern cards (photo+name+LinkedIn), Final Product section ✓.
