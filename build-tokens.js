import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

const baseSets = ["core", "semantic"];
const themes = ["light", "dark"];
const singleFileSource = "tokens/tokens.json";

// Brand token sets live beside the core export. Each is exported from its own
// Figma library and builds independently, so a brand can ship without waiting
// on the others.
const brands = ["space", "seed", "agon"];

function tokenFiles(setNames) {
  return setNames.map((setName) => `tokens/${setName}.json`);
}

function stripFigmaMetadata(node) {
  if (Array.isArray(node)) {
    return node.map(stripFigmaMetadata);
  }

  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node)
        .filter(([key]) => key !== "$extensions")
        .map(([key, value]) => [key, stripFigmaMetadata(value)])
    );
  }

  return node;
}

function writeCleanJsonFile(inputPath, outputPath) {
  const input = JSON.parse(readFileSync(inputPath, "utf8"));
  const cleaned = stripFigmaMetadata(input);

  mkdirSync("dist/clean", { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(cleaned, null, 2)}\n`);
}

async function buildSingleSource() {
  const sd = new StyleDictionary({
    source: [singleFileSource],
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: "dist/css/",
        files: [
          {
            destination: "tokens.css",
            format: "css/variables"
          }
        ]
      },
      js: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: "dist/js/",
        files: [
          {
            destination: "tokens.json",
            format: "json/nested"
          }
        ]
      }
    }
  });

  await sd.buildAllPlatforms();
  writeCleanJsonFile(singleFileSource, "dist/clean/tokens.json");

  // Same source, prefixed. Brands inherit these names rather than copying the
  // values, so the ramp exists once.
  const core = new StyleDictionary({
    source: [singleFileSource],
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        prefix: "core",
        buildPath: "dist/css/",
        files: [{ destination: "core.css", format: "css/variables" }]
      }
    }
  });
  await core.buildAllPlatforms();
}

async function buildTheme(themeName) {
  const sd = new StyleDictionary({
    include: tokenFiles(baseSets),
    source: tokenFiles([themeName]),
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: "dist/css/",
        files: [
          {
            destination: `${themeName}.css`,
            format: "css/variables"
          }
        ]
      },
      js: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: "dist/js/",
        files: [
          {
            destination: `${themeName}.json`,
            format: "json/nested"
          }
        ]
      }
    }
  });

  await sd.buildAllPlatforms();
}

// ── Semantic layer ───────────────────────────────────────────────────────────
// The public API. Consumers use only these names; the generated ones underneath
// are Figma's and change whenever Figma does. A slot a brand does not have is
// omitted rather than aliased to something plausible — an empty slot invites
// misuse, which is how Space ended up with five sibling accents.

const SEMANTIC = {
  space: {
    accent:             "color-brand-photon",
    "accent-quiet":     "color-accents-photon-600-22",
    "accent-commerce":  "color-brand-ia-nova",
    "accent-editorial": "color-brand-m-type",
    "surface-0":        "color-brand-space",
    "surface-1":        "core:color-neutrals-on-dark-transperent-100-2",
    "surface-2":        "core:color-neutrals-on-dark-transperent-200-18",
    "text-1":           "core:color-text-on-dark-transperent-600-98",
    "text-2":           "core:color-text-on-dark-transperent-500-74",
    "text-3":           "core:color-text-on-dark-transperent-400-52",
    line:               "core:color-neutrals-on-dark-transperent-200-18"
  },
  agon: {
    accent:         "color-brand-signal",
    "accent-quiet": "color-brand-signal-deep",
    "accent-rest":  "color-brand-rest",
    "surface-0":    "color-brand-steel-black",
    "surface-1":    "core:color-neutrals-on-dark-opaque-100",
    "surface-2":    "core:color-neutrals-on-dark-opaque-200",
    // Agōn's text tops out at Chalk, not Lunar — one of its three overrides.
    "text-1":       "color-text-on-dark-opaque-600",
    "text-2":       "core:color-text-on-dark-opaque-500",
    "text-3":       "core:color-text-on-dark-opaque-400",
    line:           "core:color-neutrals-on-dark-opaque-200"
  },
  seed: {
    accent:         "color-brand-sprout",
    "accent-quiet": "color-accents-elm-200",
    "accent-deep":  "color-brand-elm",
    "surface-0":    "color-brand-pampas",
    "surface-1":    "core:color-neutrals-on-bright-transparent-100-4",
    "surface-2":    "core:color-neutrals-on-bright-transparent-200-22",
    "text-1":       "core:color-text-on-bright-transperent-550-98",
    "text-2":       "core:color-text-on-bright-transperent-500-80",
    "text-3":       "core:color-text-on-bright-transperent-400-63",
    line:           "core:color-neutrals-on-bright-transparent-200-22"
  }
};

// Not colour, and not in Figma: the interaction floors the DS documents.
const SEMANTIC_LITERALS = {
  "focus-width": "2px",
  "focus-offset": "2px",
  "target-min": "24px",
  "target-touch": "44px"
};

function writeSemanticLayer(brand) {
  const map = SEMANTIC[brand];
  if (!map) return false;

  const rows = Object.entries(map).map(([slot, generated]) => {
    const fromCore = generated.startsWith("core:");
    const name = fromCore ? generated.slice(5) : generated;
    return `  --${brand}-${slot}: var(--${fromCore ? "core" : brand}-${name});`;
  });

  rows.push(`  --${brand}-focus-ring: var(--${brand}-accent);`);
  for (const [slot, value] of Object.entries(SEMANTIC_LITERALS)) {
    rows.push(`  --${brand}-${slot}: ${value};`);
  }

  const out = `/**\n * ${brand} — semantic layer. Hand-mapped, generated file.\n *\n`
    + ` * This is the public API. Import this, not ${brand}.css: the names below are\n`
    + ` * stable, the ones they point at are Figma's and move when Figma moves.\n`
    + ` */\n\n@import "./core.css";\n@import "./${brand}.css";\n\n:root {\n${rows.join("\n")}\n}\n`;

  writeFileSync(`dist/css/${brand}.public.css`, out);

  // A mistyped generated name yields a var() that resolves to nothing and fails
  // silently in the browser. Fail the build instead.
  const generated = readFileSync(`dist/css/${brand}.css`, "utf8")
    + readFileSync("dist/css/core.css", "utf8");
  const defined = new Set([...generated.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]));
  const declared = new Set([...out.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]));
  const dangling = [...out.matchAll(/var\((--[\w-]+)\)/g)]
    .map((m) => m[1])
    .filter((name) => !defined.has(name) && !declared.has(name));

  if (dangling.length) {
    throw new Error(
      `${brand}.public.css references ${dangling.length} undefined token(s): ${dangling.join(", ")}. ` +
      `The generated name probably changed in Figma — update SEMANTIC in build-tokens.js.`
    );
  }
  return true;
}

async function buildBrand(brand) {
  const source = `tokens/${brand}.json`;
  const sd = new StyleDictionary({
    source: [source],
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: "dist/css/",
        files: [{ destination: `${brand}.css`, format: "css/variables" }]
      },
      js: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: "dist/js/",
        files: [{ destination: `${brand}.json`, format: "json/nested" }]
      }
    }
  });

  await sd.buildAllPlatforms();
  writeCleanJsonFile(source, `dist/clean/${brand}.json`);
  writeSemanticLayer(brand);
}

if (existsSync(singleFileSource)) {
  await buildSingleSource();
} else {
  await Promise.all(themes.map(buildTheme));
}

// Brands build on top of the core export, not instead of it.
const presentBrands = brands.filter((b) => existsSync(`tokens/${b}.json`));
await Promise.all(presentBrands.map(buildBrand));
if (presentBrands.length) {
  console.log(`\nbrands\n${presentBrands.map((b) => `✔︎ dist/css/${b}.css  +  ${b}.public.css`).join("\n")}`);
}
