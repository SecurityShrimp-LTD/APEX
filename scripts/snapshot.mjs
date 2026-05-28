// Downloads the current Majestic Million top-domains list and writes the
// top N to data/top-domains.txt so the extension has a useful snapshot
// available on first install (before any host-permission grant or weekly
// refresh has happened). The snapshot is checked into the repo; re-run
// this script occasionally to refresh it.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const dataDir = resolve(root, 'data');
const outPath = resolve(dataDir, 'top-domains.txt');

const SOURCE_URL = 'https://downloads.majestic.com/majestic_million.csv';
const TOP_N = 20000;

console.log(`fetching ${SOURCE_URL}`);
const res = await fetch(SOURCE_URL);
if (!res.ok) {
  console.error(`HTTP ${res.status} fetching Majestic list`);
  process.exit(1);
}
const csv = await res.text();

// Majestic columns: GlobalRank,TldRank,Domain,TLD,RefSubNets,RefIPs,...
// We only need the Domain column from each ranked row.
const lines = csv.split('\n');
const domains = [];
for (let i = 1; i < lines.length && domains.length < TOP_N; i++) {
  const cols = lines[i].split(',');
  if (cols[2]) domains.push(cols[2]);
}

if (domains.length === 0) {
  console.error('parsed 0 domains — Majestic CSV format may have changed');
  process.exit(1);
}

await mkdir(dataDir, { recursive: true });
await writeFile(outPath, domains.join('\n') + '\n');
console.log(`wrote ${domains.length} domains to data/top-domains.txt`);
