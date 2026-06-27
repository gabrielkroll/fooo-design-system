import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

const baseSets = ["core", "semantic"];
const themes = ["light", "dark"];
const singleFileSource = "tokens/tokens.json";

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

if (existsSync(singleFileSource)) {
  await buildSingleSource();
} else {
  await Promise.all(themes.map(buildTheme));
}
