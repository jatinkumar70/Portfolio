# Jatin Kumar — Portfolio

A cyberpunk portfolio for **Jatin Kumar, Senior Frontend Engineer** — codename **NEON//GRID**: a terminal boot-sequence preloader, a live raw-WebGL neon-city shader hero that warps as you scroll, a scroll-decrypted manifesto, a pinned horizontal project stream, crossed hazard-tape marquees and GSAP ScrollTrigger choreography throughout.

**Stack:** Vite 8 · React 19 · TypeScript 6 (strict) · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, ScrambleText, CustomEase, DrawSVG) · Lenis · raw WebGL (no three.js) · React Router 7 · Lucide icons. Fonts are self-hosted (Archivo variable width, Chakra Petch, JetBrains Mono via Fontsource).

---

## Quick start

Requires **Node.js 20.19+** (developed on Node 24) and npm.

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command             | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Vite dev server with HMR                                            |
| `npm run typecheck` | `tsc -b` in strict mode                                             |
| `npm run lint`      | `oxlint` over `src/`                                                |
| `npm run build`     | Type-check, production build to `dist/`, then sitemap (if URL set)  |
| `npm run preview`   | Serve the production build locally                                  |

## Routes

| Route      | Page                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| `/`        | Home — hero, manifesto, selected work (`/#work`), arsenal (toolkit), operator profile, contact invitation |
| `/about`   | Biography, timeline, philosophy, promotions, toolkit, resume                           |
| `/contact` | Contact details and form                                                               |

Unknown paths render a 404 page.

---

## Editing content

Content is separated from presentation — you should rarely need to touch components.

| What                                   | Where                              |
| -------------------------------------- | ---------------------------------- |
| Name, role, statements, availability label, location/time zone, email, LinkedIn, GitHub, resume path | `src/data/site.ts` |
| Projects (summary, highlights, stack, screenshot) | `src/data/projects.ts` |
| Toolkit lists and marquee words        | `src/data/stack.ts`                |
| Career timeline                         | `src/data/timeline.ts`             |
| Navigation                             | `src/data/navigation.ts`           |

### Project screenshots

Screenshots live in `public/work/`. To swap one (an animated **.gif** works too), drop the file in and update `image.src`, `width` and `height` for that project in `src/data/projects.ts`. A project without `image` shows a typographic plate instead. Clicking a screenshot opens it full size.

> **Privacy:** `public/work/crossroads-helpline.png` has customer names, emails, phone numbers and vehicle numbers blurred. The redaction is reproducible from `scripts/redact/crossroads.html` (the unblurred original stays out of `public/`). Check any new screenshot for personal or client data before publishing.

### Availability label

`site.availability` in `src/data/site.ts` — set `show: false` to hide it, or change the `label`.

### Resume

The original PDF lives at `public/resume/Jatin-Kumar-Resume.pdf` and is linked from the menu, footer, about and contact pages. To replace it, overwrite that file (keep the name, or update `site.resume`).

### Contact form

- **Default (no backend):** submitting opens the visitor's email app with the message pre-filled (`mailto:`), and the UI says exactly that — it never claims the message was sent.
- **With a form service:** set `VITE_CONTACT_ENDPOINT` to a public endpoint that accepts JSON `POST` (`{ name, email, topic, message }`), e.g. Formspree or Web3Forms. Success is shown only for a 2xx response. Never put secret keys in `VITE_*` variables — they are embedded in the client bundle.

---

## Design system

