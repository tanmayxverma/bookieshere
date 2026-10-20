# Bookie Design Tokens Reference — Editorial Ink

**Authority:** Stitch Project `17297096438450244819` and `docs/DESIGN.md`  
**Stylesheet:** `src/styles/tokens.css` & `src/index.css`

---

## 1. Color Tokens (CSS Variables)

### Light Mode
```css
:root {
  /* Surfaces */
  --desk-bg: #FBF8FC;                  /* Base ivory parchment canvas */
  --desk-card: #FFFFFF;                /* Crisp white paper container */
  --desk-subtle: #F6F2F7;              /* Soft shaded panel wash */
  --desk-dim: #DCD9DD;                 /* Recessed container */
  --desk-border: #E2DED8;              /* Hairline boundary 1px */
  --desk-border-subtle: rgba(15, 23, 42, 0.08);

  /* Typography Inks */
  --desk-ink: #1C1B1F;                 /* Jet black sumi ink */
  --desk-ink-muted: #49454E;           /* Archival charcoal secondary */
  --desk-ink-subtle: #7A757E;          /* Muted metadata */

  /* Accents */
  --desk-primary: #904A43;             /* Archival Indian ink crimson */
  --desk-primary-hover: #7E3E37;
  --desk-primary-fg: #FFFFFF;
  --desk-secondary: #F59E0B;           /* Warm Amber (Chai ☕) */
  --desk-secondary-hover: #D97706;
  --desk-secondary-fg: #FFFFFF;
  --desk-tertiary: #10B981;            /* Emerald Live Telemetry */
  --desk-tertiary-fg: #FFFFFF;
  --desk-destructive: #B91C1C;         /* Warning / Trap Crimson */
  --desk-destructive-fg: #FFFFFF;
  --desk-streak-pill: #0F172A;         /* Dark midnight streak capsule */
}
```

### Dark Mode
```css
.dark {
  /* Surfaces */
  --desk-bg: #0A0E17;                  /* Nocturnal void */
  --desk-card: #111726;                /* Layer 1 dark slate container */
  --desk-subtle: #182234;              /* Layer 2 elevated deck */
  --desk-border: #1E293B;              /* Hairline structural edge */
  --desk-border-subtle: rgba(255, 255, 255, 0.06);

  /* Typography Inks */
  --desk-ink: #F1F5F9;                 /* High contrast chalk typography */
  --desk-ink-muted: #94A3B8;           /* Cool slate secondary */
  --desk-ink-subtle: #64748B;          /* Muted timestamp/slugs */

  /* Accents */
  --desk-primary: #EF4444;             /* Crimson Beacon */
  --desk-primary-hover: #DC2626;
  --desk-primary-fg: #FFFFFF;
  --desk-secondary: #FBBF24;           /* Warm Amber */
  --desk-secondary-fg: #0F172A;
  --desk-tertiary: #34D399;            /* Laser emerald timer */
  --desk-destructive: #F87171;
  --desk-destructive-fg: #0A0E17;
  --desk-streak-pill: #1E293B;
}
```

---

## 2. Typography Tokens

All fonts are self-hosted via Fontsource packages:
- **`--font-display` / `--font-serif`**: `'Newsreader', Georgia, serif`
- **`--font-body` / `--font-sans`**: `'Plus Jakarta Sans', -apple-system, sans-serif`
- **`--font-mono`**: `'JetBrains Mono', monospace` with `font-variant-numeric: tabular-nums`

### Fluid Scale Definitions
- `text-display-xl`: `clamp(36px, 5.5vw, 64px)` (Hero H1)
- `text-display-lg`: `clamp(24px, 3.5vw, 36px)` (Section H2)
- `text-lead`: `clamp(15px, 1.8vw, 18px)` (Lead subhead)
- `text-overline`: `11px` (Category overline, mono, tracking-wider, uppercase)
- `text-telemetry`: `JetBrains Mono`, `tabular-nums`

---

## 3. Elevation & Radius Tokens

```css
:root {
  /* Hairline Border */
  --border-hairline: 1px solid var(--desk-border);

  /* Ambient Elevation Shadows */
  --shadow-ambient: 0 4px 24px -4px rgba(0, 0, 0, 0.04);
  --shadow-capsule: 0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-elevated: 0 12px 36px -6px rgba(15, 23, 42, 0.08);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 9999px;

  /* Motion Springs */
  --spring-critically-damped: cubic-bezier(0.25, 1, 0.5, 1);
  --motion-fast: 120ms;
  --motion-normal: 220ms;
}
```
