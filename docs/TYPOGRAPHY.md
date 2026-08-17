# Space DS · Typography Governance

> **Stack:** Next.js App Router · TypeScript · Tailwind CSS v4  
> **Theme:** Space (dark)  
> **Core:** 2.0 · **Last updated:** 2026-08-17

---

## Font families

| Role | Variable | Stack | Loaded via |
|------|----------|-------|------------|
| Display / Title | `--font-display` → `--font-metropolis` | Metropolis, sans-serif | `next/font/local` in `layout.tsx` |
| Body | `--font-body` | Inter, sans-serif | Google Fonts (Inter 400) |
| Mono / code / data | `--font-mono` | IBM Plex Mono, monospace | Google Fonts (IBM Plex Mono 500) |

**Weights in use:**

| Font | Weight | CSS value |
|------|--------|-----------|
| Metropolis Medium | Title text | `font-weight: 500` |
| Metropolis SemiBold | Display / hero | `font-weight: 600` |
| Inter Regular | Body copy | `font-weight: 400` |
| IBM Plex Mono Medium | Code, data labels | `font-weight: 500` |

---

## Type scale — Space DS tokens

All sizes are on-token. Do not use sizes not listed here.

### Display (Metropolis SemiBold 600)

| Token | Size | Line height | Letter spacing | Usage |
|-------|------|-------------|----------------|-------|
| Display/sm | 30px | 1.35 | −0.45px | — |
| Display/md | 54px | 1.20 | −1.10px | — |
| Display/lg | 84px | 1.05 | −2.10px | Hero headline (≥1280px) |

### Title (Metropolis SemiBold 600)

| Token | Size | Line height | Letter spacing | Usage |
|-------|------|-------------|----------------|-------|
| Title/sm | 15px | 1.50 | −0.10px | — |
| Title/md | 18px | 1.50 | −0.10px | — |
| Title/lg | 24px | 1.45 | −0.20px | Card headings (mobile) |
| Title/1xl | 30px | 1.35 | −0.45px | Hero (mobile), section h2 (sm) |
| Title/2xl | 54px | 1.20 | −1.10px | Section h2 (≥1024px) |
| Title/3xl | 84px | 1.05 | −2.10px | Hero headline (≥1280px) |

### Body (Inter Regular 400)

| Token | Size | Line height | Letter spacing | Usage |
|-------|------|-------------|----------------|-------|
| Body/sm | 15px | 1.62 | 0 | Small labels, nav links (mobile) |
| Body/md | 18px | 1.62 | −0.10px | Default body copy, nav links |
| Body/lg | 24px | 1.62 | −0.10px | Statement text (≥1024px) |
| Body/1xl | 30px | 1.50 | −0.20px | Statement text (≥1024px) |

### Mono / Eye Brow (IBM Plex Mono Medium 500)

| Token | Size | Line height | Letter spacing | Usage |
|-------|------|-------------|----------------|-------|
| Mono/sm | 15px | 1.50 | +0.30px | Eye Brow labels — always uppercase |
| Mono/md | 18px | 1.50 | +0.30px | — |

---

## Responsive type classes

Defined inside a JSX `<style>` tag in `app/page.tsx`.  
**Why JSX `<style>`, not `globals.css`?** Tailwind v4's content scanner silently drops custom CSS class rules from `globals.css` that it cannot find as literal strings in JS source. Only `:root`, element selectors, `@font-face`, and `@theme inline` blocks survive in `globals.css`. All component-specific CSS classes must live in a JSX `<style>` tag to bypass PostCSS processing.

### `.type-hero`

Hero headline (page H1).

```
mobile  (default): 30px · lh 1.35 · ls −0.45px · Metropolis 600
sm ≥640px:         54px · lh 1.20 · ls −1.10px
xl ≥1280px:        84px · lh 1.05 · ls −2.10px
```

### `.type-section-h2`

Section headings (Offerings, Clients, Believe, etc.).

```
mobile  (default): 24px · lh 1.45 · ls −0.20px · Metropolis 600
sm ≥640px:         30px · lh 1.35 · ls −0.45px
lg ≥1024px:        54px · lh 1.20 · ls −1.10px
```

### `.type-offering-h3`

Card headings inside OfferingCard.

