# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

megadev.ai is a single-page portfolio/landing page showcasing the "megadev" identity. Features an interactive 3D character wielding a whip (representing the [claiw](https://github.com/sungchun12/claiw) CLI AI tool) on a blueprint-themed interface.

## Development Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite production build → /dist
npm run preview      # Preview production build locally
npm run test         # Run Vitest in watch mode
npm run test:run     # Single test run (CI mode)
npm run test:coverage # Generate coverage report
```

## Tech Stack

- **Framework**: React 18 + TypeScript (strict mode)
- **Build**: Vite 6 with Terser minification, gzip/brotli compression
- **3D**: Three.js + React Three Fiber + @react-three/drei
- **Styling**: Pure CSS with CSS variables (no Tailwind)
- **Testing**: Vitest + React Testing Library + jsdom
- **Deployment**: Static files to Hostinger

## Architecture

### Component Hierarchy

```
App.tsx
├── BlueprintBackground (fixed, z-index: -3) - CSS grid pattern
├── ShaderBackground (fixed, z-index: 1) - WebGL animated noise
├── BlueprintSketches - Decorative SVG elements
├── BlueprintCoordinates - Blueprint coordinate labels
├── Header - "megadev.ai" title
├── CharacterDisplay
│   └── Whip3D (lazy-loaded) - 3D character with interactive whip
├── AnnotationPanel - Blueprint-style popup
├── ScrollIndicator
└── Essay - Second viewport content section
```

### Key Patterns

**Lazy Loading**: `Whip3D` is lazy-loaded via React Suspense to defer the ~300KB Three.js bundle.

**CSS Variables**: All styling uses variables from `src/styles/variables.css`:
- Colors: `--color-bg-primary`, `--color-accent-glow`, etc.
- Fonts: Orbitron (display), Exo 2 (body), Space Mono (code)
- Spacing: `--spacing-xs` through `--spacing-xl`

**Z-Index Layers**:
- -3: BlueprintBackground
- 1: ShaderBackground
- 2: Content
- 10: ScrollIndicator

### Key Components

- `src/components/Whip3D.tsx` (637 lines) - Main 3D component with Three.js. Consider splitting if modifying extensively.
- `src/components/ShaderBackground.tsx` - WebGL fragment shader for animated background
- `src/styles/variables.css` - All design tokens

## Reference Documentation

### Agent Specifications (`/agents/`)

Detailed specs for Claude instances working on specific areas:
- `blueprint-ui.agent.md` - UI aesthetic, color system, grid pattern
- `character-art.agent.md` - Character transformation specs
- `interactions.agent.md` - Hover effects, click handlers, accessibility
- `deployment.agent.md` - Build optimization, Hostinger deployment

### Cursor Rules (`/.cursor/rules/`)

Pattern compliance:
- `project-context.mdc` - Vision, tech stack, code style
- `ui-patterns.mdc` - Color system, typography, layout rules
- `interactions.mdc` - Whip interactions, accessibility requirements

## Design System

**Color Palette** (blueprint aesthetic):
```
--color-bg-primary: #0047AB  (Cobalt blue)
--color-accent-glow: #00D4FF (Cyan - interactive elements)
--color-text-primary: #FFFFFF
```

**Blueprint Grid**: Dual-layer CSS gradients (20px minor + 100px major)

**Responsive**: Desktop (≥1024px) no scroll; Mobile (<768px) column layout

## Accessibility Requirements

- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Space, Escape)
- Focus states match hover styling
- Semantic HTML (header, main, section)

## Testing

- Test files: `src/__tests__/*.test.{ts,tsx}`
- Setup mocks: `src/__tests__/setup.ts` (ResizeObserver, IntersectionObserver, matchMedia)
- Current coverage: ~56% (aim for 80%+)

## External Link Pattern

Always use `noopener,noreferrer` for security:
```tsx
window.open(url, '_blank', 'noopener,noreferrer');
// or
<a href={url} target="_blank" rel="noopener noreferrer">
```

## Improvement Roadmap

See `plan.md` for prioritized improvements including SEO, performance, and developer experience enhancements.
