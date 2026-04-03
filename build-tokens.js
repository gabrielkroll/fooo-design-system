import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

const baseSets = ["core", "semantic"];
const themes = ["light", "dark"];

function tokenFiles(setNames) {
  return setNames.map((setName) => `tokens/${setName}.json`);
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

await Promise.all(themes.map(buildTheme));
