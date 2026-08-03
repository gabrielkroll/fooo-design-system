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

## Open questions

- Name ownership: rename in Figma, or alias layer here? (leaning alias layer)
- Distribution: option 1 or 2 above?

## Adoption cost

Per-repo hex → var swaps are the long pole, not the plumbing. `gabrielkroll-site` and
`openorbit-site` carry near-identical `:root` blocks, so that is one diff applied twice.
`mesoplus-site` is 26 defs in one file.
