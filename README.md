# FOOO Design System

Starter pipeline for syncing design tokens from Figma Tokens Studio into code.

Design system for Faba Origin and Open Orbit.

## What is included

- `tokens/`: source token files split into `core`, `semantic`, and theme overrides
- `build-tokens.js`: Style Dictionary build script using Tokens Studio transforms
- `dist/css/light.css` and `dist/css/dark.css`: generated CSS custom properties after build
- `dist/js/light.json` and `dist/js/dark.json`: generated JSON token outputs after build

## Recommended Figma structure

Use token sets in Tokens Studio that map cleanly to code:

- `core`: primitive scales like color palettes, spacing, radius, font size
- `semantic`: product-facing aliases like text, background, border, action
- `light`: light theme overrides
- `dark`: dark theme overrides

## How to use this pipeline

1. In Figma Tokens Studio, organize your tokens into the sets above.
2. Connect GitHub sync in Tokens Studio and use `tokens` as the storage location.
3. Keep your token files in the repo folder `tokens/`.
4. Install dependencies with `npm install`.
5. Build the outputs with `npm run build`.

## Output shape

- `dist/css/light.css`: CSS variables for the light theme
- `dist/css/dark.css`: CSS variables for the dark theme
- `dist/js/light.json`: nested JSON tokens for app consumption
- `dist/js/dark.json`: nested JSON tokens for app consumption

## Notes

- Keep primitives in `core` and reference them from `semantic`.
- Theme files should override semantic tokens instead of redefining primitives.
- Generated files in `dist/` should be treated as build artifacts.
- The current build script assumes one-dimensional theming with `light` and `dark` sets.
- In Tokens Studio GitHub sync, set `Token storage location` to `tokens`.

## Next good step

Once your real token export is in place, we can add:

- a Tailwind mapping layer
- a React package that consumes the CSS variables
- GitHub Actions to validate token builds on every change
