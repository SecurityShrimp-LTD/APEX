'use strict';

// Service worker entry point. Pulled in by both Chromium (service_worker)
// and Firefox (background.scripts) as configured in manifest.json.
//
// importScripts is synchronous, so by the time the listener registrations
// in background.js run, all dependencies are in place. This matters for
// MV3: listeners MUST be added at top-level on every service worker
// startup, or the browser will not wake the worker for those events.

importScripts(
  '../libraries/browser-polyfill.min.js',
  '../libraries/psl.min.js',
  '../libraries/punycode.min.js',
  '../functions.js',
  'domain_ranking.js',
  'background.js'
);
