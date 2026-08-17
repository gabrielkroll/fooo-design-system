# Token pipeline — current state + constraints

Working notes for the FOOO → consumers token pipeline. Strategy and appetite live in
Obsidian (`ShapeUp/Ideas/fooo-token-pipeline`); this file is the technical state.

Status: **not built.** Nothing is wired. This is the audit that precedes the work.

## Current state

FOOO builds tokens and stops at `dist/`.

- `tokens/tokens.json` — Figma Tokens Studio export, the source
- `build-tokens.js` — Style Dictionary, emits `dist/{css,js,clean}`
- `docs/index.html` + `CNAME` — GitHub Pages → design.openorbit.studio
- `push-tokens.sh` — commits `tokens/` **into this repo**. Pushes nothing to consumers.

Consumers hold hardcoded literals, hand-copied:

| Consumer | Files holding token values | Naming scheme |
|---|---|---|
| `gabrielkroll-site` | `app/lib/tokens.ts`, `app/globals.css`, `app/page.tsx`, `app/components/CountUpMetrics.tsx`, `app/lib/work-data.ts` | `--color-photon`, `--neutral-100` |
| `OpenOrbitStudio/openorbit-site` | `app/lib/tokens.ts`, `app/globals.css` | same (near-duplicate of the above) |
| `mesoplus-site` | `index.html` (inline `<style>`, 26 defs) | `--space-text-dark-600` |
| `MesoPlus` (the app) | none — does not use FOOO | out of scope |

Example, `gabrielkroll-site/app/lib/tokens.ts`:

```ts
export const IaNova = "#cc4325";   // Ia Nova — sales / nav-hover accent
```

No import, no package dep, no symlink.

## The naming problem

FOOO's generated CSS custom properties look like this:

```css
--color-neutrals-on-bright-opaque-100
--color-neutrals-on-dark-transperent-500-74
```

No consumer uses any of these names. Overlap is zero. Note `transperent` — the typo is
baked into the generated name, which is the proof that raw Figma-derived names cannot be
the public API: one rename in Figma silently breaks every consumer.

So the pipeline needs a stable alias layer in FOOO, hand-authored over the generated
output:

```css
--space-photon: var(--color-brand-photon-500);
```

Figma churns behind it. Consumers only ever see the public names.

## Constraints to design around

**`tokens.ts` mixes two kinds of content.** Generatable hex/rgba values sit next to
hand-authored Tailwind utility strings — the `C` container system
(`"mx-auto w-[min(942px,calc(100%_-_48px))]"`), tier comments, the alignment-map notes.
Codegen must emit a **separate** file that `tokens.ts` imports from. Overwriting
`tokens.ts` wholesale destroys hand-authored work.

**Repo shape.** `FabaOrigin` has `.git` at root and nested `.git` in `gabrielkroll-site`,
`FOOO Design System`, `MesoPlus`, `mesoplus-site`, `permaculture-analyzer` — none
registered as submodules. No root `package.json`. Any cross-repo tooling has to account
for that. Consumer remotes are all separate GitHub repos.

**`mesoplus-site` has no build step** — plain `index.html`. A pull-at-build design does
not reach it.

## Options considered

Distribution, from laziest up:

1. **Extend `build-tokens.js` to write each consumer's generated file directly**, across
   sibling directories, and commit the output. No CI, no PAT, no packaging. Works because
   this is a solo machine with all repos checked out side by side. Fails if a build ever
   runs somewhere else.
2. **CI push** — GitHub Action here, on push to main, commits the generated file into each
   consumer repo via PAT. Reaches every consumer regardless of where builds run. One
   workflow file, one secret.
3. **Pull at build** — each consumer fetches on its own build. No PAT, but `mesoplus-site`
   has no build step, so it does not cover the field.

Rejected outright: npm package (packaging overhead for three consumers on one machine),
git submodules (five unregistered nested repos, this makes it worse), runtime `<link>` to
design.openorbit.studio (network dependency and FOUC in prod, and prod dies when Pages
does — fine for the docs site, not for consumers).

## Core → Brand architecture

Status: **planned, not built.** Nothing below has been created. Measured from Figma
2026-08-17 via the Plugin API, not assumed.

### What is actually there

Three separate Figma libraries, not one file with modes:

| Library | Collection | Vars | Holds |
|---|---|---|---|
| Core System (`gmFVm1cc…`) | `Primitives` | 102 | Neutrals 24 · Text 16 · Functional 30 · Size & Space 19 · Container 9 · Aspect Ratio 6. Plus 22 local text styles. |
| Space System | `Primitives` | 85 | All colour. Neutrals 24 · Text 16 · **Primary 26 · Brand 7 · Accents 6 · Secondary 6**. |
| Seed System | `Primitives` | 64 | All colour. Neutrals 24 · Text 16 · **Brand 6 · Primary 6 · Accents 6 · Secondary 6**. |
| Agōn | — | 0 | No Figma presence. It grew in code and is documented only on the DS site. |

### The problem, stated precisely

**The duplication is entirely in colour, and it is exactly the Neutrals and Text ramps.**
Space and Seed carry no sizes, containers or ratios — those exist only in Core — so the
geometric skeleton is already shared correctly and is not what needs fixing.

