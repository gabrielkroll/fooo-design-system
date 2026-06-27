# FOOO Design System

Starter pipeline for moving design tokens from Figma into code.

Design system for Faba Origin and Open Orbit.

## Pipeline

Figma Variables -> export JSON -> GitHub `tokens/` -> code build pipeline

## Principles

- GitHub `tokens/` is the source of truth for code and version history
- Figma is the authoring environment
- Tokens are stored as JSON, not hidden inside a plugin workflow
- The build pipeline should keep working even if the authoring tool changes

## Constraints

- Figma Professional, not Enterprise
- No full Variables API write automation back into Figma
- Tokens Studio free plan remote sync limitations
- Need a practical Figma-to-code flow without repeated manual copy/paste

## What is included

- `tokens/`: source token JSON files committed to GitHub
- `build-tokens.js`: Style Dictionary build script using Tokens Studio transforms
- `dist/css/tokens.css` or themed CSS outputs: generated CSS custom properties after build
- `dist/js/tokens.json` or themed JSON outputs: generated JSON token outputs after build
- `dist/clean/tokens.json`: metadata-stripped token JSON for app consumption
- `push-tokens.sh`: helper script to commit and push updated token files

## Recommended token structure

You can use either of these:

- `tokens/tokens.json`: a single exported Figma token file
- `tokens/core.json`, `tokens/semantic.json`, `tokens/light.json`, `tokens/dark.json`: a split multi-file setup for theming

## Workflow

1. Author or maintain tokens in Figma.
2. Export token JSON and place it in [`tokens/tokens.json`](/Users/hof/FabaOrigin/FOOO%20Design%20System/tokens/tokens.json), or keep a split multi-file setup in [`tokens/`](/Users/hof/FabaOrigin/FOOO%20Design%20System/tokens).
3. Run `npm run build` to generate code-ready outputs.
4. Commit and push the updated token files to GitHub.

## Committing token updates

Use the helper script when only token JSON changed:

```bash
npm run tokens:push
```

Or run the git commands manually:

```bash
git add tokens/
git commit -m "Update tokens from Figma"
git push
```

## Output shape

- `dist/css/tokens.css`: CSS variables for a single exported token file
- `dist/js/tokens.json`: nested JSON tokens for app consumption
- `dist/clean/tokens.json`: raw token structure with Figma-only `$extensions` removed
- `dist/css/light.css` and `dist/css/dark.css`: themed outputs when using split token files
- `dist/js/light.json` and `dist/js/dark.json`: themed JSON outputs when using split token files

## Notes

- A single `tokens/tokens.json` export is the simplest path for getting started.
- Split token files are better when you want explicit theme layering in code.
- Generated files in `dist/` should be treated as build artifacts.
- The `tokens/` folder is the part that should be versioned and shared with GitHub.
- Keep the Figma export in `tokens/` as the raw source of truth.
- Use `dist/clean/tokens.json` when you want a lean JSON file for engineering consumption.

## Next good step

Once your real token export is in place, we can add:

- a Tailwind mapping layer
- a React package that consumes the CSS variables
- GitHub Actions to validate token builds on every change
