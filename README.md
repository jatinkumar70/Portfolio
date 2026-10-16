# Jatin Kumar — Portfolio

An editorial portfolio for **Jatin Kumar, Senior Frontend Engineer**: a drafting-studio preloader, a WebGL hero, a sticky stacking-card showcase of real project screenshots, a scroll-reactive toolkit marquee and GSAP scroll animation throughout.

**Stack:** Vite 8 · React 19 · TypeScript 6 (strict) · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, DrawSVG, MotionPath) · Lenis · Three.js + React Three Fiber + Drei · React Router 7 · Lucide icons. Fonts are self-hosted (Archivo, Inter, JetBrains Mono via Fontsource).

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
| `/`        | Home — hero, manifesto, selected work (`/#work`), toolkit, about teaser, contact invitation |
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

- **Tokens:** `src/styles/theme.css` is the single source of truth — palette (porcelain, ink, charcoal, muted, hairlines, one vermilion accent, status colours), font families, fluid type scale (`text-mega` → `text-micro`), spacing and easing. Swap the accent by changing `--accent` / `--accent-ink`. WebGL and canvas scenes read the same CSS variables at runtime.
- **Component classes:** `src/styles/globals.css` — `.shell`, `.grid-12`, `.btn`, `.tag`, `.eyebrow`, `.meta`, `.provenance`, `.ui-frame`, `.blueprint`, cursor, preloader/hero helpers.
- **Motion:** `src/lib/animation.ts` registers GSAP plugins and shared eases/breakpoints. `src/components/animations/Reveal.tsx` provides `Reveal`, `SplitReveal` and `DrawOnScroll`. Everything animates *from* a visible state, so content is readable with JS or motion disabled.
- **Smooth scroll:** `src/lib/smooth-scroll.tsx` runs Lenis on GSAP's ticker so ScrollTrigger and Lenis share one clock. It is disabled entirely under reduced motion.

## Motion, accessibility & fallbacks

- `prefers-reduced-motion` is respected everywhere; visitors can also toggle **Reduce motion** in the footer (stored per browser).
- The preloader plays once per session (replay from the footer), measures real readiness (fonts, document load, hero 3D chunk), and never blocks for more than ~4.2 s. A **Skip intro** button is focused on entry.
- The hero WebGL scene pauses off-screen and in background tabs, caps device pixel ratio, and falls back to an SVG axonometric drawing when WebGL is unavailable, fails or loses context.
- The sticky stacking work cards only run on wide screens with motion enabled; elsewhere they're a plain vertical list with entrance reveals.
- Keyboard: skip link, focus-trapped fullscreen menu (Escape closes), screenshot lightbox (native `<dialog>`), visible focus rings.
- Custom cursor appears only for fine pointers and never replaces the system cursor.

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
    3d/              HeroScene (R3F), HeroStage (fallback logic), HeroFallback (SVG)
    animations/      Reveal, SplitReveal, DrawOnScroll, Marquee, ScrambleText
    buttons/         Button, ButtonLink, ButtonAnchor, CopyButton, Magnetic
    layout/          Footer, Cursor, Seo, ErrorBoundary
    navigation/      Header, MenuOverlay, Monogram
    preloader/       Preloader + session state
    sections/        Home sections (Hero, Manifesto, SelectedWork, AboutTeaser), Stack, ContactCTA
    typography/      Eyebrow, ProvenanceBadge, Annotation
  data/              All content (see "Editing content")
  hooks/             useMediaQuery, useLocalTime
  lib/               animation, motion-preferences, smooth-scroll, webgl, utils
  pages/             Home, About, Contact, NotFound
  styles/            theme.css (tokens), globals.css
  types/             Content types
public/              favicon, OG image, manifest, robots, resume/, work/ (screenshots)
scripts/             sitemap generator, OG/icon sources, screenshot redaction
```
