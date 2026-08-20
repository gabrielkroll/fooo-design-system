/**
 * Extracts real Iconoir path data for the Core → 13 Iconography specimens.
 *
 * The docs site has no build step, so the specimen paths are inlined into
 * library.html by hand. This script produces that data from the installed
 * package so the glyphs are always the real ones — a hand-drawn icon is a
 * wrong icon, and a wrong icon in the icon documentation is worse than none.
 *
 *   npm i -D iconoir && node scripts/gen-icons.js
 *
 * Then paste the printed object into the ICONS.sets literal in
 * docs/library.html and update ICONS.version to match package.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'node_modules', 'iconoir', 'icons', 'regular');

// Inner markup only — the <svg> wrapper is authored in the page so every
// specimen shares one set of attributes.
function inner(name) {
  return fs.readFileSync(path.join(DIR, `${name}.svg`), 'utf8')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const SETS = {
  navigation: ['arrow-left', 'arrow-right', 'arrow-up-right', 'nav-arrow-down',
               'nav-arrow-right', 'menu', 'xmark', 'open-new-window'],
  action:     ['plus', 'minus', 'check', 'search', 'download', 'page-edit',
               'design-pencil', 'tools'],
  object:     ['media-image', 'bubble-search', 'lifebelt', 'github', 'linkedin',
               'skateboarding', 'hexagon-dice', 'rocket'],
};

const missing = Object.values(SETS).flat()
  .filter(n => !fs.existsSync(path.join(DIR, `${n}.svg`)));
if (missing.length) {
  // Iconoir has dropped whole families between majors — fail loudly rather
  // than ship a gap in the grid.
  throw new Error(`not in this iconoir version: ${missing.join(', ')}`);
}

const sets = Object.entries(SETS).map(([group, names]) => ({
  group,
  icons: names.map(n => ({ name: n, inner: inner(n) })),
}));

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'iconoir', 'package.json'), 'utf8')
);
console.log(`// iconoir ${pkg.version} — ${fs.readdirSync(DIR).length} regular icons`);
console.log(JSON.stringify(sets));
