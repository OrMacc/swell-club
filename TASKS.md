# Swell Redesign — Implementation Tasks

## Decision: Full Rebuild

The current implementation is a decent prototype but needs fundamental changes to achieve ZettaJoule-level polish. Rebuilding from scratch is cleaner than patching.

## Architecture

- **HTML**: Semantic, RTL, minimal markup
- **CSS**: Custom properties system, fluid typography (clamp), architectural spacing
- **JS**: GSAP 3 + ScrollTrigger (CDN) + Lenis smooth scroll
- **No build tools** — single page, CDN dependencies

## Design Pillars (from ZettaJoule inspiration)

1. Butter-smooth scrolling (Lenis)
2. Scroll-triggered reveals with GSAP (not basic IntersectionObserver)
3. Elegant page-load sequence (minimal, not heavy grid shutter)
4. Signature sticky section with scroll-driven state changes
5. Generous architectural whitespace
6. Refined typography hierarchy (thin weights, tight leading on headlines)
7. Wave SVG as subtle connecting motif
8. Hide/show navbar on scroll direction
9. Smooth dark/light section transitions
10. Professional micro-interactions (hover states, button animations)

## Color Palette (refined)

```
--canvas:       hsl(40 18% 95%)      /* warm off-white */
--canvas-alt:   hsl(38 14% 92%)      /* slightly warmer for contrast sections */
--ink:          hsl(200 35% 12%)     /* deep blue-black */
--ink-soft:     hsl(198 15% 40%)     /* muted text */
--mist:         hsl(200 25% 72%)     /* sea blue, soft */
--sand:         hsl(35 22% 88%)      /* warm sand for join section */
--night:        hsl(202 40% 10%)     /* dark sections */
--foam:         hsl(42 28% 95%)      /* light text on dark */
--line:         hsl(200 12% 60%/.3)  /* subtle borders */
```

## Typography System

- Headlines: Noto Sans Hebrew 200, tight letter-spacing (-.06em), tight line-height (.85-.9)
- Body: Noto Sans Hebrew 300-400, generous line-height (1.65)
- Latin/numbers: Inter 300-400
- Fluid scale: clamp() for all sizes
- Hero: clamp(4.5rem, 11vw, 12rem)
- Section headings: clamp(3rem, 7vw, 8rem)
- Body: clamp(1rem, 1.2vw, 1.15rem)

## Tasks

### Task 1: index.html — New structure
- Clean semantic HTML
- Sections: intro-overlay, hero, manifesto, morning-sticky, quiet-moment, join, footer
- Minimal attributes for GSAP targeting (data-* attributes)
- GSAP + Lenis CDN links
- Preconnect for fonts

### Task 2: styles.css — Complete design system
- CSS custom properties (colors, spacing, typography, easing)
- Reset + base styles
- Header/nav (fixed, hide/show ready)
- Hero section (full viewport, massive type)
- Manifesto section (scattered text, asymmetric grid)
- Morning sticky scene (wireframe aesthetic)
- Dark transition section
- Join/form section
- Footer
- Responsive (mobile-first breakpoints)
- Reduced motion support
- Smooth transitions between dark/light sections

### Task 3: script.js — Animation engine
- Lenis smooth scroll initialization
- GSAP ScrollTrigger setup
- Page load sequence (fade in wordmark, reveal hero text)
- Hero parallax on scroll
- Text reveal animations (staggered, per-line)
- Morning sticky scene (pin + state transitions)
- Dark section color transitions
- Navbar hide/show logic
- Wave SVG subtle animation
- Form interaction
- Performance: RAF loop tied to Lenis
- Reduced motion: skip all scroll-driven animation

## Execution Order

1. HTML structure first (skeleton)
2. CSS design system (visual foundation)
3. JavaScript animation layer (bring it to life)
4. Verify in browser

## Quality Bar

- Feels like a premium architecture studio website
- Every transition is intentional and smooth
- Typography creates visual rhythm through weight and spacing
- Whitespace is generous — never cramped
- Mobile is a graceful simplification, not a broken desktop
- No jank, no layout shifts, butter-smooth 60fps
