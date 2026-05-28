'use strict';

// Minimal cross-browser shim for MV3.
//
// Chromium MV3 only exposes the `chrome` namespace, but its APIs are now
// promise-based natively (no callbacks required). Firefox exposes both
// `browser` and `chrome`. The source uses `browser.*` throughout, so on
// Chromium we just point `browser` at `chrome`. No polyfill needed.

if (typeof globalThis.browser === 'undefined' && typeof globalThis.chrome !== 'undefined') {
  globalThis.browser = globalThis.chrome;
}
