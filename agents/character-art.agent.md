# Character Art Agent

> Dual-purpose specification for AI agents and human developers

## Context

The megadev.ai website features a custom character based on Zero from Mega Man, transformed into a unique "megadev" persona. This character represents the fusion of technical prowess and personal brand identity. The source material uses red as the primary color with flowing blonde hair—we need to transform this into a blue-themed, hairless variant that fits the blueprint aesthetic.

### Source Material
- **Primary Reference**: `images/whip.webp` - Zero wielding a chain whip in dynamic pose
- **Secondary References**: 
  - `images/arms_crossed.webp` - Defensive stance with shield
  - `images/sword_in_motion.webp` - Action pose with blade
  - `images/face_forward.jpeg` - Portrait/face detail

### Brand Connection
The whip weapon connects to the [claiw project](https://github.com/sungchun12/claiw) - a CLI AI tool. The character art should feel like a technical blueprint schematic while maintaining the dynamic energy of the original artwork.

---

## Inputs

| Asset | Path | Purpose |
|-------|------|---------|
| Whip pose | `images/whip.webp` | Primary character pose for website |
| Blueprint example | `images/blueprint_example.png` | Visual style reference |
| Color reference | `#0047AB` | Cobalt blue - primary brand color |

---

## Objectives

### Primary Goals
1. **Recolor**: Transform all red elements to blue (#0047AB and complementary shades)
2. **Remove Hair**: Eliminate the blonde flowing hair, creating a sleek helmeted look
3. **Maintain Energy**: Preserve the dynamic pose and action feel of the original
4. **Blueprint Integration**: Style should feel like a technical schematic/blueprint

### Success Criteria
- [ ] All red armor pieces converted to blue palette
- [ ] Hair completely removed with clean helmet silhouette
- [ ] Character reads clearly on #0047AB background
- [ ] Whip weapon remains prominent and identifiable
- [ ] Output suitable for web (optimized file size, crisp at 1x and 2x)

---

## Technical Specifications

### Color Palette Transformation

| Original | Target | Usage |
|----------|--------|-------|
| Red (`#FF0000` area) | Cobalt Blue `#0047AB` | Primary armor |
| Dark Red/Maroon | Navy `#001F54` | Shadows, depth |
| Red highlights | Cyan `#00D4FF` | Energy effects, highlights |
| Orange/Yellow (hair) | Remove entirely | N/A |
| Purple/Dark Blue | Keep or shift cooler | Secondary armor |
| Cyan (whip energy) | Keep `#00D4FF` | Whip glow effect |

### Hair Removal Approach
1. Identify the helmet boundary beneath the hair
2. Extend helmet geometry to create clean silhouette
3. Options:
   - **Clean dome**: Smooth rounded helmet top
   - **Angular**: Sharp geometric helmet design
   - **Finned**: Small aerodynamic fins (maintains some visual interest)

### Output Formats

| Format | Resolution | Use Case |
|--------|------------|----------|
| SVG | Vector | Preferred - scalable, animatable |
| WebP | 800x1000 @1x | Fallback raster |
| WebP | 1600x2000 @2x | Retina displays |
| PNG | 800x1000 | Legacy browser fallback |

### Blueprint Annotation Zone
Reserve clear space around the whip weapon for blueprint-style annotations:
```
                    ┌─────────────────────┐
                    │  ANNOTATION ZONE    │
                    │  "claiw"            │
                    │  CLI AI Whip Tool   │
    [WHIP]──────────┤  v1.0.0             │
                    │  github.com/...     │
                    └─────────────────────┘
```

---

## Implementation Guidance

### For AI Image Generation Tools

**Prompt framework**:
```
A futuristic robot warrior in dynamic pose wielding an energy chain whip, 
cobalt blue (#0047AB) armor, no hair, sleek helmet design, 
blueprint/technical schematic aesthetic, 
clean lines, high contrast against blue background,
retro video game art style similar to Mega Man Zero series,
2D illustration, vector art quality
```

**Negative prompts**:
```
hair, flowing hair, blonde, red armor, red colors, 
3D render, photorealistic, busy background
```

### For Manual Editing (Photoshop/GIMP/Figma)

1. **Layer Setup**
   - Duplicate original as reference layer (hidden)
   - Create adjustment layers for color transformation
   - Separate whip to its own layer for interaction effects

2. **Color Replacement Workflow**
   ```
   1. Select red regions (Color Range or Magic Wand)
   2. Apply Hue/Saturation adjustment
      - Hue: Shift red → blue (~180° rotation)
      - Saturation: Adjust to match cobalt intensity
   3. Fine-tune with Selective Color for shadows/highlights
   ```

3. **Hair Removal Workflow**
   ```
   1. Use Pen Tool to trace helmet boundary
   2. Content-Aware Fill or manual painting for helmet extension
   3. Add subtle gradient/shading for depth
   4. Consider adding small design elements (vents, seams)
   ```

### For Vector Conversion

If creating SVG from raster:
1. Use **Image Trace** (Illustrator) or **Trace Bitmap** (Inkscape)
2. Settings: High fidelity, limited colors (8-16)
3. Manual cleanup of paths for animation-ready output
4. Separate whip path for CSS/JS animation targeting

---

## Verification Checklist

### Visual Quality
- [ ] Character silhouette is clear and recognizable
- [ ] Blue tones are consistent across all armor pieces
- [ ] No red/orange remnants visible
- [ ] Hair is cleanly removed (no artifacts)
- [ ] Whip weapon is prominent and well-defined

### Technical Quality
- [ ] SVG file is under 100KB (optimized)
- [ ] Raster exports are crisp at intended display size
- [ ] Transparent background (PNG/WebP) or isolated for compositing
- [ ] Colors match brand palette exactly

### Integration Ready
- [ ] Whip element can be targeted separately (for hover effects)
- [ ] Annotation space is preserved
- [ ] Asset works on #0047AB background
- [ ] Exports named consistently: `megadev-character-[variant].[format]`

---

## Asset Naming Convention

```
megadev-character-whip.svg          # Primary SVG
megadev-character-whip@1x.webp      # Standard resolution
megadev-character-whip@2x.webp      # Retina resolution
megadev-character-whip.png          # Fallback
megadev-whip-element.svg            # Isolated whip for animations
```

---

## Notes for Downstream Agents

- **Blueprint UI Agent**: Will need final character asset path for positioning
- **Interactions Agent**: Requires isolated whip element for hover/glow effects
- **Deployment Agent**: All assets should be in `public/` or `assets/` directory

