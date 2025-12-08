# Deployment Agent

> Dual-purpose specification for AI agents and human developers

## Context

The megadev.ai website needs to be deployed as a static or pre-rendered site on Hostinger. This is a single-page experience with no backend requirements—pure frontend with interactive elements. The site should load fast, be SEO-friendly (for the domain authority), and be simple to maintain.

### Deployment Target
- **Host**: Hostinger (shared hosting or Hostinger Website Builder hosting)
- **Type**: Static files (HTML, CSS, JS, assets)
- **Domain**: megadev.ai (already purchased)

---

## Inputs

| Dependency | Source | Purpose |
|------------|--------|---------|
| UI Components | Blueprint UI Agent | React components |
| Interactions | Interactions Agent | Event handlers, animations |
| Character Assets | Character Art Agent | Images/SVGs to include |
| Design specs | `design_brainstorm.md` | Requirements reference |

---

## Objectives

### Primary Goals
1. **Framework Selection**: Choose between Vite and Next.js
2. **Project Setup**: Initialize with correct configuration
3. **Static Export**: Configure for static HTML output
4. **Hostinger Deployment**: Document deployment process
5. **Build Optimization**: Minimize bundle size, optimize assets

### Success Criteria
- [ ] Project builds without errors
- [ ] Static export generates standalone HTML/CSS/JS
- [ ] All assets optimized (images, fonts)
- [ ] Site loads in under 3 seconds on 3G
- [ ] Deployment to Hostinger documented step-by-step
- [ ] No Python required (pure Node.js toolchain)

---

## Technical Specifications

### Framework Decision: Vite vs Next.js

| Factor | Vite + React | Next.js |
|--------|--------------|---------|
| **Complexity** | Simple, minimal config | More setup, more features |
| **Build Speed** | Very fast (esbuild) | Fast (SWC) |
| **Static Export** | Native (`vite build`) | Requires config (`output: 'export'`) |
| **Bundle Size** | Smaller baseline | Larger (RSC overhead) |
| **Hostinger Compat** | Excellent (pure static) | Good (with export) |
| **Future Needs** | Add manually | Built-in (API routes, SSR) |
| **Learning Curve** | Lower | Higher |

**Recommendation**: **Vite + React** for this project because:
- Single page, no routing needed
- No backend/API requirements
- Simpler deployment (just static files)
- Faster builds during development
- Smaller production bundle

If you anticipate adding blog posts, dynamic content, or API routes later, consider **Next.js** for its built-in features.

### Project Structure (Vite)