The shared portion is **40 rows in each brand** (Neutrals 24 + Text 16). Everything else is
genuinely brand-owned: 45 rows in Space, 24 in Seed. So the migration is 80 rows total, not
a rebuild — and Space's 26-row Primary scale is real content that stays where it is.

Three consequences:

1. **Nothing enforces the shared skeleton.** Because each brand holds its own copy rather
   than an alias, a neutral can be edited in one library and not the others, and no build
   step would notice. "Three brands, one skeleton" is currently a claim the data cannot
   back.
2. **All three collections are named `Primitives`.** Consuming two of them in one file
   makes the picker ambiguous.
3. **Agōn cannot inherit anything**, because it does not exist in Figma at all.

### Target

Core owns everything shared. A brand owns only what makes it that brand, and aliases Core
for the rest.

| Layer | Owns | Rows |
|---|---|---|
| **Core** | Geometry and the neutral system — the parts that must never diverge | Size & Space, Container, Aspect Ratio, Neutrals, Text ramp, Functional colour |
| **Space** | Brand hues + the semantic slots that point at them | 7 brand rows + `accent`, `accent-commerce`, `accent-quiet`, `focus-ring` |
| **Seed** | Same shape, its own hues | 6 brand rows + the same semantic slots |
| **Agōn** | Same shape, plus what only it has | Signal, Signal Bright, Signal Deep, Rest Core, Rest + `signal-rest` |

Everything structural in a brand library becomes an alias to Core. A Figma variable can
alias a variable imported from another library, so this works across files as they are
organised today — no consolidation into one file required.

**The semantic slots are the same rows as the alias layer** described under *The naming
problem* above. This refactor and that layer are one job: the Brand libraries become the
public API, and the build emits them. Doing this is what unblocks the consumer sites.

### Sequence

1. Rename the three collections `Core` / `Space` / `Seed` so the picker is unambiguous.
2. **Repair Core's `transperent/600 98`** to carry alpha (`#fbfbfbfa`, matching Space)
   before aliasing anything to it, or every brand inherits the flattened value.
3. In Space, replace each duplicated Neutrals/Text row with an alias to Core, one group at
   a time, checking bindings survive. 39 of 40 are byte-identical, so nothing should move
   visually; any shift that appears is drift worth catching.
4. Repeat for Seed, resolving its two exceptions as they come up.
5. Add the semantic slot rows to both.
6. Create the Agōn library last, from the values on the DS site, aliasing Core from the
   start so it never accrues a duplicate set.
7. Only then wire the build to emit the semantic layer.

### Drift, measured 2026-08-17

40 shared rows compared per brand, against Core. **Space: 39 of 40 identical. Seed: 38 of
40.** The ramps agree almost entirely, and every disagreement sits in the same place — the
brightest on-dark text rung.

**The opaque and translucent ramps are a deliberate pair, not a duplication.** They do
different jobs and both stay:

- **Translucent** — carries alpha so the surface beneath shines through. For overlays and
  anything that has to sit on varying ground. Its rendered colour, and therefore its
  contrast, is a function of what is behind it.
- **Opaque** — a solid value, true-tone grey. Renders identically on any surface. Use it
  when the tone must not shift.

Read against that rule, the drift is narrower and more specific than a value mismatch:

| Row | Core | Space | Seed | Reading |
|---|---|---|---|---|
| `Text/on-dark/opaque/600` | `#f6f6f6` | `#f6f6f6` | `#fbfbfb` | Seed forks. Which is the intended true tone? |
| `Text/on-dark/transperent/600 98` | **`#f6f6f6`** | `#fbfbfbfa` | absent | **Core's bug.** A translucent row holding an opaque value — `#f6f6f6` has no alpha, so nothing shines through it. Space is correct. |
| `Text/on-dark/transperent/600 100` | absent | absent | `#fbfbfb` | Seed's top-of-ramp at full alpha. Harmless; Core and Space simply stop at 98. |

So there is no alpha-vs-flattened decision to make — the system already answers it by
having both ramps. What there is, is one row in Core that was flattened by mistake and now
cannot do the job its name promises.

The `transperent` typo is present in all three libraries. Consistent, at least; fold the
rename into this migration rather than doing it separately.

### Risks

- **Step 2 is the one that can break published bindings.** Aliasing is safe in principle,
  but these are published libraries with consumers. One group first, verify, then continue.
- **Drift is now measured — see below.** Three rows need a decision before aliasing; the
  other 77 are byte-identical and safe.
- Agōn's palette currently has no authority outside the DS site. Creating it in Figma makes
  the site the source that seeds Figma, which is the reverse of every other flow here and
  should be a deliberate choice.

## Open questions

- Name ownership: rename in Figma, or alias layer here? (leaning alias layer)
- Distribution: option 1 or 2 above?
- ~~Do the three copies of the neutral ramp still agree?~~ **Measured 2026-08-17: yes, 39/40
  and 38/40.** The three exceptions all sit on the brightest on-dark text rung.
- Which is the intended true tone for `Text/on-dark/opaque/600` — Core and Space's
  `#f6f6f6`, or Seed's `#fbfbfb`? One of the three has to move.
- Does Agōn become a Figma library, or stay code-first and get emitted from the DS site?

## Adoption cost

Per-repo hex → var swaps are the long pole, not the plumbing. `gabrielkroll-site` and
`openorbit-site` carry near-identical `:root` blocks, so that is one diff applied twice.
`mesoplus-site` is 26 defs in one file.
