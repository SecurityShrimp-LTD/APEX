// Builds per-browser distributables.
//
// The working-tree manifest.json is Chrome-flavored (background.service_worker
// only) so `chrome://extensions/ → Load unpacked` works directly on a fresh
// clone. Firefox's service_worker support is pref-gated in shipped versions,
// so the Firefox zip rewrites background to use the classic `scripts` array.
//
// Output:
//   dist/chrome/                 staging dir, loadable via Load unpacked
//   dist/firefox/                staging dir, loadable via about:debugging
//   dist/<name>-chrome-<ver>.zip store-ready artifact
//   dist/<name>-firefox-<ver>.zip store-ready artifact

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const distDir = resolve(root, 'dist');

const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
const slug = 'securityshrimp-anti-phishing-extension';
const version = manifest.version;

// Files copied into each browser staging dir. Anything not listed is left out.
// Files copied into each browser staging dir. Anything not listed is left
// out — this also excludes tests/, scripts/, node_modules/, .git/, etc.
const sourceEntries = [
  'manifest.json',
  'functions.js',
  'website_info.js',
  'website_info.css',
  'LICENSE',
  'README.md',
  'background',
  'content_scripts',
  'data',
  'images',
  'libraries',
  'options',
  'popup'
];

const firefoxBackgroundScripts = [
  'libraries/browser-shim.js',
  'libraries/psl.min.js',
  'libraries/punycode.min.js',
  'functions.js',
  'background/domain_ranking.js',
  'background/background.js'
];

mkdirSync(distDir, { recursive: true });

for (const browser of ['chrome', 'firefox']) {
  const stage = resolve(distDir, browser);
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });

  for (const entry of sourceEntries) {
    cpSync(resolve(root, entry), resolve(stage, entry), { recursive: true });
  }

  if (browser === 'firefox') {
    const ffManifest = structuredClone(manifest);
    delete ffManifest.background.service_worker;
    ffManifest.background.scripts = firefoxBackgroundScripts;
    writeFileSync(
      resolve(stage, 'manifest.json'),
      JSON.stringify(ffManifest, null, 2) + '\n'
    );
  }

  const zipName = `${slug}-${browser}-${version}.zip`;
  const zipPath = resolve(distDir, zipName);
  rmSync(zipPath, { force: true });
  execFileSync('zip', ['-r', zipPath, '.'], { cwd: stage, stdio: 'inherit' });
  console.log(`built ${zipName}`);
}
