// Copies vendored UMD library bundles from node_modules into libraries/.
// Keeping libraries/ in the source tree means a fresh clone can still be
// loaded unpacked into a browser without an npm install step. This script
// is what refreshes those files when a dependency is bumped in package.json.

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const libDir = resolve(root, 'libraries');

const copies = [
  ['node_modules/webextension-polyfill/dist/browser-polyfill.min.js', 'browser-polyfill.min.js'],
  ['node_modules/color-hash/dist/color-hash.js', 'color-hash.js'],
  ['node_modules/crc-32/crc32.js', 'crc32.js'],
  ['node_modules/@popperjs/core/dist/umd/popper.min.js', 'popper.min.js'],
  ['node_modules/psl/dist/psl.umd.cjs', 'psl.min.js'],
  ['node_modules/tippy.js/dist/tippy.umd.min.js', 'tippy.umd.min.js'],
  ['node_modules/tippy.js/dist/tippy.css', 'tippy.css']
];

await mkdir(libDir, { recursive: true });

for (const [from, to] of copies) {
  const src = resolve(root, from);
  const dst = resolve(libDir, to);
  await copyFile(src, dst);
  console.log(`copied ${from} -> libraries/${to}`);
}

// punycode v2.x ships as a CommonJS-only module (`module.exports = punycode`)
// with no UMD wrapper. The background script and content scripts expect a
// `punycode` global, so we wrap it ourselves at vendor time.
const punycodeSrc = await readFile(resolve(root, 'node_modules/punycode/punycode.js'), 'utf8');
const wrapped =
  `// Auto-wrapped from punycode v2.x to expose a 'punycode' global for classic-script use.\n` +
  `(function(){\n` +
  `var module = { exports: {} };\n` +
  `${punycodeSrc}\n` +
  `;(typeof self !== 'undefined' ? self : globalThis).punycode = module.exports;\n` +
  `})();\n`;
await writeFile(resolve(libDir, 'punycode.min.js'), wrapped);
console.log('wrapped node_modules/punycode/punycode.js -> libraries/punycode.min.js');
