# Blueprint UI Agent

> Dual-purpose specification for AI agents and human developers

## Context

The megadev.ai website uses a blueprint/technical schematic aesthetic inspired by [Maxime Heckel's portfolio](https://maximeheckel.com/). This creates a unique visual identity that bridges technical precision with artistic expression—fitting for a "megadev" persona that emphasizes hyper-leverage tools and skills.

The entire experience lives in a single viewport with no scrolling, presenting the megadev character as a technical blueprint with annotated tools.

### Visual Reference
- **Primary Inspiration**: `images/blueprint_example.png` - Maxime Heckel's site showing:
  - Deep blue background with subtle grid
  - Technical annotations with coordinates/metadata
  - Floating 3D-ish elements on the blueprint plane
  - Elegant serif + monospace typography combination

---

## Inputs

| Asset | Value/Path | Purpose |
|-------|------------|---------|
| Background color | `#0047AB` | Cobalt blue base |
| Character art | Output from Character Art Agent | Central visual element |
| Grid pattern | Generated via CSS/SVG | Blueprint aesthetic |
| Font: Display | Custom or Google Fonts | Headlines, branding |
| Font: Technical | Monospace family | Annotations, specs |

---

## Objectives

### Primary Goals
1. **Blueprint Background**: Deep blue with subtle grid lines
2. **Single Viewport**: Everything visible without scrolling (100vh)
3. **Character Positioning**: Megadev character as hero element
4. **Technical Annotations**: Blueprint-style labels for the whip tool
5. **Responsive Awareness**: Graceful adaptation to different viewports

### Success Criteria
- [ ] Background matches #0047AB with visible grid pattern
- [ ] Page fits 100vh on common desktop/laptop viewports
- [ ] Character is prominently displayed and balanced
- [ ] Whip annotation is clearly readable
- [ ] Typography feels technical yet elegant
- [ ] Mobile has a reasonable fallback (even if simplified)

---

## Technical Specifications

### Color System

```css
:root {
  /* Primary Blues */
  --color-bg-primary: #0047AB;      /* Cobalt blue - main background */
  --color-bg-deep: #001F54;         /* Navy - depth/shadows */
  --color-bg-surface: #0052CC;      /* Lighter blue - cards/panels */
  
  /* Grid & Lines */
  --color-grid: rgba(255, 255, 255, 0.08);  /* Subtle white grid */
  --color-grid-major: rgba(255, 255, 255, 0.15);  /* Major grid lines */
  --color-line-annotation: rgba(255, 255, 255, 0.4);  /* Annotation lines */
  
  /* Text */
  --color-text-primary: #FFFFFF;    /* Main text */
  --color-text-secondary: rgba(255, 255, 255, 0.7);  /* Subdued text */
  --color-text-annotation: #00D4FF; /* Cyan for technical labels */
  
  /* Accents */
  --color-accent-glow: #00D4FF;     /* Cyan glow effects */
  --color-accent-highlight: #4DA6FF; /* Lighter blue highlights */
}
```

### Typography

**Recommended Font Pairings:**

| Role | Font Options | Fallback |
|------|--------------|----------|
| Display/Hero | Playfair Display, Cormorant Garamond | Georgia, serif |
| Body | Source Sans Pro, IBM Plex Sans | system-ui, sans-serif |
| Technical/Code | JetBrains Mono, IBM Plex Mono, Fira Code | monospace |
| Blueprint Labels | Archivo Narrow, Oswald | sans-serif condensed |

```css
:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-label: 'Archivo Narrow', 'Arial Narrow', sans-serif;
}
```

### Grid Pattern Implementation

**Option A: CSS Background (Recommended for performance)**

```css
.blueprint-bg {
  background-color: var(--color-bg-primary);
  background-image: 
    /* Minor grid */
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px),
    /* Major grid every 5th line */
    linear-gradient(var(--color-grid-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid-major) 1px, transparent 1px);
  background-size: 
    20px 20px,    /* Minor grid */
    20px 20px,
    100px 100px,  /* Major grid */
    100px 100px;
  background-position: center center;
}
```

**Option B: SVG Pattern (More control, animation-ready)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <defs>
    <pattern id="blueprint-grid" patternUnits="userSpaceOnUse" width="100" height="100">
      <!-- Minor grid -->
      <path d="M 20 0 L 20 100 M 40 0 L 40 100 M 60 0 L 60 100 M 80 0 L 80 100" 
            stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
      <path d="M 0 20 L 100 20 M 0 40 L 100 40 M 0 60 L 100 60 M 0 80 L 100 80" 
            stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
      <!-- Major grid -->
      <rect width="100" height="100" fill="none" 
            stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#blueprint-grid)"/>
</svg>
```

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                        HEADER                                │ │
│  │                     "megadev.ai"                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│    ┌────────────────────┐     ┌─────────────────────────────┐   │
│    │                    │     │  ANNOTATION PANEL           │   │
│    │                    │     │  ┌─────────────────────┐    │   │
│    │    CHARACTER       │─────│  │ claiw               │    │   │
│    │    ARTWORK         │     │  │ CLI AI Whip         │    │   │
│    │                    │     │  │ ──────────────────  │    │   │
│    │    [WHIP]──────────│─────│  │ Crack through CLI   │    │   │
│    │                    │     │  │ with AI precision   │    │   │
│    └────────────────────┘     │  └─────────────────────┘    │   │
│                               └─────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                        FOOTER (optional)                     │ │
│  │                     coordinates / metadata                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Component Structure (React)

```tsx
// App.tsx or page.tsx
<main className="blueprint-bg min-h-screen h-screen overflow-hidden">
  <Header />
  
  <div className="hero-container">
    <CharacterDisplay />
    <AnnotationPanel 
      target="whip"
      title="claiw"
      description="CLI AI Whip Tool"
      link="https://github.com/sungchun12/claiw"
    />
  </div>
  
  <BlueprintCoordinates />
</main>
```

### Blueprint Annotation Component

```tsx
interface AnnotationProps {
  title: string;
  subtitle?: string;
  description: string;
  link?: string;
  position: 'left' | 'right';
}

// Visual structure:
// ────────┬─────────────────────
//         │  TITLE
//         │  subtitle
//         │  ─────────────────
//         │  Description text
//         │  that explains the
//         │  tool's purpose
// ────────┴─────────────────────
```

**Annotation Styling:**
```css
.annotation {
  font-family: var(--font-mono);
  color: var(--color-text-annotation);
  border-left: 2px solid var(--color-line-annotation);
  padding-left: 1rem;
}

.annotation-title {
  font-family: var(--font-label);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.annotation-line {
  stroke: var(--color-line-annotation);
  stroke-dasharray: 4 2;
}
```

### Responsive Considerations

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Full layout as designed |
| Tablet (768-1023px) | Stack annotation below/beside character |
| Mobile (<768px) | Simplified: character focus, tap for annotation |

```css
/* Prevent scroll on desktop */
@media (min-width: 1024px) {
  body {
    overflow: hidden;
    height: 100vh;
  }
}

/* Allow scroll on mobile if needed */
@media (max-width: 1023px) {
  body {
    overflow-y: auto;
    min-height: 100vh;
  }
}
```

---

## Implementation Guidance

### Step 1: Base Layout

```tsx
// globals.css or tailwind config
@layer base {
  html, body {
    margin: 0;
    padding: 0;
    background-color: #0047AB;
  }
}

// Layout component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="blueprint-bg antialiased">
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Grid Background

Create a reusable background component or apply directly to body:

```tsx
// components/BlueprintBackground.tsx
export function BlueprintBackground() {
  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{
        backgroundColor: '#0047AB',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px'
      }}
    />
  );
}
```

### Step 3: Typography Setup

```tsx
// app/layout.tsx (Next.js) or main.tsx (Vite)
import { Playfair_Display, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-display'
});

const plexMono = IBM_Plex_Mono({ 
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono'
});

const plexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body'
});
```

### Step 4: Character Positioning

```tsx
// components/CharacterDisplay.tsx
export function CharacterDisplay() {
  return (
    <div className="relative">
      {/* Character image */}
      <img 
        src="/megadev-character-whip.svg"
        alt="Megadev character with whip"
        className="character-image"
      />
      
      {/* Whip hitbox for interactions */}
      <div 
        className="whip-hitbox absolute"
        data-interactive="whip"
        aria-label="claiw - CLI AI Whip Tool"
      />
    </div>
  );
}
```

---

## Verification Checklist

### Visual
- [ ] Background is exactly #0047AB
- [ ] Grid lines are visible but subtle
- [ ] Typography hierarchy is clear
- [ ] Character is well-positioned and prominent
- [ ] Annotation connects visually to whip element

### Technical
- [ ] No horizontal or vertical scroll on desktop (1024px+)
- [ ] Fonts load correctly (check Network tab)
- [ ] CSS variables are defined and used consistently
- [ ] Layout doesn't break at common breakpoints

### Performance
- [ ] Grid implemented efficiently (CSS over heavy SVG)
- [ ] Fonts subset to reduce load
- [ ] No layout shift on load (CLS score)

### Accessibility
- [ ] Sufficient color contrast for text (WCAG AA)
- [ ] Focus states visible on interactive elements
- [ ] Semantic HTML structure

---

## Notes for Downstream Agents

- **Interactions Agent**: Needs `.whip-hitbox` element positioned correctly for hover effects
- **Deployment Agent**: Ensure fonts are included in build or loaded from CDN
- **Character Art Agent**: Final asset path should match what's referenced here