- **Tokens:** `src/styles/theme.css` is the single source of truth — void surfaces, signal colours (`--neon` yellow, `--cyan`, `--magenta`), font families, fluid type scale (`text-mega` → `text-micro`), spacing and easing. The WebGL shader reads the same CSS variables at runtime, so changing a colour re-skins the city too.
- **Component classes:** `src/styles/globals.css` — `.shell`, `.grid-12`, `.btn` (chamfered; `.btn-solid` / `.btn-ink` / `.btn-ink-outline`), `.hud`, `.hud-frame`, `.chamfer`, `.glitch` (RGB-split via `data-text`), `.stroke`, `.tag`, `.pip`, `.caret`, `.scan-sweep`, CRT overlays (`.fx-scanlines`, `.fx-vignette`, `.fx-grain`) and the reticle cursor.
- **Motion:** `src/lib/animation.ts` registers GSAP plugins, the custom `servo` / `lock` eases and the scramble glyph set. `src/components/animations/Reveal.tsx` provides `Reveal` (flicker-in), `SplitReveal` (scattered char punch-in), `Decrypt` (glyph-scramble text) and `DrawOnScroll`. Everything animates *from* a visible state, so content is readable with JS or motion disabled.
- **Hero shader:** `src/components/fx/NeonCity.tsx` — one fragment shader (grid floor, two-layer procedural skyline, digital rain, chromatic aberration, block glitch). Mouse parallaxes the camera, scroll warps speed. Renders at reduced resolution, pauses off-screen, draws a single static frame under reduced motion, and falls back to a CSS gradient grid without WebGL or on context loss.
- **Smooth scroll:** `src/lib/smooth-scroll.tsx` runs Lenis on GSAP's ticker so ScrollTrigger and Lenis share one clock. It is disabled entirely under reduced motion.

## Motion, accessibility & fallbacks

- `prefers-reduced-motion` is respected everywhere; visitors can also toggle **Reduce motion** in the footer (stored per browser).
- The boot-sequence preloader plays once per session (replay from the footer), shows real readiness checks (fonts, document load, WebGL), and never blocks for more than ~4.2 s. **Skip intro** is focused on entry and Escape skips too.
- The hero shader pauses off-screen and in background tabs, caps device pixel ratio, and falls back to a CSS grid when WebGL is unavailable, fails or loses context.
- Pinned sections (hero warp, manifesto decrypt, horizontal work stream) only pin on wide screens with motion enabled; on phones they scroll normally, and the work stream becomes a vertical list.
- Keyboard: skip link, focus-trapped fullscreen menu (Escape closes), screenshot lightbox (native `<dialog>`), visible focus rings.
- The reticle cursor appears only for fine pointers and never replaces the system cursor. CRT overlays are decorative and never intercept input.

---

## Build & deploy

```bash
npm run build      # outputs dist/
npm run preview    # sanity-check the build at http://localhost:4173
```

This is a client-side routed SPA, so the host must rewrite unknown paths to `index.html`:

- **Vercel:** `vercel.json` is included (rewrites + long-cache headers for hashed assets). Import the repo, framework preset "Vite", build `npm run build`, output `dist`.
- **Netlify:** `public/_redirects` is included (`/* /index.html 200`). Build `npm run build`, publish `dist`.
- **Other static hosts:** configure an SPA fallback to `index.html`.

### Domain-dependent SEO

No production domain is assumed. Once you have one, set it at build time:

```bash
VITE_SITE_URL=https://your-domain.example npm run build
```

This makes `og:image`/`twitter:image` absolute, enables per-route `canonical` + `og:url`, and generates `dist/sitemap.xml` (referenced from `robots.txt`). See `.env.example`.

### Social image & icons

`public/og-image.png` (1200×630), `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`. The PNGs were rendered from `scripts/og/*.html`; edit those and re-render with any headless Chromium, e.g.:

```bash
msedge --headless=new --window-size=1200,630 --screenshot=public/og-image.png scripts/og/og.html
```

---

## Project structure

```
src/
  app/               App (router + providers), RootLayout, RouteError
  components/
    animations/      Reveal, SplitReveal, Decrypt, DrawOnScroll, Marquee
    fx/              NeonCity (raw WebGL hero shader)
    buttons/         Button, ButtonLink, ButtonAnchor, CopyButton, Magnetic
    layout/          Footer, Cursor, Seo, ErrorBoundary
    navigation/      Header, MenuOverlay, Monogram
    preloader/       Preloader + session state
    sections/        Home sections (Hero, Manifesto, SelectedWork, Profile), Stack, ContactCTA
    typography/      Eyebrow, SectionBar, SourceNote
  data/              All content (see "Editing content")
  hooks/             useMediaQuery, useLocalTime
  lib/               animation, motion-preferences, smooth-scroll, webgl, utils
  pages/             Home, About, Contact, NotFound
  styles/            theme.css (tokens), globals.css
  types/             Content types
public/              favicon, OG image, manifest, robots, resume/, work/ (screenshots)
scripts/             sitemap generator, OG/icon sources, screenshot redaction
```