```
megadev-ai-website/
├── public/
│   ├── megadev-character-whip.svg
│   ├── megadev-character-whip@1x.webp
│   ├── megadev-character-whip@2x.webp
│   ├── fonts/
│   │   └── (self-hosted fonts if any)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── BlueprintBackground.tsx
│   │   ├── CharacterDisplay.tsx
│   │   ├── InteractiveWhip.tsx
│   │   ├── AnnotationPanel.tsx
│   │   └── Header.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── interactions.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### Dependencies

```json
{
  "name": "megadev-ai-website",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && echo 'Upload dist/ to Hostinger'"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Optional dependencies** (add if needed):
```json
{
  "framer-motion": "^10.16.0",  // For advanced animations
  "clsx": "^2.0.0"              // For conditional classes
}
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Build configuration for static export
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate single CSS file
    cssCodeSplit: false,
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    // Asset handling
    assetsInlineLimit: 4096, // Inline small assets as base64
    rollupOptions: {
      output: {
        // Predictable file names for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  
  // Base path (update if deploying to subdirectory)
  base: '/',
});
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### HTML Entry Point

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO -->
    <title>megadev.ai | Hyper-Leverage Tools & Skills</title>
    <meta name="description" content="Building tools best used by me, available to all. Tightly coupled to physical existence through local-first experiences." />
    
    <!-- Open Graph -->
    <meta property="og:title" content="megadev.ai" />
    <meta property="og:description" content="The age of guilds. Hyper-leverage tools and skills." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://megadev.ai" />
    <meta property="og:image" content="https://megadev.ai/og-image.png" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="megadev.ai" />
    <meta name="twitter:description" content="The age of guilds. Hyper-leverage tools and skills." />
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    
    <!-- Preload critical fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Implementation Guidance

### Step 1: Initialize Project

```bash
# Create new Vite project
npm create vite@latest megadev-ai-website -- --template react-ts

# Navigate and install
cd megadev-ai-website
npm install

# Start dev server
npm run dev
```

### Step 2: Add Configuration Files

Copy the `vite.config.ts`, `tsconfig.json`, and `index.html` from specs above.

### Step 3: Create Folder Structure

```bash
# Create directories
mkdir -p src/components src/styles public/fonts

# Create initial files
touch src/styles/globals.css
touch src/styles/variables.css
touch src/components/BlueprintBackground.tsx
```

### Step 4: Build for Production

```bash
# Build static files
npm run build

# Preview locally
npm run preview
```

This generates a `dist/` folder containing:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── (other assets)
└── (public folder contents)
```

### Step 5: Deploy to Hostinger

**Option A: File Manager Upload (Simplest)**

1. Log in to Hostinger hPanel
2. Navigate to **Files** → **File Manager**
3. Go to `public_html` directory
4. Delete existing files (if any)
5. Upload all contents of `dist/` folder
6. Ensure `index.html` is in root of `public_html`

**Option B: FTP Upload**

1. Get FTP credentials from Hostinger hPanel → **Files** → **FTP Accounts**
2. Use FTP client (FileZilla, Cyberduck):
   ```
   Host: ftp.megadev.ai (or IP from hPanel)
   Username: (from hPanel)
   Password: (from hPanel)
   Port: 21
   ```
3. Navigate to `public_html`
4. Upload contents of `dist/`

**Option C: Git Deployment (Advanced)**

1. In hPanel, go to **Advanced** → **Git**
2. Create repository linked to your GitHub
3. Configure build command: `npm run build`
4. Set public directory: `dist`

### Step 6: Configure Domain & SSL

1. In hPanel, go to **Domains** → **megadev.ai**
2. Ensure domain points to hosting
3. Go to **SSL** → **Install SSL**
4. Enable **Force HTTPS**

---

## Build Optimization Checklist

### Images

```bash
# Optimize with sharp or squoosh
npx @squoosh/cli --webp '{"quality":80}' public/*.png

# Or use vite-imagetools plugin
npm install -D vite-imagetools
```

### Fonts

**Self-hosting (recommended for performance)**:
```bash
# Download from Google Fonts
# Place in public/fonts/
# Reference in CSS:
@font-face {
  font-family: 'IBM Plex Mono';
  src: url('/fonts/IBMPlexMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Code Splitting (if app grows)

```typescript
// Lazy load non-critical components
const AnnotationPanel = lazy(() => import('./components/AnnotationPanel'));
```

### Bundle Analysis

```bash
# Add to package.json scripts
"analyze": "vite build && npx vite-bundle-visualizer"

# Or install plugin
npm install -D rollup-plugin-visualizer
```

---

## Alternative: Next.js Setup

If you choose Next.js instead:

```bash
# Create Next.js app
npx create-next-app@latest megadev-ai-website --typescript --tailwind --app

# Configure for static export
# next.config.js
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
};

# Build
npm run build

# Output is in 'out/' folder instead of 'dist/'
```

---

## Verification Checklist

### Build
- [ ] `npm run build` completes without errors
- [ ] `dist/` folder is generated
- [ ] `index.html` exists in `dist/`
- [ ] All assets are in `dist/assets/`

### Performance
- [ ] JavaScript bundle < 100KB gzipped
- [ ] CSS < 20KB gzipped
- [ ] Images optimized (WebP format)
- [ ] Fonts subset or using `font-display: swap`

### Deployment
- [ ] Files uploaded to Hostinger `public_html`
- [ ] Site accessible at megadev.ai
- [ ] HTTPS working (green padlock)
- [ ] No mixed content warnings

### SEO
- [ ] Title tag present and descriptive
- [ ] Meta description set
- [ ] Open Graph tags for social sharing
- [ ] `robots.txt` allows indexing (default)

### Functionality
- [ ] Site loads completely
- [ ] Character image displays
- [ ] Whip hover effect works
- [ ] Whip click opens GitHub link
- [ ] No console errors

---

## Maintenance Notes

### Updating the Site

1. Make changes locally
2. Run `npm run build`
3. Upload `dist/` contents to Hostinger
4. Clear browser cache or wait for CDN propagation

### Adding Analytics (Optional)

```html
<!-- In index.html, before closing </head> -->
<!-- Plausible (privacy-friendly) -->
<script defer data-domain="megadev.ai" src="https://plausible.io/js/script.js"></script>

<!-- Or Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Future Enhancements

- **Blog**: Consider migrating to Astro or Next.js
- **CMS**: Add Notion/Markdown-based content
- **API**: Add serverless functions (Vercel, Netlify)

---

## Notes for Other Agents

- **Character Art Agent**: Place final assets in `public/` directory
- **Blueprint UI Agent**: CSS should be in `src/styles/`
- **Interactions Agent**: Components go in `src/components/`

