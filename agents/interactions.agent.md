# Interactions Agent

> Dual-purpose specification for AI agents and human developers

## Context

The megadev.ai website features a central interactive element: the whip weapon held by the megadev character. This whip represents the [claiw](https://github.com/sungchun12/claiw) CLI AI tool. The interactions should feel satisfying and purposeful—rewarding curiosity while guiding users to the tool's GitHub repository.

### Interaction Philosophy
- **Discoverable**: Visual affordances hint at interactivity
- **Responsive**: Immediate feedback on hover/focus
- **Purposeful**: Click action has a clear destination
- **Accessible**: Works with keyboard, mouse, and touch

---

## Inputs

| Dependency | Source | Purpose |
|------------|--------|---------|
| Whip element | Character Art Agent output | Target for interactions |
| Whip hitbox | Blueprint UI Agent | Positioned clickable area |
| Accent color | `#00D4FF` | Glow effect color |
| Target URL | `https://github.com/sungchun12/claiw` | Click destination |

---

## Objectives

### Primary Goals
1. **Hover Glow**: Whip glows cyan when hovered
2. **Click Navigation**: Clicking whip opens claiw GitHub repo
3. **Visual Feedback**: Clear state transitions (idle → hover → active)
4. **Accessibility**: Keyboard navigable, screen reader friendly

### Success Criteria
- [ ] Whip visibly glows on mouse hover
- [ ] Glow effect is smooth (not jarring)
- [ ] Clicking opens GitHub link (new tab)
- [ ] Tab key can focus the whip element
- [ ] Focus state matches hover glow
- [ ] Touch devices: tap activates link
- [ ] Cursor changes to pointer on hover

---

## Technical Specifications

### Interaction States

| State | Visual | Trigger |
|-------|--------|---------|
| Idle | Normal whip appearance | Default |
| Hover | Cyan glow, slight pulse | Mouse enter |
| Focus | Cyan glow (matches hover) | Tab/keyboard focus |
| Active | Intensified glow, brief | Mouse down / Enter key |
| Disabled | Dimmed (if ever needed) | N/A for MVP |

### Glow Effect Options

**Option A: CSS Filter + Box Shadow (Simple, performant)**

```css
.whip-interactive {
  transition: filter 0.3s ease, transform 0.3s ease;
  cursor: pointer;
}

.whip-interactive:hover,
.whip-interactive:focus {
  filter: drop-shadow(0 0 8px #00D4FF) 
          drop-shadow(0 0 16px #00D4FF) 
          drop-shadow(0 0 24px rgba(0, 212, 255, 0.5));
  transform: scale(1.02);
}

.whip-interactive:active {
  filter: drop-shadow(0 0 12px #00D4FF) 
          drop-shadow(0 0 24px #00D4FF) 
          drop-shadow(0 0 36px rgba(0, 212, 255, 0.7));
  transform: scale(1.01);
}
```

**Option B: SVG Filter (More control, complex glows)**

```svg
<defs>
  <filter id="whip-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="blur1"/>
    <feGaussianBlur stdDeviation="8" result="blur2"/>
    <feGaussianBlur stdDeviation="12" result="blur3"/>
    <feMerge>
      <feMergeNode in="blur3"/>
      <feMergeNode in="blur2"/>
      <feMergeNode in="blur1"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>

<!-- Apply to whip path -->
<path class="whip-path" filter="url(#whip-glow)" ... />
```

**Option C: Canvas/WebGL (Maximum control, animation-ready)**

For complex animated glows or particle effects, consider using:
- HTML Canvas with 2D context for simple glow animations
- Three.js or PixiJS for advanced effects
- Framer Motion for React-based animations

### Pulse Animation (Optional Enhancement)

```css
@keyframes glow-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 8px #00D4FF) 
            drop-shadow(0 0 16px #00D4FF);
  }
  50% {
    filter: drop-shadow(0 0 12px #00D4FF) 
            drop-shadow(0 0 24px #00D4FF)
            drop-shadow(0 0 32px rgba(0, 212, 255, 0.4));
  }
}

.whip-interactive:hover,
.whip-interactive:focus {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### Click Handler Implementation

**React Implementation:**

```tsx
// components/WhipInteractive.tsx
import { useCallback } from 'react';

interface WhipInteractiveProps {
  children: React.ReactNode;
  href?: string;
}

export function WhipInteractive({ 
  children, 
  href = 'https://github.com/sungchun12/claiw' 
}: WhipInteractiveProps) {
  
  const handleClick = useCallback(() => {
    window.open(href, '_blank', 'noopener,noreferrer');
  }, [href]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="whip-interactive"
      aria-label="Open claiw project on GitHub"
    >
      {children}
    </div>
  );
}
```

**Alternative: Native Anchor (if wrapping is acceptable)**

```tsx
<a 
  href="https://github.com/sungchun12/claiw"
  target="_blank"
  rel="noopener noreferrer"
  className="whip-interactive"
  aria-label="Open claiw - CLI AI Whip Tool on GitHub"
>
  <img src="/megadev-whip-element.svg" alt="" />
</a>
```

### Hitbox Positioning

The interactive area should be generous but not overwhelming:

```tsx
// Hitbox overlay approach
<div className="character-container relative">
  {/* Full character image */}
  <img src="/megadev-character-whip.svg" alt="Megadev" />
  
  {/* Whip hitbox - positioned over whip area */}
  <WhipInteractive>
    <div 
      className="whip-hitbox absolute"
      style={{
        // Adjust these values based on actual character art
        top: '20%',
        left: '10%',
        width: '60%',
        height: '50%',
        // Debug: uncomment to see hitbox
        // backgroundColor: 'rgba(255, 0, 0, 0.2)',
      }}
    />
  </WhipInteractive>
</div>
```

**Alternative: Image Map (for raster images)**

```html
<img src="/megadev-character-whip.webp" alt="Megadev" usemap="#whip-map" />
<map name="whip-map">
  <area 
    shape="poly" 
    coords="100,50,200,80,250,150,180,200,100,180"
    href="https://github.com/sungchun12/claiw"
    target="_blank"
    alt="claiw - CLI AI Whip Tool"
  />
</map>
```

### Cursor Feedback

```css
.whip-interactive {
  cursor: pointer;
}

/* Custom cursor option */
.whip-interactive {
  cursor: url('/cursors/whip-cursor.png'), pointer;
}
```

---

## Implementation Guidance

### Step 1: Basic Hover Effect

Start with the simplest implementation and enhance:

```css
/* styles/interactions.css */
.whip-interactive {
  /* Smooth transitions for all states */
  transition: 
    filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Clickable */
  cursor: pointer;
  
  /* Remove default focus outline, we'll add our own */
  outline: none;
}

.whip-interactive:hover {
  filter: drop-shadow(0 0 8px var(--color-accent-glow, #00D4FF)) 
          drop-shadow(0 0 20px var(--color-accent-glow, #00D4FF));
}

.whip-interactive:focus-visible {
  /* Match hover for keyboard users */
  filter: drop-shadow(0 0 8px var(--color-accent-glow, #00D4FF)) 
          drop-shadow(0 0 20px var(--color-accent-glow, #00D4FF));
}

.whip-interactive:active {
  transform: scale(0.98);
  filter: drop-shadow(0 0 12px var(--color-accent-glow, #00D4FF)) 
          drop-shadow(0 0 30px var(--color-accent-glow, #00D4FF));
}
```

### Step 2: React Component

```tsx
// components/InteractiveWhip.tsx
'use client'; // For Next.js App Router

import { useState } from 'react';
import styles from './InteractiveWhip.module.css';

const GITHUB_URL = 'https://github.com/sungchun12/claiw';

export function InteractiveWhip() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.container}>
      {/* Full character */}
      <img 
        src="/megadev-character-whip.svg" 
        alt="Megadev character"
        className={`${styles.character} ${isHovered ? styles.whipGlow : ''}`}
      />
      
      {/* Invisible hitbox over whip */}
      <button
        className={styles.hitbox}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-label="Visit claiw on GitHub - CLI AI Whip Tool"
      />
    </div>
  );
}
```

```css
/* InteractiveWhip.module.css */
.container {
  position: relative;
  display: inline-block;
}

.character {
  transition: filter 0.3s ease;
}

.whipGlow {
  filter: drop-shadow(0 0 8px #00D4FF) 
          drop-shadow(0 0 20px #00D4FF);
}

.hitbox {
  position: absolute;
  /* Position over whip area - adjust based on actual art */
  top: 15%;
  left: 5%;
  width: 70%;
  height: 55%;
  
  /* Invisible but clickable */
  background: transparent;
  border: none;
  cursor: pointer;
  
  /* Debug mode - uncomment to visualize */
  /* background: rgba(0, 212, 255, 0.2); */
}

.hitbox:focus-visible {
  outline: 2px solid #00D4FF;
  outline-offset: 4px;
}
```

### Step 3: Advanced Glow with Framer Motion (Optional)

```tsx
// components/InteractiveWhipAdvanced.tsx
'use client';

import { motion } from 'framer-motion';

const glowVariants = {
  idle: {
    filter: 'drop-shadow(0 0 0px #00D4FF)',
  },
  hover: {
    filter: [
      'drop-shadow(0 0 8px #00D4FF) drop-shadow(0 0 16px #00D4FF)',
      'drop-shadow(0 0 12px #00D4FF) drop-shadow(0 0 24px #00D4FF)',
      'drop-shadow(0 0 8px #00D4FF) drop-shadow(0 0 16px #00D4FF)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export function InteractiveWhipAdvanced() {
  return (
    <motion.div
      className="character-wrapper"
      initial="idle"
      whileHover="hover"
      whileFocus="hover"
      variants={glowVariants}
    >
      {/* ... rest of component */}
    </motion.div>
  );
}
```

### Step 4: Touch Device Handling

```tsx
// hooks/useInteraction.ts
import { useState, useCallback } from 'react';

export function useInteraction() {
  const [isActive, setIsActive] = useState(false);

  const handlers = {
    onMouseEnter: useCallback(() => setIsActive(true), []),
    onMouseLeave: useCallback(() => setIsActive(false), []),
    onFocus: useCallback(() => setIsActive(true), []),
    onBlur: useCallback(() => setIsActive(false), []),
    // Touch: activate briefly on touch start
    onTouchStart: useCallback(() => {
      setIsActive(true);
      // Auto-deactivate after brief highlight
      setTimeout(() => setIsActive(false), 150);
    }, []),
  };

  return { isActive, handlers };
}
```

---

## Verification Checklist

### Visual
- [ ] Glow is visible and cyan (#00D4FF)
- [ ] Transition is smooth (no flicker)
- [ ] Glow doesn't clip or overflow awkwardly
- [ ] Active state provides click feedback

### Functional
- [ ] Click opens correct GitHub URL
- [ ] Link opens in new tab
- [ ] rel="noopener noreferrer" is set
- [ ] No double navigation/glitches

### Accessibility
- [ ] Element is focusable via Tab
- [ ] Focus state visually matches hover
- [ ] Enter/Space triggers click
- [ ] aria-label describes the action
- [ ] Works with screen readers

### Performance
- [ ] No jank on hover transition
- [ ] Glow doesn't cause repaints of entire page
- [ ] Animation uses GPU-accelerated properties

### Cross-Browser
- [ ] Chrome: glow renders correctly
- [ ] Firefox: drop-shadow filter works
- [ ] Safari: no webkit-specific issues
- [ ] Mobile Safari: touch interactions work
- [ ] Mobile Chrome: tap feedback visible

---

## Testing Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Mouse hover over whip | Glow appears smoothly |
| Mouse leave whip | Glow fades out |
| Click on whip | New tab opens with GitHub |
| Tab to whip element | Focus ring + glow appears |
| Press Enter on focused whip | New tab opens with GitHub |
| Press Space on focused whip | New tab opens with GitHub |
| Touch on mobile | Brief highlight, then navigation |
| Hover over non-whip areas | No glow effect |

---

## Notes for Downstream Agents

- **Blueprint UI Agent**: Ensure `.whip-hitbox` positioning matches character art
- **Character Art Agent**: If whip is a separate SVG element, target it directly instead of using overlay
- **Deployment Agent**: Include any animation libraries (Framer Motion) in dependencies