```
mobile  (default): 18px · lh 1.50 · ls −0.10px · Metropolis 600
sm ≥640px:         24px · lh 1.45 · ls −0.20px
lg ≥1024px:        30px · lh 1.35 · ls −0.45px
```

### `.type-card-h3`

Generic card headings (clients, team, etc.).

```
mobile  (default): 18px · lh 1.50 · ls −0.10px · Metropolis 600
sm ≥640px:         24px · lh 1.45 · ls −0.20px
```

### `.type-statement`

Believe statement / large body pull quote.

```
mobile  (default): 18px · lh 1.62 · ls −0.10px · Inter 400
lg ≥1024px:        30px · lh 1.50 · ls −0.20px
```

### `.type-body`

Default body copy.

```
mobile  (default): 15px · lh 1.62 · ls 0 · Inter 400
sm ≥640px:         18px · lh 1.62 · ls −0.10px
```

### `.type-eyebrow`

Eye Brow / section labels. **Always uppercase. Fixed size — never scales.**

```
all breakpoints: 15px · lh 1.50 · ls +0.30px · IBM Plex Mono 500 · uppercase
```

---

## Color tokens for text

| Token | Value | Use |
|-------|-------|-----|
| `--foreground` / `--neutral-600` | `#fbfbfb` (100%) | Headlines, primary text |
| `--text-muted` / `--neutral-t-400` | `rgba(251,251,251,0.74)` | Nav links default, card titles |
| `--text-subtle` / `--neutral-t-300` | `rgba(251,251,251,0.52)` | Body copy in cards, secondary text |
| `--color-photon` | `#ceff1a` | Accent highlights only |
| `--color-ia-nova` | `#cc4325` | Nav hover, CTA sales |

---

## Governance rules

1. **On-token sizes only.** Never use px values not in the scale above (e.g. 16px, 20px, 32px).
2. **No inline font-size on headings.** Always apply a `.type-*` class or DS token.
3. **Letter spacing must track size.** Larger size = tighter tracking (more negative). See table above.
4. **Line height must track size.** Larger display sizes use tighter line height (1.05 at 84px).
5. **Eye Brow is uppercase Inter, not mono.** *Changed in Core 2.0.* At eye-brow size IBM Plex Mono made compositions read clunky and heavy — mono's wide, even rhythm fights a label whose job is to sit quietly above a heading. Eye Brow is now Inter 500, uppercase, +0.3px tracking, `--text-subtle`. **Budget: one per section.** Index numbers (01/02/03) are Metropolis, sentence case. Dates, ranges, captions and statuses are Inter, sentence case. **Mono is never coloured, and never an eye brow.**

5a. **IBM Plex Mono is for code, data and deliberate decoration.** Code snippets, data-visualisation labels, numeric readouts — anywhere character alignment or the machine register is the point. Decorative use is allowed when it is deliberate and rare.

6. **Body copy uses Inter, not Metropolis.** Metropolis is Title + Display only.
7. **Minimum body size is 15px (Body/sm).** Do not set body text at 12px or 13px — DS violation.
8. **Responsive classes live in JSX `<style>` tag.** Do not put responsive class rules in `globals.css` — they will be silently dropped by Tailwind v4.
9. **`globals.css` is for `:root` tokens and element selectors only.** No custom class rules.
10. **Metropolis is loaded via `next/font/local`** in `layout.tsx`. Do not add `@font-face` for Metropolis in `globals.css` — it will be dropped by Tailwind v4.

---

## Known violations (as of 2026-04-13)

| Location | Issue | Status |
|----------|-------|--------|
| Carousel controls label (prev/next caption) | Was 12px — below Body/sm minimum | **Fixed** → 15px |
| Carousel play/pause button | Was 12px | **Fixed** → `.type-eyebrow` (15px) |

---

## Quick reference — adding new text elements

```tsx
// Eye Brow label
<p className="type-eyebrow" style={{ color: "rgba(251,251,251,0.52)" }}>
  SECTION LABEL
</p>

// Section heading
<h2 className="type-section-h2" style={{ color: "rgba(251,251,251,0.74)", fontFamily: "var(--font-display)" }}>
  Section Title
</h2>

// Body paragraph
<p className="type-body" style={{ color: "rgba(251,251,251,0.52)" }}>
  Body copy here.
</p>

// Believe / pull-quote statement
<p className="type-statement" style={{ color: "rgba(251,251,251,0.74)" }}>
  Large statement text here.
</p>
```
